import { hardwareData, HardwareProduct, Category } from "@/data/hardware";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, CheckCircle2, ChevronRight, Cpu } from "lucide-react";
import { Metadata } from "next";
import { AIAnalysis } from "@/components/product/AIAnalysis";
import { BottleneckChecker } from "@/components/product/BottleneckChecker";
import { AIBenchmarks } from "@/components/product/AIBenchmarks";
import { ROICalculator } from "@/components/product/ROICalculator";
import { ProductGallery } from "@/components/product/ProductGallery";
import { PriceAlert } from "@/components/product/PriceAlert";
import { ScrollIndicator } from "@/components/ui/scroll-indicator";
import { JargonBuster } from "@/components/ui/jargon-buster";
import { FadeIn } from "@/components/ui/fade-in";
import { createClient } from "@supabase/supabase-js";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

// Server-side Supabase client (uses public anon key, same as client)
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Maps a raw Supabase DB row to the HardwareProduct interface
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbProduct(row: any): HardwareProduct {
  return {
    id: row.id,
    name: row.name ?? "Unknown Product",
    category: (row.category ?? "gpus") as Category,
    brand: row.brand ?? "Unknown",
    price: row.price ?? 0,
    originalPrice: row.original_price ?? undefined,
    image: row.image_url ?? "",
    amazonUrl: row.amazon_url ?? "#",
    specs: typeof row.specs === "object" && row.specs !== null ? row.specs : {},
    keyFeatures: Array.isArray(row.features) ? row.features : [],
    pros: [],
    cons: [],
  };
}

async function getProduct(id: string): Promise<HardwareProduct | null> {
  // 1. Try Supabase first
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!error && data) {
    return mapDbProduct(data);
  }

  // 2. Fall back to static data
  const staticProduct = hardwareData.find((p) => p.id === id);
  if (staticProduct) return staticProduct;

  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) {
    return { title: "Product Not Found - AiEngine" };
  }
  return {
    title: `${product.name} - AiEngine Hardware`,
    description: `Check out the specs, benchmarks, and price for ${product.name}. Perfect for AI development and inference.`,
  };
}

// Only pre-render static slugs at build time; DB products are rendered on demand
export function generateStaticParams() {
  return hardwareData.map((p) => ({
    id: p.id,
  }));
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.image,
    description: `Check out the specs, benchmarks, and price for ${product.name}. Perfect for AI development and inference.`,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    offers: {
      "@type": "Offer",
      url: `https://aiengine.example.com/product/${product.id}`,
      priceCurrency: "USD",
      price: product.price > 0 ? product.price : 0,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className="min-h-screen bg-[#020202] pt-24 pb-12 relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-zinc-400 mb-8 font-heading">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/#featured" className="hover:text-primary transition-colors capitalize">{product.category}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-zinc-100">{product.brand}</span>
        </nav>

        {/* Hero Section */}
        <FadeIn delay={0.1} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
          {/* Image Gallery */}
          <ProductGallery 
            images={product.gallery || (product.image ? [product.image] : [])} 
            productName={product.name} 
          />

          {/* Product Info */}
          <div className="flex flex-col gap-6">
            <div>
              <div className="inline-block px-3 py-1 bg-zinc-900/80 border border-fuchsia-500/50 text-fuchsia-500 font-heading text-xs uppercase tracking-widest mb-4 shadow-[0_0_10px_rgba(217,70,239,0.3)]">
                {product.brand}
              </div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight font-heading drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                {product.name}
              </h1>
            </div>

            <div className="flex items-end gap-4">
              <span className="text-4xl font-bold text-primary drop-shadow-[0_0_15px_rgba(0,229,255,0.4)]">
                {product.price > 0 ? `$${product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Check on Amazon"}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xl text-zinc-500 line-through mb-1">
                  ${product.originalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              )}
            </div>

            {/* Key Features */}
            {product.keyFeatures.length > 0 && (
              <div className="space-y-3 mt-4">
                {product.keyFeatures.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-zinc-300">{feature}</span>
                  </div>
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="mt-8 pt-8 border-t border-zinc-800/80">
              <div className="flex flex-wrap gap-4">
                {product.affiliateLinks && product.affiliateLinks.length > 0 ? (
                  product.affiliateLinks.map((link, idx) => (
                    <Link
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                      className="group relative inline-flex items-center justify-center gap-3 flex-1 min-w-[250px] bg-[#050505] border border-accent/30 text-white hover:text-[#050505] overflow-hidden px-6 py-4 font-heading font-bold text-sm md:text-base uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] shadow-[0_0_20px_rgba(255,0,255,0.1)] hover:shadow-[0_0_30px_rgba(255,0,255,0.5)]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-accent to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:10px_10px] opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none" />
                      <ShoppingCart className="w-5 h-5 relative z-10 group-hover:-translate-y-1 transition-transform" />
                      <span className="relative z-10">{link.price ? `Buy on ${link.name} - $${link.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `Buy on ${link.name}`}</span>
                    </Link>
                  ))
                ) : (
                  <Link
                    href={product.amazonUrl}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="group relative inline-flex items-center justify-center gap-3 w-full sm:w-auto bg-[#050505] border border-accent/50 text-white hover:text-[#050505] overflow-hidden px-8 py-4 font-heading font-bold text-lg uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] shadow-[0_0_20px_rgba(255,0,255,0.15)] hover:shadow-[0_0_40px_rgba(255,0,255,0.6)]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-accent to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:10px_10px] opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none" />
                    <ShoppingCart className="w-6 h-6 relative z-10 group-hover:-translate-y-1 transition-transform" />
                    <span className="relative z-10">Check on Amazon</span>
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/20 transition-colors z-20 pointer-events-none" />
                  </Link>
                )}
                
                {/* Price Drop Alert Lead Capture */}
                <PriceAlert productId={product.id} productName={product.name} baselinePrice={product.price} />
              </div>
              <p className="text-xs text-zinc-500 mt-4 max-w-sm">
                * As an affiliate, we earn from qualifying purchases.
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Centered Scroll Indicator */}
        <div className="flex justify-center w-full mb-16">
          <ScrollIndicator text="Scroll for Deep AI Analysis" className="hidden lg:flex" />
        </div>

        {/* Technical Specifications */}
        {Object.keys(product.specs).length > 0 && (
          <FadeIn delay={0.2} className="mb-20">
            <h2 className="text-2xl md:text-3xl font-bold text-white font-heading mb-8 flex items-center gap-3">
              <Cpu className="w-8 h-8 text-primary" />
              Technical Specifications
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="relative bg-[#050505] border border-white/5 p-6 flex flex-col group hover:border-primary/50 transition-all duration-300 overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,0.5)] hover:shadow-[inset_0_0_40px_rgba(0,229,255,0.1)]">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-50" />
                  <div className="absolute top-0 left-0 w-1 h-full bg-white/5 group-hover:bg-primary transition-colors duration-300" />
                  <span className="relative z-10 text-zinc-500 font-heading text-xs uppercase tracking-widest font-semibold mb-2 group-hover:text-primary transition-colors">
                    <JargonBuster term={key}>{key}</JargonBuster>
                  </span>
                  <span className="relative z-10 text-lg text-zinc-100 font-medium font-heading tracking-wide">
                    {String(value)}
                  </span>
                </div>
              ))}
            </div>
          </FadeIn>
        )}

        {/* AI Performance Analysis */}
        <AIAnalysis product={product} />

        {/* Bottleneck Checker */}
        <BottleneckChecker product={product} />

        {/* AI Benchmarks */}
        <AIBenchmarks benchmarks={product.benchmarks} />

        {/* ROI Calculator */}
        <ROICalculator localPrice={product.price} />

      </div>
    </div>
  );
}
