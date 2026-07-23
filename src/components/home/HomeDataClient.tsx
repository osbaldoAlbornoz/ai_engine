"use client";

import { useEffect, useState } from "react";
import { HeroSection, TopProduct } from "@/components/home/HeroSection";
import { createClient } from "@supabase/supabase-js";
import { calculateAIScore } from "@/utils/scoring";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function mapToTopProduct(row: any): TopProduct {
  return {
    id: row.id,
    name: row.clean_name ?? row.name ?? "Unknown Product",
    specs: typeof row.specs === "object" && row.specs !== null ? row.specs : {},
    aiScore: calculateAIScore(row),
  };
}

export function HomeDataClient() {
  const [data, setData] = useState<{
    topGPU: TopProduct | null;
    topLaptop: TopProduct | null;
    topNPU: TopProduct | null;
    topWorkstation: TopProduct | null;
  }>({
    topGPU: null,
    topLaptop: null,
    topNPU: null,
    topWorkstation: null,
  });

  useEffect(() => {
    async function fetchProducts() {
      try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const { data: products, error } = await supabase
          .from("products")
          .select("id, clean_name, name, category, price, specs, ai_score")
          .in("category", ["gpus", "laptops", "npus", "workstations"])
          .eq("status", "active");

        if (error || !products || products.length === 0) {
          return;
        }

        const getTop = (cat: string): TopProduct | null => {
          const filtered = products
            .filter((p) => p.category === cat)
            .sort((a, b) => {
              const scoreA = calculateAIScore(a as any);
              const scoreB = calculateAIScore(b as any);
              return scoreB - scoreA;
            });
          return filtered.length > 0 ? mapToTopProduct(filtered[0]) : null;
        };

        setData({
          topGPU: getTop("gpus"),
          topLaptop: getTop("laptops"),
          topNPU: getTop("npus"),
          topWorkstation: getTop("workstations"),
        });
      } catch (err) {
        console.error("Error fetching top products:", err);
      }
    }

    fetchProducts();
  }, []);

  return (
    <HeroSection
      topGPU={data.topGPU}
      topLaptop={data.topLaptop}
      topNPU={data.topNPU}
      topWorkstation={data.topWorkstation}
    />
  );
}
