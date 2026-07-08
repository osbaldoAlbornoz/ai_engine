import { NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';
import { createClient } from '@supabase/supabase-js';

// Add export const maxDuration = 300; to allow for Vercel Pro max duration (5 mins)
export const maxDuration = 300;

export async function GET(request: Request) {
  try {
    // Add simple authentication to prevent unauthorized execution
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const APIFY_TOKEN = process.env.APIFY_TOKEN;
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!APIFY_TOKEN || !SUPABASE_URL || !SUPABASE_KEY) {
      return NextResponse.json({ error: "Missing required environment variables." }, { status: 500 });
    }

    const apifyClient = new ApifyClient({ token: APIFY_TOKEN });
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    console.log("Starting cron catalog update...");

    // 1. Fetch all currently active products from Supabase
    const { data: activeProducts, error: fetchError } = await supabase
      .from('products')
      .select('id, amazon_asin, name, price, specs')
      .eq('status', 'active');

    if (fetchError) {
      console.error("Error fetching products:", fetchError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!activeProducts || activeProducts.length === 0) {
      return NextResponse.json({ message: "No active products to update." });
    }

    // 2. Prepare Amazon URLs for Apify
    const searchUrls = activeProducts
      .filter(p => p.amazon_asin)
      .map(p => `https://www.amazon.com/dp/${p.amazon_asin}`);

    if (searchUrls.length === 0) {
      return NextResponse.json({ message: "No ASINs found." });
    }

    const input = {
      categoryOrProductUrls: searchUrls.map(url => ({ url })),
      maxItemsPerStartUrl: 1,
      proxyConfiguration: {
        useApifyProxy: true
      }
    };

    console.log(`Calling Apify Actor for ${searchUrls.length} items...`);
    const run = await apifyClient.actor("junglee/amazon-crawler").call(input);
    
    console.log(`Actor finished. Fetching dataset: ${run.defaultDatasetId}`);
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
    
    // Map results by ASIN
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

    for (const product of activeProducts) {
      if (!product.amazon_asin) continue;

      const scrapeResult = scrapedData.get(product.amazon_asin);
      
      if (scrapeResult && scrapeResult.price > 0) {
        let updates: any = { updated_at: new Date().toISOString() };
        let hasUpdates = false;

        if (scrapeResult.price !== product.price) {
          updates.price = scrapeResult.price;
          hasUpdates = true;
        }

        const productSpecs = typeof product.specs === 'object' && product.specs !== null ? product.specs : {};
        if (Object.keys(productSpecs).length === 0 && Object.keys(scrapeResult.specs).length > 0) {
          updates.specs = scrapeResult.specs;
          hasUpdates = true;
        }

        if (hasUpdates) {
          const { error: updateError } = await supabase
            .from('products')
            .update(updates)
            .eq('id', product.id);
            
          if (!updateError) {
            updatedCount++;
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Catalog updated successfully", 
      itemsUpdated: updatedCount 
    });

  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
