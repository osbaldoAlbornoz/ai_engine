"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { Product } from "@/types/product";
import { supabase } from "@/lib/supabase";
import { calculateAIScore, assignTier, TIERS, Tier, tierStyles, calculateValueRating, getScoreBreakdown, ScoreBreakdown } from "@/utils/scoring";
import Link from "next/link";
import { getAffiliateUrl } from "@/utils/affiliate";
import { ChevronRight, Trophy, Zap, Cpu, Server, Info, X, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const categoryIcons = {
  All: Trophy,
  GPU: Server,
  Laptop: Cpu,
  NPU: Zap,
  Workstation: Server,
};

interface ExtendedProduct extends Product {
  aiScore: number;
  tier: Tier;
  valueRating: ReturnType<typeof calculateValueRating>;
  valueRatio: number;
  dbAiScore?: number;
}

// Función para mapear datos de Supabase a ExtendedProduct
function mapDbToExtendedProduct(dbProd: any): ExtendedProduct {
  const computedScore = calculateAIScore(dbProd);
  return {
    id: dbProd.id,
    amazon_asin: dbProd.amazon_asin,
    name: dbProd.clean_name || dbProd.name,
    description: (dbProd.features && dbProd.features.length > 0) ? dbProd.features[0] : "High-performance AI hardware",
    price: dbProd.price || 0,
    original_price: dbProd.original_price,
    imageUrl: dbProd.image_url || "/images/GPU_1024.png",
    image_url: dbProd.image_url,
    affiliateUrl: dbProd.amazon_url || "#",
    amazon_url: dbProd.amazon_url,
    brand: dbProd.brand || "Unknown",
    category: dbProd.category === 'gpus' ? 'GPU' : dbProd.category === 'laptops' ? 'Laptop' : dbProd.category === 'npus' ? 'NPU' : dbProd.category === 'workstations' ? 'Workstation' : 'Unknown',
    specs: typeof dbProd.specs === "object" && dbProd.specs !== null ? dbProd.specs : {},
    features: dbProd.features,
    rating: dbProd.rating || 4.5,
    reviewsCount: dbProd.reviews_count || undefined,
    isPopular: dbProd.is_popular || false,
    status: dbProd.status,
    aiScore: computedScore,
    dbAiScore: dbProd.ai_score || undefined,
    tier: assignTier(computedScore),
    valueRating: calculateValueRating(computedScore, dbProd.price || 0),
    valueRatio: dbProd.price > 0 ? (computedScore / dbProd.price) * 100 : 0,
  };
}

function LeaderboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const initialCategory = searchParams.get('category') || "All";
  const initialMode = (searchParams.get('mode') as "performance" | "value") || "performance";

  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [rankingMode, setRankingMode] = useState<"performance" | "value">(initialMode);
  const [selectedProduct, setSelectedProduct] = useState<ExtendedProduct | null>(null);
  const [maxPriceLimit, setMaxPriceLimit] = useState<number>(20000);
  const [maxPrice, setMaxPrice] = useState<number>(20000);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', cat);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleModeChange = (mode: "performance" | "value") => {
    setRankingMode(mode);
    const params = new URLSearchParams(searchParams.toString());
    params.set('mode', mode);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Scroll to top when category or ranking mode changes
  // (useEffect was removed during React Query migration)

  // Usar React Query para cachear datos compartidos
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['leaderboard-products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').eq('status', 'active');
      if (error) throw error;
      return data.map(mapDbToExtendedProduct);
    },
  });

  useEffect(() => {
    if (products.length > 0) {
      const prices = products.map(p => p.price).filter(p => p > 0);
      if (prices.length > 0) {
        const maxPriceFound = Math.max(...prices);
        const roundedMax = Math.ceil(maxPriceFound / 10000) * 10000;
        setMaxPriceLimit(roundedMax);
        setMaxPrice(roundedMax);
      }
    }
  }, [products]);

  const rankedProducts = useMemo(() => {
    let filtered = products;

    // Filter by category
    if (activeCategory !== "All") {
      filtered = filtered.filter((p) => p.category === activeCategory);
    }

    // Filter by max price
    filtered = filtered.filter((p) => p.price === 0 || p.price <= maxPrice);

    // Recalculate tiers based on ranking mode
    const scoredProducts = filtered.map(p => {
      const valueRatio = p.price > 0 ? (p.aiScore / p.price) * 100 : 0;
      return {
        ...p,
        tier: rankingMode === "performance" ? assignTier(p.aiScore) : (
          valueRatio >= 15 ? "S" : valueRatio >= 10 ? "A" : valueRatio >= 5 ? "B" : "C"
        ),
        valueRatio
      };
    });

    // Sort by selected mode
    return scoredProducts.sort((a, b) => {
      if (rankingMode === "performance") {
        return b.aiScore - a.aiScore;
      } else {
        return b.valueRatio - a.valueRatio;
      }
    });
  }, [activeCategory, rankingMode, products, maxPrice]);

  const groupedByTier = useMemo(() => {
    const grouped = { S: [], A: [], B: [], C: [] } as Record<Tier, typeof rankedProducts>;
    rankedProducts.forEach(p => {
      grouped[p.tier].push(p);
    });
    return grouped;
  }, [rankedProducts]);



  return (
    <div className="min-h-screen bg-[#020202] pt-24 pb-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <nav className="flex items-center justify-center gap-2 text-sm text-zinc-400 mb-6 font-heading">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-zinc-100">AI Hardware Leaderboard</span>
          </nav>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-white font-heading mb-4"
          >
            Performance <span className="text-primary">Tier List</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-zinc-400 text-lg"
          >
            The ultimate ranking of hardware for AI workloads. From local inference to enterprise training.
          </motion.p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {(["All", "GPU", "Laptop", "NPU", "Workstation"] as const).map((cat) => {
            const Icon = categoryIcons[cat as keyof typeof categoryIcons] || Trophy;
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`flex items-center gap-2 px-6 py-3 border font-heading text-sm uppercase tracking-widest transition-all duration-300 ${isActive
                    ? "border-primary bg-primary/10 text-primary shadow-[0_0_20px_rgba(var(--primary),0.2)]"
                    : "border-white/10 bg-[#050505] text-zinc-400 hover:border-white/30 hover:text-white"
                  }`}
              >
                <Icon className="w-4 h-4" />
                {cat === "All" ? "Global Ranking" : cat}
              </button>
            )
          })}
        </div>

        {/* Ranking Mode Toggle and Count */}
        <div className="flex flex-col items-center justify-center mb-12 gap-6">
          <div className="bg-[#050505] border border-white/10 p-1 flex rounded-lg">
            <button
              onClick={() => handleModeChange("performance")}
              className={`px-6 py-2 text-sm font-heading font-bold rounded-md transition-colors ${rankingMode === "performance"
                  ? "bg-primary text-black"
                  : "text-zinc-400 hover:text-white"
                }`}
            >
              Performance Ranking
            </button>
            <button
              onClick={() => handleModeChange("value")}
              className={`px-6 py-2 text-sm font-heading font-bold rounded-md transition-colors ${rankingMode === "value"
                  ? "bg-primary text-black"
                  : "text-zinc-400 hover:text-white"
                }`}
            >
              Value (Perf/$) Ranking
            </button>
          </div>

          <div className="flex items-center gap-4 text-sm font-heading">
            <div className="text-fuchsia-400 bg-fuchsia-500/10 px-4 py-1.5 rounded-full border border-fuchsia-500/20 shadow-[0_0_15px_rgba(217,70,239,0.15)]">
              Showing <span className="text-fuchsia-300 font-bold">{rankedProducts.length}</span> {activeCategory === "All" ? "products" : activeCategory + (rankedProducts.length !== 1 ? "s" : "")}
            </div>

            {/* Budget Filter */}
            <div className="flex items-center gap-4 bg-zinc-900/50 border border-white/10 px-6 py-2 rounded-full min-w-[280px]">
              <DollarSign className="w-5 h-5 text-zinc-400 shrink-0" />
              <div className="flex flex-col w-full gap-1.5">
                <div className="flex justify-between text-xs text-zinc-400 font-heading w-full">
                  <span>Max Price:</span>
                  <span className="text-primary font-bold">${maxPrice.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={maxPriceLimit}
                  step="100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>


        {/* Tier List */}
        <div className="space-y-8">
          {TIERS.map((tier) => {
            const productsInTier = groupedByTier[tier];
            if (productsInTier.length === 0) return null;

            return (
              <motion.div
                key={tier}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex flex-col md:flex-row gap-6 bg-[#050505] border border-white/5 p-4"
              >
                {/* Tier Badge */}
                <div className={`shrink-0 w-full md:w-32 flex items-center justify-center p-6 border-l-4 font-heading text-5xl font-bold ${tierStyles[tier]?.border || ''} ${tierStyles[tier]?.text || ''} ${tierStyles[tier]?.bg || ''}/10 ${tierStyles[tier]?.shadow || ''}`}>
                  {tier}
                </div>

                {/* Product List */}
                <div className="flex-1 flex flex-col justify-center space-y-4 py-2">
                  {isLoading ? (
                    <div className="text-zinc-500 animate-pulse text-sm font-heading p-4">Loading real data...</div>
                  ) : (
                    <AnimatePresence>
                      {productsInTier.map((product) => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          key={product.id}
                          className="group flex flex-col sm:flex-row items-center gap-6 p-4 hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 cursor-pointer"
                          onClick={() => setSelectedProduct(product)}
                        >

                          <div className="w-24 h-24 shrink-0 bg-zinc-950 p-2 border border-white/10">
                            <img
                              src={product.imageUrl || product.image_url || '/images/GPU_1024.png'}
                              alt={product.name}
                              className="w-full h-full object-contain filter drop-shadow-lg text-transparent"
                            />
                          </div>

                          <div className="flex-1 text-center sm:text-left">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                              <span className="text-xs font-heading bg-zinc-800 text-zinc-300 px-2 py-0.5">{product.brand}</span>
                              <span className="text-xs font-heading border border-zinc-700 text-zinc-400 px-2 py-0.5 uppercase">{product.category}</span>
                              <span className={`text-xs font-heading border px-2 py-0.5 ${product.valueRating?.bg || ''} ${product.valueRating?.color || ''} ${product.valueRating?.border || ''}`}>
                                {product.valueRating?.label || 'N/A'}
                              </span>
                              {product.dbAiScore && (
                                <span className="text-xs font-heading bg-primary/10 text-primary px-2 py-0.5 border border-primary/30">
                                  DB Score: {product.dbAiScore}
                                </span>
                              )}
                            </div>
                            <Link href={`/product/${product.id}`} onClick={(e) => e.stopPropagation()}>
                              <h3 className="text-xl font-bold font-heading text-white hover:text-primary transition-colors">{product.name}</h3>
                            </Link>
                            <p className="text-sm text-zinc-400 mt-1 line-clamp-1">{product.description}</p>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full sm:w-64 shrink-0 flex flex-col justify-center">
                            <div className="flex justify-between items-end mb-2">
                              <span className="text-xs font-heading text-zinc-400 uppercase tracking-widest">
                                {rankingMode === "performance" ? "AI Score" : "Value Score"}
                              </span>
                              <span className="text-lg font-bold font-heading text-white">
                                {rankingMode === "performance" ? product.aiScore : product.valueRatio.toFixed(1)}
                                <span className="text-zinc-500 text-sm font-normal ml-1">
                                  {rankingMode === "performance" ? "/100" : "pts/$100"}
                                </span>
                              </span>
                            </div>
                            <div className="h-2 w-full bg-zinc-900 overflow-hidden rounded-full">
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: rankingMode === "performance" ? `${product.aiScore}%` : `${Math.min(100, (product.valueRatio / 20) * 100)}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full ${tierStyles[tier]?.bg || 'bg-zinc-500'}`}
                              />
                            </div>
                            <div className="flex items-center gap-1 mt-2 text-xs text-zinc-500">
                              <Info className="w-3 h-3" />
                              <span>Click for breakdown</span>
                            </div>
                          </div>

                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>

      {/* Score Breakdown Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-[#0a0a0a] border-b border-white/10 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold font-heading text-white">{selectedProduct.name}</h2>
                  <p className="text-zinc-400 text-sm mt-1">
                    {selectedProduct.brand} • {selectedProduct.category} • ${selectedProduct.price}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-zinc-400" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Overall Score */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-zinc-400 text-sm mb-1">Overall {rankingMode === "performance" ? "AI Score" : "Value Score"}</p>
                      <p className="text-4xl font-bold font-heading text-white">
                        {rankingMode === "performance" ? selectedProduct.aiScore : selectedProduct.valueRatio.toFixed(1)}
                        <span className="text-zinc-500 text-xl ml-2">
                          {rankingMode === "performance" ? "/100" : "pts/$100"}
                        </span>
                      </p>
                    </div>
                    <div className={`text-6xl font-bold font-heading ${tierStyles[selectedProduct.tier].text}`}>
                      Tier {selectedProduct.tier}
                    </div>
                  </div>
                  <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: rankingMode === "performance" ? `${selectedProduct.aiScore}%` : `${Math.min(100, (selectedProduct.valueRatio / 20) * 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full ${tierStyles[selectedProduct.tier]?.bg || 'bg-zinc-500'}`}
                    />
                  </div>
                </div>

                {/* Score Breakdown */}
                <ScoreBreakdownView product={selectedProduct} />



                {/* CTA */}
                <div className="mt-6 flex gap-3">
                  <a
                    href={getAffiliateUrl(selectedProduct.affiliateUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-primary text-black font-bold font-heading py-3 px-6 rounded-lg hover:bg-primary/80 transition-colors text-center"
                  >
                    Check on Amazon
                  </a>
                  <Link
                    href={`/product/${selectedProduct.id}`}
                    className="flex-1 bg-zinc-800 text-white font-bold font-heading py-3 px-6 rounded-lg hover:bg-zinc-700 transition-colors text-center border border-white/10"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ScoreBreakdownView({ product }: { product: ExtendedProduct }) {
  const breakdown = getScoreBreakdown(product);

  if (Object.keys(breakdown.components).length === 0) {
    return <div className="text-zinc-500 text-center py-8">No breakdown available for this product.</div>;
  }

  return (
    <div>
      <h3 className="text-lg font-bold font-heading text-white mb-4">Score Breakdown</h3>
      <div className="space-y-4">
        {Object.entries(breakdown.components).map(([name, { score, max, percentage }]) => (
          <div key={name}>
            <div className="flex justify-between items-end mb-1">
              <span className="text-sm font-heading text-zinc-300">{name}</span>
              <span className="text-sm font-bold text-white">
                {score}/{max}
                <span className="text-zinc-500 text-xs ml-1">({percentage}%)</span>
              </span>
            </div>
            <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`h-full ${percentage >= 80 ? 'bg-emerald-500' :
                    percentage >= 60 ? 'bg-blue-500' :
                      percentage >= 40 ? 'bg-amber-500' :
                        'bg-red-500'
                  }`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020202] pt-24 flex items-center justify-center text-primary">Loading Leaderboard...</div>}>
      <LeaderboardContent />
    </Suspense>
  );
}