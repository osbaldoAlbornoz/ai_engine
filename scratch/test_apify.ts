import { ApifyClient } from 'apify-client';

const APIFY_TOKEN = process.env.APIFY_TOKEN;
const apifyClient = new ApifyClient({ token: APIFY_TOKEN });

async function main() {
  const input = {
    categoryOrProductUrls: [{ url: "https://www.amazon.com/dp/B0BH8MK76C" }],
    maxItemsPerStartUrl: 1,
    proxyConfiguration: {
      useApifyProxy: true
    }
  };

  console.log('Running actor...');
  const run = await apifyClient.actor("junglee/amazon-crawler").call(input);
  
  const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
  console.log(JSON.stringify(items[0], null, 2));
}

main();
