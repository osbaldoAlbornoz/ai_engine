import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.aiengine.example.com";

  // 1. Static Routes
  const staticRoutes = [
    "",
    "/catalog",
    "/leaderboard",
    "/compare",
    "/gpus",
    "/laptops",
    "/npus",
    "/workstations",
  ];

  const staticPaths: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" ? 1.0 : 0.8,
  }));

  // 2. Fetch Products from Supabase
  const { data: products, error } = await supabase
    .from("products")
    .select("id, slug, category, updated_at")
    .eq("status", "active");

  if (error || !products) {
    console.error("Error fetching products for sitemap:", error);
    return staticPaths; // Return at least static paths if DB fails
  }

  // 3. Product Routes
  const productPaths: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/product/${product.id}`,
    lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  // 4. Comparison Routes
  const comparePaths: MetadataRoute.Sitemap = [];
  const productsByCategory: Record<string, typeof products> = {};

  // Group products by category
  products.forEach((product) => {
    if (!productsByCategory[product.category]) {
      productsByCategory[product.category] = [];
    }
    productsByCategory[product.category].push(product);
  });

  for (const category in productsByCategory) {
    const categoryProducts = productsByCategory[category];

    // Sort to ensure stable iteration and prevent duplicate reverse pairs
    categoryProducts.sort((a, b) => a.slug.localeCompare(b.slug));

    // Generate unique pairs (A vs B)
    for (let i = 0; i < categoryProducts.length; i++) {
      for (let j = i + 1; j < categoryProducts.length; j++) {
        const p1 = categoryProducts[i];
        const p2 = categoryProducts[j];

        const date1 = p1.updated_at ? new Date(p1.updated_at).getTime() : 0;
        const date2 = p2.updated_at ? new Date(p2.updated_at).getTime() : 0;
        const maxDate = new Date(Math.max(date1, date2) || Date.now());

        comparePaths.push({
          url: `${baseUrl}/compare/${p1.slug}-vs-${p2.slug}`,
          lastModified: maxDate,
          changeFrequency: "monthly",
          priority: 0.7,
        });
      }
    }
  }

  return [...staticPaths, ...productPaths, ...comparePaths];
}
