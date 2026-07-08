import { ApifyClient } from 'apify-client';
import { createClient } from '@supabase/supabase-js';

const APIFY_TOKEN = process.env.APIFY_TOKEN;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

const apifyClient = new ApifyClient({ token: APIFY_TOKEN });
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
  const { data } = await supabase.from('products').select('*').eq('amazon_asin', 'B0GGMFPWZZ');
  console.log('DB data for B0GGMFPWZZ:', JSON.stringify(data, null, 2));

  const input = {
    categoryOrProductUrls: [{ url: 'https://www.amazon.com/dp/B0GGMFPWZZ' }],
    maxItemsPerStartUrl: 1,
    proxyConfiguration: { useApifyProxy: true }
  };
  const run = await apifyClient.actor('junglee/amazon-crawler').call(input);
  const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
  console.log('Apify items for B0GGMFPWZZ:', JSON.stringify(items, null, 2));
}

check();
