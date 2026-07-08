import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);

async function main() {
  // Update the 5070 and 4090 prices manually to fix the immediate issue
  
  // 5070
  await supabase
    .from('products')
    .update({ price: 699.99 })
    .eq('amazon_asin', 'B0DTQMLX4F');
    
  // 4090
  await supabase
    .from('products')
    .update({ price: 1899.99 })
    .eq('amazon_asin', 'B0BH8MK76C');
    
  console.log("Prices updated for items that were 0.");
}

main();
