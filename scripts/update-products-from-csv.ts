/**
 * Script para actualizar los campos features y specs desde el CSV
 * Ejecutar con: npx tsx scripts/update-products-from-csv.ts
 */

import * as dotenv from "dotenv";
import * as fs from "fs";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

async function updateProductsFromCSV() {
  console.log("📖 Leyendo archivo CSV...");
  
  const csvContent = fs.readFileSync("C:\\WEB AFFILIATES\\products.csv", "utf-8");
  const lines = csvContent.split("\n").filter(line => line.trim() !== "");
  
  // Saltar el header
  const dataLines = lines.slice(1);
  
  console.log(`📦 ${dataLines.length} productos en el CSV`);
  
  let updated = 0;
  let errors = 0;
  let skipped = 0;
  
  for (const line of dataLines) {
    try {
      const columns = parseCSVLine(line);
      
      if (columns.length < 15) {
        console.log(`⚠️ Línea inválida, saltando...`);
        skipped++;
        continue;
      }
      
      const id = columns[0];
      const features = columns[11]; // features column
      const specs = columns[12]; // specs column
      const aiScore = columns[14]; // ai_score column
      
      // Parsear features y specs
      let featuresParsed = null;
      let specsParsed = null;
      
      try {
        if (features && features !== "NULL" && features.trim() !== "") {
          featuresParsed = JSON.parse(features);
        }
      } catch (e) {
        console.log(`⚠️ Error parseando features para ${id}: ${e}`);
      }
      
      try {
        if (specs && specs !== "NULL" && specs.trim() !== "") {
          specsParsed = JSON.parse(specs);
        }
      } catch (e) {
        console.log(`⚠️ Error parseando specs para ${id}: ${e}`);
      }
      
      // Actualizar solo si hay datos válidos
      const updateData: any = {};
      if (featuresParsed) updateData.features = featuresParsed;
      if (specsParsed) updateData.specs = specsParsed;
      if (aiScore && aiScore !== "NULL" && aiScore.trim() !== "") {
        updateData.ai_score = parseInt(aiScore, 10);
      }
      
      if (Object.keys(updateData).length === 0) {
        console.log(`⏭️ ${id.substring(0, 8)}... sin datos para actualizar`);
        skipped++;
        continue;
      }
      
      const { error } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", id);
      
      if (error) {
        console.error(`❌ Error actualizando ${id}:`, error.message);
        errors++;
      } else {
        console.log(`✅ ${id.substring(0, 8)}... actualizado`);
        updated++;
      }
    } catch (err) {
      console.error(`❌ Error procesando línea:`, err);
      errors++;
    }
  }
  
  console.log("\n📊 Resumen:");
  console.log(`   ✅ Actualizados: ${updated}`);
  console.log(`   ⏭️ Saltados: ${skipped}`);
  console.log(`   ❌ Errores: ${errors}`);
}

updateProductsFromCSV().catch(console.error);