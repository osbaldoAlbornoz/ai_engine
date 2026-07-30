"use client";

import Link from "next/link";
import { ShoppingCart, CheckCircle2, ChevronRight, Cpu, ArrowUp } from "lucide-react";
import { Product } from "@/types/product";

import { AIAnalysis } from "@/components/product/AIAnalysis";
import { BottleneckChecker } from "@/components/product/BottleneckChecker";
import { AIBenchmarks } from "@/components/product/AIBenchmarks";
import { ROICalculator } from "@/components/product/ROICalculator";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ModelCompatibilityChecker } from "@/components/product/ModelCompatibilityChecker";
import { MultiGpuSimulator } from "@/components/product/MultiGpuSimulator";
import { ProductFaqSchema } from "@/components/seo/ProductFaqSchema";
import { ScrollIndicator } from "@/components/ui/scroll-indicator";
import { JargonBuster } from "@/components/ui/jargon-buster";
import { FadeIn } from "@/components/ui/fade-in";
import { getAffiliateUrl } from "@/utils/affiliate";

type Category = "gpus" | "laptops" | "npus" | "workstations";

interface HardwareProduct extends Product {
  image_url: string;
  amazon_url: string;
  original_price?: number;
  features: string[];
  pros?: string[];
  cons?: string[];
  gallery?: string[];
  affiliateLinks?: { name: string; url: string; price: number }[];
  benchmarks?: any[];
  // Legacy aliases for backward compatibility
  image?: string;
  amazonUrl?: string;
  originalPrice?: number;
  keyFeatures?: string[];
}

interface ProductDataClientProps {
  product: HardwareProduct;
}

export function ProductDataClient({ product }: ProductDataClientProps) {
  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-zinc-400 mb-8 font-heading">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={`/category/${product.category.toLowerCase()}`} className="hover:text-primary transition-colors capitalize">{product.category}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-zinc-100">{product.brand}</span>
        </nav>

        {/* Hero Section */}
        <FadeIn delay={0.1} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
          {/* Image Gallery */}
          <ProductGallery
            images={product.gallery && product.gallery.length > 0 ? product.gallery : (product.image_url ? [product.image_url] : (product.image ? [product.image] : []))}
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

            {/* Key Features */}
            {(() => {
              const raw = (product.keyFeatures && product.keyFeatures.length > 0) ? product.keyFeatures : product.features;
              const list = Array.isArray(raw) ? raw : (typeof raw === "string" ? [raw] : []);
              if (list.length === 0) return null;
              return (
                <div className="space-y-3 mt-4">
                  {list.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      <span className="text-zinc-300">{feature}</span>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* CTA */}
            <div className="mt-8 pt-8 border-t border-zinc-800/80">
              <div className="flex flex-wrap gap-4">
                {product.affiliateLinks && product.affiliateLinks.length > 0 ? (
                  product.affiliateLinks.map((link, idx) => (
                    <Link
                      key={idx}
                      href={getAffiliateUrl(link.url)}
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                      className="group relative inline-flex items-center justify-center gap-3 flex-1 min-w-[250px] bg-[#050505] border border-accent/30 text-white hover:text-[#050505] overflow-hidden px-6 py-4 font-heading font-bold text-sm md:text-base uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] shadow-[0_0_20px_rgba(255,0,255,0.1)] hover:shadow-[0_0_30px_rgba(255,0,255,0.5)]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-accent to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:10px_10px] opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none" />
                      <ShoppingCart className="w-5 h-5 relative z-10 group-hover:-translate-y-1 transition-transform" />
                      <span className="relative z-10">Check on {link.name}</span>
                    </Link>
                  ))
                ) : (
                  <Link
                    href={getAffiliateUrl(product.amazonUrl || product.amazon_url)}
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

        {/* Quick Navigation Links */}
        <div className="flex flex-wrap justify-center gap-3 mb-16 relative z-20">
          {Object.keys(product.specs).length > 0 && (
            <a href="#specs" className="px-4 py-2 rounded-full bg-[#050505] border border-primary/50 text-primary hover:text-accent hover:border-accent/50 transition-colors text-sm font-heading shadow-[0_0_10px_rgba(0,229,255,0.2)] hover:shadow-[0_0_15px_rgba(255,0,255,0.4)]">
              Specs
            </a>
          )}
          {Object.keys(product.specs).some(k => {
            const lowerK = k.toLowerCase();
            return lowerK === 'vram' || lowerK === 'memory' || lowerK === 'graphics card ram';
          }) && (
            <a href="#compatibility" className="px-4 py-2 rounded-full bg-[#050505] border border-primary/50 text-primary hover:text-accent hover:border-accent/50 transition-colors text-sm font-heading shadow-[0_0_10px_rgba(0,229,255,0.2)] hover:shadow-[0_0_15px_rgba(255,0,255,0.4)]">
              Will it Run
            </a>
          )}
          {product.category === 'gpus' && (
            <a href="#simulator" className="px-4 py-2 rounded-full bg-[#050505] border border-primary/50 text-primary hover:text-accent hover:border-accent/50 transition-colors text-sm font-heading shadow-[0_0_10px_rgba(0,229,255,0.2)] hover:shadow-[0_0_15px_rgba(255,0,255,0.4)]">
              Multi-GPU Simulator
            </a>
          )}
          <a href="#analysis" className="px-4 py-2 rounded-full bg-[#050505] border border-primary/50 text-primary hover:text-accent hover:border-accent/50 transition-colors text-sm font-heading shadow-[0_0_10px_rgba(0,229,255,0.2)] hover:shadow-[0_0_15px_rgba(255,0,255,0.4)]">
            AI Analysis
          </a>
          <a href="#bottlenecks" className="px-4 py-2 rounded-full bg-[#050505] border border-primary/50 text-primary hover:text-accent hover:border-accent/50 transition-colors text-sm font-heading shadow-[0_0_10px_rgba(0,229,255,0.2)] hover:shadow-[0_0_15px_rgba(255,0,255,0.4)]">
            Bottlenecks
          </a>
          {product.benchmarks && product.benchmarks.length > 0 && (
            <a href="#benchmarks" className="px-4 py-2 rounded-full bg-[#050505] border border-primary/50 text-primary hover:text-accent hover:border-accent/50 transition-colors text-sm font-heading shadow-[0_0_10px_rgba(0,229,255,0.2)] hover:shadow-[0_0_15px_rgba(255,0,255,0.4)]">
              Benchmarks
            </a>
          )}
          <a href="#roi" className="px-4 py-2 rounded-full bg-[#050505] border border-primary/50 text-primary hover:text-accent hover:border-accent/50 transition-colors text-sm font-heading shadow-[0_0_10px_rgba(0,229,255,0.2)] hover:shadow-[0_0_15px_rgba(255,0,255,0.4)]">
            ROI Calculator
          </a>
          <a href="#faqs" className="px-4 py-2 rounded-full bg-[#050505] border border-primary/50 text-primary hover:text-accent hover:border-accent/50 transition-colors text-sm font-heading shadow-[0_0_10px_rgba(0,229,255,0.2)] hover:shadow-[0_0_15px_rgba(255,0,255,0.4)]">
            FAQs
          </a>
        </div>

        {/* Technical Specifications */}
        {Object.keys(product.specs).length > 0 && (
          <FadeIn delay={0.2} className="mb-20">
            <h2 id="specs" className="text-2xl md:text-3xl font-bold text-white font-heading mb-8 flex items-center gap-3 scroll-mt-32">
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

        {/* Model Compatibility Checker (Will It Run?) */}
        {Object.keys(product.specs).some(k => {
          const lowerK = k.toLowerCase();
          return lowerK === 'vram' || lowerK === 'memory' || lowerK === 'graphics card ram';
        }) && (
          <FadeIn delay={0.3}>
            <div id="compatibility" className="scroll-mt-32">
              <ModelCompatibilityChecker product={product} />
            </div>
          </FadeIn>
        )}

        {/* Multi-GPU Simulator (Only for GPUs) */}
        {product.category === 'gpus' && (
          <FadeIn delay={0.4}>
            <div id="simulator" className="scroll-mt-32">
              <MultiGpuSimulator product={product} />
            </div>
          </FadeIn>
        )}

        {/* AI Performance Analysis */}
        <div id="analysis" className="scroll-mt-32">
          <AIAnalysis product={product} />
        </div>

        {/* Bottleneck Checker */}
        <div id="bottlenecks" className="scroll-mt-32">
          <BottleneckChecker product={product} />
        </div>

        {/* AI Benchmarks */}
        <div id="benchmarks" className="scroll-mt-32">
          <AIBenchmarks benchmarks={product.benchmarks} />
        </div>

        {/* ROI Calculator */}
        <div id="roi" className="scroll-mt-32">
          <ROICalculator localPrice={product.price} aiScore={product.ai_score} category={product.category} />
        </div>

        {/* Product FAQ Schema */}
        <div id="faqs" className="scroll-mt-32">
          <ProductFaqSchema 
            productName={product.name} 
            category={product.category} 
            vram={Object.entries(product.specs).find(([k]) => {
              const lowerK = k.toLowerCase();
              return lowerK === 'vram' || lowerK === 'memory' || lowerK === 'graphics card ram';
            })?.[1] as string | undefined || null}
          />
        </div>

        {/* Go to Top Button replaced by global floating button */}
      </div>
    </>
  );
}