import { ApifyClient } from 'apify-client';
import { createClient } from '@supabase/supabase-js';

const APIFY_TOKEN = process.env.APIFY_TOKEN;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const AFFILIATE_TAG = process.env.AMAZON_AFFILIATE_TAG || 'tu-tag-20';

if (!APIFY_TOKEN || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing required environment variables. Please check your .env.local file.");
  console.error("Make sure APIFY_TOKEN, NEXT_PUBLIC_SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY are set.");
  process.exit(1);
}

const apifyClient = new ApifyClient({ token: APIFY_TOKEN });
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface ScrapeOptions {
  category: string;
  searchUrls: string[];
  maxItems?: number;
}

async function scrapeAmazon({ category, searchUrls, maxItems = 10 }: ScrapeOptions) {
  console.log(`Starting scrape for category: ${category}`);
  
  const input = {
    categoryOrProductUrls: searchUrls.map(url => ({ url })),
    maxItemsPerStartUrl: maxItems,
    proxyConfiguration: {
      useApifyProxy: true
    }
  };

  try {
    console.log(`Calling Apify Actor (junglee/amazon-crawler)...`);
    // Run the actor and wait for it to finish
    const run = await apifyClient.actor("junglee/amazon-crawler").call(input);
    
    console.log(`Actor finished. Fetching dataset: ${run.defaultDatasetId}`);
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
    
    console.log(`Found ${items.length} items. Formatting for Supabase...`);
    
    for (const item of items) {
      if (!item.asin || !item.title) continue;
      
      // Basic price cleaning
      let priceVal = 0;
      if (typeof item.price === 'object' && item.price !== null && 'value' in item.price) {
        priceVal = Number(item.price.value);
      } else {
        const priceStr = String(item.price || '0').replace(/[^0-9.]/g, '');
        priceVal = parseFloat(priceStr);
      }
      
      let originalPriceVal = null;
      if (typeof item.originalPrice === 'object' && item.originalPrice !== null && 'value' in item.originalPrice) {
        originalPriceVal = Number(item.originalPrice.value);
      } else if (item.originalPrice) {
        const originalPriceStr = String(item.originalPrice).replace(/[^0-9.]/g, '');
        originalPriceVal = parseFloat(originalPriceStr);
      }
      
      const price = priceVal || 0;
      const originalPrice = originalPriceVal || null;
      
      // Clean up the URL and add affiliate tag
      const amazonUrl = `https://www.amazon.com/dp/${item.asin}?tag=${AFFILIATE_TAG}`;
      
      const features = Array.isArray(item.features) ? item.features : [];
      let specs: Record<string, string> = {};
      if (item.productInformation) specs = { ...specs, ...item.productInformation };
      if (item.specifications) specs = { ...specs, ...item.specifications };
      if (Array.isArray(item.attributes)) {
        item.attributes.forEach((attr: any) => {
          if (attr.key && attr.value) {
            specs[attr.key] = attr.value;
          }
        });
      }
      
      const brand = item.brand || 'Unknown';
      
      // Prioritize high-res image if available
      const imageUrl = item.highResImage || item.thumbnailImage || item.image || '';

      // Guard against cross-category contamination (e.g. CPUs scraped as workstations)
      const finalCategory = inferCategory(category, String(item.title), specs);
      
      const product = {
        amazon_asin: item.asin,
        name: item.title,
        category: finalCategory,
        brand: brand,
        price: price > 0 ? price : 0, // Fallback to 0 if parsing failed
        original_price: originalPrice,
        amazon_url: amazonUrl,
        image_url: imageUrl,
        features: features,
        specs: specs,
        status: 'active'
      };

      console.log(`Upserting ${product.name.substring(0, 50)}... [category: ${finalCategory}]`);
      
      const { error } = await supabase
        .from('products')
        .upsert(product, { onConflict: 'amazon_asin' });
        
      if (error) {
        console.error(`Error inserting ${product.amazon_asin}:`, error.message);
      } else {
        console.log(`Successfully saved ${product.amazon_asin}`);
      }
    }
    
    console.log("Scraping and DB insertion complete!");

  } catch (error) {
    console.error("Scraping failed:", error);
  }
}

// Simple CLI argument handling
const args = process.argv.slice(2);
const category = args[0];

if (!category) {
  console.log("Usage: npx tsx --env-file=.env.local scripts/scrapeAmazon.ts <category>");
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH CONFIGS
// Use specific product-type keywords to minimise cross-category contamination.
// Amazon category filters (node IDs) are added where available.
// ─────────────────────────────────────────────────────────────────────────────
const SEARCH_CONFIGS: Record<string, string[]> = {
  gpus: [
    "https://www.amazon.com/s?k=RTX+4090+graphics+card&rh=n%3A284822",       // Electronics > Computer Video Cards
    "https://www.amazon.com/s?k=RTX+4080+GPU+graphics+card&rh=n%3A284822",
  ],
  laptops: [
    "https://www.amazon.com/s?k=AI+laptop+RTX+4080&rh=n%3A565108",           // Laptops
    "https://www.amazon.com/s?k=gaming+laptop+RTX+4070&rh=n%3A565108",
  ],
  npus: [
    // Use the Desktop CPUs category (n=229189) so processors stay as CPUs, not PCs
    "https://www.amazon.com/s?k=Ryzen+AI+9+processor+CPU&rh=n%3A229189",
    "https://www.amazon.com/s?k=Intel+Core+Ultra+CPU+processor&rh=n%3A229189",
  ],
  workstations: [
    // Use Desktop Computers category + explicit "workstation" keyword (not CPU keywords)
    "https://www.amazon.com/s?k=AMD+workstation+desktop+computer&rh=n%3A565088",
    "https://www.amazon.com/s?k=Intel+Xeon+workstation+desktop+PC&rh=n%3A565088",
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY GUARD
// Amazon search is not perfect — a workstation query can return standalone CPUs.
// This function reads the scraped specs and infers the TRUE category so we
// never save a CPU/processor as a "workstation" (or vice-versa).
// ─────────────────────────────────────────────────────────────────────────────
function inferCategory(
  intendedCategory: string,
  title: string,
  specs: Record<string, string>
): string {
  const t = title.toLowerCase();
  const builtIn = (specs["Built-In Media"] || "").toLowerCase();
  const pcDesignType = (specs["Personal Computer Design Type"] || "").toLowerCase();
  const processorCount = specs["Processor Count"] ? parseInt(specs["Processor Count"]) : null;

  // Hard signals that this is a bare CPU/processor — NOT a complete system
  const isBareProcessor =
    builtIn === "item" ||                          // Amazon tags standalone CPUs as "Item"
    t.includes("processor box") ||
    t.includes("oem tray") ||
    (t.match(/\b(ryzen|threadripper|xeon|core i[0-9]|core ultra)\b/) !== null &&
      !t.includes("workstation") &&
      !t.includes("desktop") &&
      !t.includes("tower") &&
      !t.includes("pc") &&
      !t.includes("system") &&
      pcDesignType === "" &&                       // Complete PCs always have this field
      processorCount !== null && processorCount <= 1 // Bare CPUs report count as 1 unit
    );

  // Hard signals that this is a complete workstation/desktop system
  const isCompleteSystem =
    pcDesignType.includes("tower") ||
    pcDesignType.includes("desktop") ||
    t.includes("workstation") ||
    t.includes("desktop") ||
    t.includes("tower");

  if (isBareProcessor) {
    // It's a CPU — map to the right category
    if (intendedCategory === "workstations" || intendedCategory === "npus") {
      console.warn(`[AUTO-RECLASSIFY] "${title.substring(0, 60)}" detected as bare CPU → saving as "npus" instead of "${intendedCategory}"`);
      return "npus";
    }
  }

  if (isCompleteSystem && intendedCategory === "npus") {
    console.warn(`[AUTO-RECLASSIFY] "${title.substring(0, 60)}" detected as complete system → saving as "workstations" instead of "npus"`);
    return "workstations";
  }

  return intendedCategory;
}

const urls = SEARCH_CONFIGS[category];
if (!urls) {
  console.error(`Unknown category: ${category}. Valid options: ${Object.keys(SEARCH_CONFIGS).join(', ')}`);
  process.exit(1);
}

scrapeAmazon({
  category: category,
  searchUrls: urls,
  maxItems: 12 // Increased to fetch enough items to fill a page
});

