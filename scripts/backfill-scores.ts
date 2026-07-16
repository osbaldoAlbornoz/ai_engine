/**
 * Script para calcular y actualizar ai_score para todos los productos en Supabase
 * Ejecutar con: npx tsx scripts/backfill-scores.ts
 * 
 * Nota: Requiere archivo .env.local con NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { calculateAIScore } from "../src/utils/scoring";

// Cargar variables de entorno desde .env.local
dotenv.config({ path: ".env.local" });

// Usar SERVICE_ROLE_KEY para bypass de RLS (solo para scripts del servidor)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

async function backfillScores() {
  console.log("🔍 Obteniendo productos de Supabase...");

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, category, specs, price, ai_score");

  if (error) {
    console.error("❌ Error al obtener productos:", error.message);
    return;
  }

  if (!products || products.length === 0) {
    console.log("⚠️ No hay productos en la base de datos");
    return;
  }

  console.log(`📦 Encontrados ${products.length} productos`);

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const product of products) {
    try {
      // Calcular score
      const score = calculateAIScore({
        name: product.name,
        category: product.category,
        specs: product.specs,
        price: product.price,
      });

      // Solo actualizar si el score es diferente o no existe
      if (product.ai_score === null || product.ai_score !== score) {
        const { error: updateError } = await supabase
          .from("products")
          .update({ ai_score: score })
          .eq("id", product.id);

        if (updateError) {
          console.error(`❌ Error al actualizar ${product.name}:`, updateError.message);
          errors++;
        } else {
          console.log(`✅ ${product.name} -> ai_score: ${score}`);
          updated++;
        }
      } else {
        console.log(`⏭️ ${product.name} ya tiene score ${product.ai_score}`);
        skipped++;
      }
    } catch (err) {
      console.error(`❌ Error procesando ${product.name}:`, err);
      errors++;
    }
  }

  console.log("\n📊 Resumen:");
  console.log(`   ✅ Actualizados: ${updated}`);
  console.log(`   ⏭️ Saltados: ${skipped}`);
  console.log(`   ❌ Errores: ${errors}`);
}

backfillScores().catch(console.error);