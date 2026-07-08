import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function deleteGpus() {
  console.log("Deleting all products with category = 'gpus'...");
  const { data, error } = await supabase
    .from('products')
    .delete()
    .eq('category', 'gpus');
    
  if (error) {
    console.error("Error deleting gpus:", error.message);
  } else {
    console.log("Successfully deleted all gpus.");
  }
}

deleteGpus();
