import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);

async function main() {
  const { data, error } = await supabase
    .from('products')
    .select('amazon_asin, name, price, original_price')
    .ilike('name', '%gigabyte%');
  
  if (error) {
    console.error('Error fetching data:', error);
  } else {
    console.log(data);
  }
}

main();
