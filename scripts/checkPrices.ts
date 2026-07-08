import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);

async function checkPrices() {
  const { data } = await supabase.from('products').select('name, price, amazon_asin');
  if (data) {
    for (const d of data) {
      console.log(`${d.price} | ${d.amazon_asin} | ${d.name.substring(0, 40)}`);
    }
  }
}
checkPrices();
