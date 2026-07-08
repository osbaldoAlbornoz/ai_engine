import { ApifyClient } from 'apify-client';
import { createClient } from '@supabase/supabase-js';

const APIFY_TOKEN = process.env.APIFY_TOKEN;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
    .select('id, amazon_asin, name, price, specs')
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
    console.log(`Calling Apify Actor (junglee/amazon-crawler) for ${searchUrls.length} items...`);
    const run = await apifyClient.actor("junglee/amazon-crawler").call(input);
    
    console.log(`Actor finished. Fetching dataset: ${run.defaultDatasetId}`);
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
    
    console.log(`Apify returned ${items.length} items. Mapping results...`);
    
    // Map results by ASIN for easy lookup
    const scrapedData = new Map<string, { price: number, found: boolean, specs: Record<string, string> }>();
    
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
        specs
      });
    }

    // 3. Compare and Update Database
    let updatedCount = 0;
    let deactivatedCount = 0;

    for (const product of activeProducts) {
      if (!product.amazon_asin) continue;

      const scrapeResult = scrapedData.get(product.amazon_asin);
      
      if (scrapeResult && scrapeResult.price > 0) {
        // Product found and has a valid price
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
      } else if (scrapeResult) {
        // Product was scraped but no valid price was found.
        // It could be out of stock, or the page layout could be different (e.g. combos).
        // Instead of aggressively deactivating, we just log a warning for manual review.
        console.warn(`[WARNING] Product ${product.name} (ASIN: ${product.amazon_asin}) returned no valid price from Apify. Please check Amazon page manually.`);
      } else {
        // Apify didn't return this ASIN at all. It might have failed to load or got blocked.
        console.warn(`[WARNING] Product ${product.name} (ASIN: ${product.amazon_asin}) was missing from Apify results. Crawler might have skipped it.`);
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
