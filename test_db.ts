
import { createClient } from "@supabase/supabase-js";
import { calculateAIScore } from "./src/utils/scoring";
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from("products").select("*");
  if (error) { console.error(error); return; }
  
  for (const dbProd of data) {
    const p = {
        id: dbProd.id,
        name: dbProd.name,
        category: dbProd.category === "gpus" ? "GPU" : "Unknown",
        specs: typeof dbProd.specs === "object" && dbProd.specs !== null ? dbProd.specs : {},
    };
    if (p.category === "GPU") {
        console.log(`[${dbProd.name}] -> raw category: ${dbProd.category}, mapped: ${p.category}`);
        console.log(`Specs:`, p.specs);
        console.log(`Score:`, calculateAIScore(p));
    }
  }
}
run();

