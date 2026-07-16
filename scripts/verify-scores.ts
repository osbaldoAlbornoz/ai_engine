/**
 * Script para verificar que los ai_score se guardaron correctamente en Supabase
 * Ejecutar con: npx tsx scripts/verify-scores.ts
 */

import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

async function verifyScores() {
  console.log("🔍 Verificando ai_score en Supabase...\n");

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, category, ai_score")
    .order("category", { ascending: true })
    .order("ai_score", { ascending: false });

  if (error) {
    console.error("❌ Error:", error.message);
    return;
  }

  if (!products || products.length === 0) {
    console.log("⚠️ No hay productos");
    return;
  }

  let nullCount = 0;
  let withScore = 0;

  console.log(`📦 Total productos: ${products.length}\n`);
  console.log("Productos por categoría (top 5 cada una):\n");

  const categories = ["gpus", "laptops", "workstations", "npus"];
  
  for (const cat of categories) {
    const catProducts = products.filter(p => p.category === cat).slice(0, 5);
    if (catProducts.length > 0) {
      console.log(`📁 ${cat.toUpperCase()}:`);
      for (const p of catProducts) {
        const scoreDisplay = p.ai_score !== null ? `${p.ai_score}` : "NULL";
        console.log(`   - ${p.name.substring(0, 60)}... -> ${scoreDisplay}`);
        if (p.ai_score === null) nullCount++;
        else withScore++;
      }
      console.log();
    }
  }

  // Contar NULLs restantes
  const nulls = products.filter(p => p.ai_score === null).length;
  const withScores = products.filter(p => p.ai_score !== null).length;

  console.log("═══════════════════════════════════════════════════");
  console.log(`📊 RESUMEN:`);
  console.log(`   ✅ Con score: ${withScores}`);
  console.log(`   ❌ NULL: ${nulls}`);
  console.log(`   📦 Total: ${products.length}`);
  console.log("═══════════════════════════════════════════════════");

  if (nulls === 0) {
    console.log("✅ ¡Todos los productos tienen ai_score!");
  } else {
    console.log("⚠️ Aún hay productos con ai_score NULL");
  }
}

verifyScores().catch(console.error);