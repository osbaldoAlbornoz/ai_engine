import { HeroSection, TopProduct } from "@/components/home/HeroSection";
import { HardwareMatcher } from "@/components/matcher/HardwareMatcher";
import { CatalogSection } from "@/components/catalog/CatalogSection";
import { createClient } from "@supabase/supabase-js";
import { calculateAIScore } from "@/utils/scoring";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapToTopProduct(row: any): TopProduct {
  return {
    id: row.id,
    name: row.name ?? "Unknown Product",
    specs: typeof row.specs === "object" && row.specs !== null ? row.specs : {},
  };
}

async function getTopProducts(): Promise<{
  topGPU: TopProduct | null;
  topLaptop: TopProduct | null;
  topNPU: TopProduct | null;
}> {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("products")
      .select("id, name, category, price, specs")
      .in("category", ["gpus", "laptops", "npus"]);

    if (error || !data || data.length === 0) {
      return { topGPU: null, topLaptop: null, topNPU: null };
    }

    const getTop = (cat: string): TopProduct | null => {
      const filtered = data
        .filter((p) => p.category === cat)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((p) => ({ ...p, score: calculateAIScore(p as any) }))
        .sort((a, b) => b.score - a.score);
      return filtered.length > 0 ? mapToTopProduct(filtered[0]) : null;
    };

    return {
      topGPU: getTop("gpus"),
      topLaptop: getTop("laptops"),
      topNPU: getTop("npus"),
    };
  } catch {
    return { topGPU: null, topLaptop: null, topNPU: null };
  }
}

export default async function Home() {
  const { topGPU, topLaptop, topNPU } = await getTopProducts();

  return (
    <div className="flex flex-col w-full">
      <HeroSection topGPU={topGPU} topLaptop={topLaptop} topNPU={topNPU} />
      
      {/* Decorative separator */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent my-10" />
      
      <HardwareMatcher />
      
      {/* Decorative separator */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent my-10" />

      <CatalogSection />
    </div>
  );
}
