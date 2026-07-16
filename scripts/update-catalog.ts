import { ApifyClient } from 'apify-client';
import { createClient } from '@supabase/supabase-js';
import { calculateAIScore } from '../src/utils/scoring';

const APIFY_TOKEN = process.env.APIFY_TOKEN;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Timeout for Apify calls (1 hour default)
const APIFY_TIMEOUT_MS = 60 * 60 * 1000;

async function scrapeWithTimeout(actor: any, input: any, timeoutMs: number = APIFY_TIMEOUT_MS) {
  return Promise.race([
    actor.call(input),
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error(`Apify timeout after ${timeoutMs / 1000} seconds`)), timeoutMs)
    )
  ]);
}

if (!APIFY_TOKEN || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing required environment variables. Please check your .env.local file.");
  console.error("Make sure APIFY_TOKEN, NEXT_PUBLIC_SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY are set.");
  process.exit(1);
}

const apifyClient = new ApifyClient({ token: APIFY_TOKEN });
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function updateCatalog() {
  console.log("Starting catalog update...");

  // 1. Fetch all currently active products from Supabase
  const { data: activeProducts, error: fetchError } = await supabase
    .from('products')
    .select('id, amazon_asin, name, price, specs, category, ai_score')
    .eq('status', 'active');

  if (fetchError) {
    console.error("Error fetching products from database:", fetchError);
    return;
  }

  if (!activeProducts || activeProducts.length === 0) {
    console.log("No active products found in the database to update.");
    return;
  }

  console.log(`Found ${activeProducts.length} active products to check.`);

  // 2. Prepare Amazon URLs for Apify
  // We'll use ASINs to construct URLs.
  const searchUrls = activeProducts
    .filter(p => p.amazon_asin)
    .map(p => `https://www.amazon.com/dp/${p.amazon_asin}`);

  if (searchUrls.length === 0) {
    console.log("None of the active products have an amazon_asin. Aborting.");
    return;
  }

  const input = {
    categoryOrProductUrls: searchUrls.map(url => ({ url })),
    maxItemsPerStartUrl: 1, // We only want exactly the product we asked for
    proxyConfiguration: {
      useApifyProxy: true
    }
  };

  try {
    console.log(`Calling Apify Actor (junglee/amazon-crawler) for ${searchUrls.length} items with ${APIFY_TIMEOUT_MS / 1000}s timeout...`);
    const run = await scrapeWithTimeout(apifyClient.actor("junglee/amazon-crawler"), input, APIFY_TIMEOUT_MS);
    
    console.log(`Actor finished. Fetching dataset: ${run.defaultDatasetId}`);
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
    
    console.log(`Apify returned ${items.length} items. Mapping results...`);
    
    // Map results by ASIN for easy lookup
    const scrapedData = new Map<string, { price: number, found: boolean, specs: Record<string, string>, itemRaw?: any }>();
    
    for (const item of items) {
      if (!item.asin) continue;
      
      let priceVal = 0;
      if (typeof item.price === 'object' && item.price !== null && 'value' in item.price) {
        priceVal = Number(item.price.value);
      } else {
        const priceStr = String(item.price || '0').replace(/[^0-9.]/g, '');
        priceVal = parseFloat(priceStr);
      }
      
      let specs: Record<string, string> = {};
      if (item.productInformation && typeof item.productInformation === 'object') specs = { ...specs, ...(item.productInformation as Record<string, string>) };
      if (item.specifications && typeof item.specifications === 'object') specs = { ...specs, ...(item.specifications as Record<string, string>) };
      if (Array.isArray(item.attributes)) {
        item.attributes.forEach((attr: any) => {
          if (attr.key && attr.value) {
            specs[attr.key] = attr.value;
          }
        });
      }
      
      scrapedData.set(item.asin as string, {
        price: priceVal || 0,
        found: true,
        specs,
        itemRaw: item
      });
    }

    // 3. Compare and Update Database
    let updatedCount = 0;
    let deactivatedCount = 0;

    for (const product of activeProducts) {
      if (!product.amazon_asin) continue;

      const scrapeResult = scrapedData.get(product.amazon_asin);
      
      if (scrapeResult) {
        // Check availability strings from Apify
        const availabilityStr = String(scrapeResult.itemRaw.availability || '').toLowerCase();
        const isExplicitlyUnavailable = availabilityStr.includes('currently unavailable') || 
                                        availabilityStr.includes('out of stock') ||
                                        scrapeResult.itemRaw.inStock === false;

        if (isExplicitlyUnavailable) {
          console.log(`Deactivating ${product.name} - Explicitly out of stock or unavailable.`);
          await supabase.from('products').update({ status: 'inactive' }).eq('id', product.id);
          deactivatedCount++;
          continue;
        }

        // Product is active and not explicitly out of stock. Update price and specs.
        let updates: any = { updated_at: new Date().toISOString() };
        let hasUpdates = false;

        if (scrapeResult.price !== product.price) {
          console.log(`Updating price for ${product.name}: $${product.price} -> $${scrapeResult.price}`);
          updates.price = scrapeResult.price;
          hasUpdates = true;
        }

        const productSpecs = typeof product.specs === 'object' && product.specs !== null ? product.specs : {};
        if (Object.keys(productSpecs).length === 0 && Object.keys(scrapeResult.specs).length > 0) {
          console.log(`Backfilling specs for ${product.name}`);
          updates.specs = scrapeResult.specs;
          hasUpdates = true;
        }

        // Calculate and update AI score
        const productForScoring = {
          name: product.name,
          category: product.category,
          specs: updates.specs || productSpecs,
          price: updates.price || product.price
        };
        const newScore = calculateAIScore(productForScoring);
        if (newScore !== product.ai_score) {
          console.log(`Updating AI score for ${product.name}: ${product.ai_score} -> ${newScore}`);
          updates.ai_score = newScore;
          hasUpdates = true;
        }

        if (hasUpdates) {
          const { error: updateError } = await supabase
            .from('products')
            .update(updates)
            .eq('id', product.id);
            
          if (updateError) {
            console.error(`Failed to update ${product.amazon_asin}:`, updateError);
          } else {
            updatedCount++;
          }
        } else {
          console.log(`No updates needed for ${product.name}`);
        }
      } else {
        // Apify didn't return this ASIN at all. 
        if (items.length > 0) {
           // If we got results for other items, this one is likely 404 or completely removed.
           console.log(`Deactivating ${product.name} (ASIN: ${product.amazon_asin}) - Not found in Apify results (likely 404 or removed).`);
           await supabase.from('products').update({ status: 'inactive' }).eq('id', product.id);
           deactivatedCount++;
        } else {
           console.warn(`[WARNING] Product ${product.name} (ASIN: ${product.amazon_asin}) was missing, but total scraped items was 0 (possible crawler failure). Keeping active.`);
        }
      }
    }

    console.log("Catalog update complete!");
    console.log(`Prices updated: ${updatedCount}`);
    console.log(`Products marked inactive: ${deactivatedCount}`);

  } catch (error) {
    console.error("Error during catalog update:", error);
  }
}

updateCatalog();
