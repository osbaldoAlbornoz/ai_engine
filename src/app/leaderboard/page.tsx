"use client";

import { useState, useEffect, useMemo } from "react";
import { sampleProducts, Product } from "@/data/products";
import { supabase } from "@/lib/supabase";
import { calculateAIScore, assignTier, TIERS, Tier, tierStyles, calculateValueRating } from "@/utils/scoring";
import Link from "next/link";
import { ChevronRight, Trophy, Zap, Cpu, Server } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";



const categoryIcons = {
  All: Trophy,
  GPU: Server,
  Laptop: Cpu,
  NPU: Zap,
  Workstation: Server,
};

export default function LeaderboardPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [rankingMode, setRankingMode] = useState<"performance" | "value">("performance");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.from('products').select('*').eq('status', 'active');
      if (data && !error) {
        const dbProducts: Product[] = data.map(dbProd => ({
          id: dbProd.id,
          title: dbProd.name,
          description: (dbProd.features && dbProd.features.length > 0) ? dbProd.features[0] : "High-performance AI hardware",
          price: dbProd.price || 0,
          imageUrl: dbProd.image_url || "/images/GPU_1024.png",
          affiliateUrl: dbProd.amazon_url || "#",
          brand: dbProd.brand || "Unknown",
          category: dbProd.category === 'gpus' ? 'GPU' : dbProd.category === 'laptops' ? 'Laptop' : dbProd.category === 'npus' ? 'NPU' : dbProd.category === 'workstations' ? 'Workstation' : 'Unknown',
          specs: typeof dbProd.specs === "object" && dbProd.specs !== null ? dbProd.specs : {},
          rating: dbProd.rating || 4.5,
          reviewsCount: dbProd.reviews_count || Math.floor(Math.random() * 500) + 10,
          isPopular: dbProd.is_popular || false,
        }));
        
        setProducts(dbProducts);
      } else {
        setProducts(sampleProducts);
      }
      setIsLoading(false);
    };
    
    fetchProducts();
  }, []);

  const rankedProducts = useMemo(() => {
    let filtered = products;
    if (activeCategory !== "All") {
      filtered = products.filter((p) => p.category === activeCategory);
    }
    
    // Calculate intelligent scores dynamically
    const scoredProducts = filtered.map(p => {
      const computedScore = calculateAIScore(p);
      const computedTier = assignTier(computedScore);
      const valueRating = calculateValueRating(computedScore, p.price);
      // For value ranking, we compute a raw value score (points per $100) to sort by
      const valueRatio = p.price > 0 ? (computedScore / p.price) * 100 : 0;
      
      return {
        ...p,
        aiScore: computedScore,
        tier: rankingMode === "performance" ? computedTier : (
           valueRatio >= 15 ? "S" : valueRatio >= 10 ? "A" : valueRatio >= 5 ? "B" : "C"
        ),
        valueRating,
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
  }, [activeCategory, rankingMode, products]);

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
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-2 px-6 py-3 border font-heading text-sm uppercase tracking-widest transition-all duration-300 ${
                  isActive 
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
              onClick={() => setRankingMode("performance")}
              className={`px-6 py-2 text-sm font-heading font-bold rounded-md transition-colors ${
                rankingMode === "performance" 
                  ? "bg-primary text-black" 
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Performance Ranking
            </button>
            <button
              onClick={() => setRankingMode("value")}
              className={`px-6 py-2 text-sm font-heading font-bold rounded-md transition-colors ${
                rankingMode === "value" 
                  ? "bg-primary text-black" 
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Value (Perf/$) Ranking
            </button>
          </div>
          
          <div className="text-sm font-heading text-fuchsia-400 bg-fuchsia-500/10 px-4 py-1.5 rounded-full border border-fuchsia-500/20 shadow-[0_0_15px_rgba(217,70,239,0.15)]">
            Showing <span className="text-fuchsia-300 font-bold">{rankedProducts.length}</span> {activeCategory === "All" ? "products" : activeCategory + (rankedProducts.length !== 1 ? "s" : "")}
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
                <div className={`shrink-0 w-full md:w-32 flex items-center justify-center p-6 border-l-4 font-heading text-5xl font-bold ${tierStyles[tier].border} ${tierStyles[tier].text} ${tierStyles[tier].bg}/10 ${tierStyles[tier].shadow}`}>
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
                      className="group flex flex-col sm:flex-row items-center gap-6 p-4 hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
                    >
                      
                      <div className="w-24 h-24 shrink-0 bg-zinc-950 p-2 border border-white/10">
                        <img 
                          src={product.imageUrl} 
                          alt={product.title} 
                          className="w-full h-full object-contain filter drop-shadow-lg text-transparent"
                        />
                      </div>
                      
                      <div className="flex-1 text-center sm:text-left">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                          <span className="text-xs font-heading bg-zinc-800 text-zinc-300 px-2 py-0.5">{product.brand}</span>
                          <span className="text-xs font-heading border border-zinc-700 text-zinc-400 px-2 py-0.5 uppercase">{product.category}</span>
                          <span className={`text-xs font-heading border px-2 py-0.5 ${product.valueRating.bg} ${product.valueRating.color} ${product.valueRating.border}`}>
                            {product.valueRating.label}
                          </span>
                        </div>
                        <Link href={`/product/${product.id}`} className="hover:text-primary transition-colors">
                          <h3 className="text-xl font-bold font-heading text-white">{product.title}</h3>
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
                        <div className="h-2 w-full bg-zinc-900 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: rankingMode === "performance" ? `${product.aiScore}%` : `${Math.min(100, (product.valueRatio / 20) * 100)}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full ${tierStyles[tier].bg}`}
                          />
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
    </div>
  );
}
