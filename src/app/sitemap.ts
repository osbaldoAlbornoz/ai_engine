import { MetadataRoute } from 'next';
import { createClient } from "@supabase/supabase-js";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://aiengine.example.com';
  let products: any[] = [];

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data } = await supabase
        .from("products")
        .select("id")
        .in("category", ["gpus", "laptops", "npus", "workstations"])
        .eq("status", "active");

      if (data) {
        products = data.map((product) => ({
          url: `${baseUrl}/product/${product.id}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }));
      }
    }
  } catch (error) {
    console.error("Error generating sitemap", error);
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...products,
  ];
}
