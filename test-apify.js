
const { ApifyClient } = require('apify-client');

async function main() {
  try {
    const APIFY_TOKEN = process.env.APIFY_TOKEN;
    if (!APIFY_TOKEN) throw new Error("No token");
    
    console.log("Token:", APIFY_TOKEN.substring(0, 10) + "...");
    
    const apifyClient = new ApifyClient({ token: APIFY_TOKEN });
    const uniqueAsins = ['B0C8ZMH6D3']; // AMD Ryzen 9 8945HS
    
    console.log("Calling actor...");
    const run = await apifyClient.actor("junglee/amazon-crawler").call({
      categoryOrProductUrls: uniqueAsins.map((asin) => ({ url: `https://www.amazon.com/dp/${asin}` })),
      maxItemsPerStartUrl: 1,
      scrapeProductVariantPrices: false,
      scrapeCustomerReviews: false,
      scrapeProductDetails: true,
      proxy: {
        useApifyProxy: true,
        apifyProxyGroups: ["RESIDENTIAL"]
      }
    });

    console.log(`Apify run finished. Dataset ID: ${run.defaultDatasetId}`);
    
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
    console.log("Items:", JSON.stringify(items, null, 2));
  } catch (err) {
    console.error("Test failed:", err);
  }
}

main();
