"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Product } from "@/types/product";

type Category = "gpus" | "laptops" | "npus" | "workstations";

interface CatalogProduct extends Product {
  image: string;
  amazonUrl: string;
  originalPrice?: number;
  keyFeatures: string[];
}
import Link from "next/link";
import { getAffiliateUrl } from "@/utils/affiliate";
import { calculateAIScore } from "@/utils/scoring";
import { ShoppingCart, Filter, X, Search, ChevronRight, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
} as const;

export default function CatalogViewer({ initialCategory = "all" }: { initialCategory?: Category | "all" }) {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | "all">(initialCategory);
  const [activeBrand, setActiveBrand] = useState<string>("all");
  const [maxPriceLimit, setMaxPriceLimit] = useState<number>(5000);
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Contextual filters
  const [activeVRAM, setActiveVRAM] = useState<string>("all");
  const [activeTOPS, setActiveTOPS] = useState<string>("all");
  const [activeMemory, setActiveMemory] = useState<string>("all");

  const [sortBy, setSortBy] = useState<string>("featured");
  const [isSortOpen, setIsSortOpen] = useState(false);

  const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "brand-asc", label: "Brand: A to Z" },
    { value: "brand-desc", label: "Brand: Z to A" },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    setActiveCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      console.log("🔍 Fetching products from Supabase...");
      const { data, error } = await supabase.from('products').select('*').eq('status', 'active');
      if (error) {
        console.error("❌ Supabase error:", error);
      }
      console.log("📦 Total products from DB:", data?.length || 0);
      if (data && !error) {
        const dbProducts: CatalogProduct[] = data.map(dbProd => ({
          id: dbProd.id,
          amazon_asin: dbProd.amazon_asin,
          name: dbProd.clean_name || dbProd.name,
          description: (dbProd.features && dbProd.features.length > 0) ? dbProd.features[0] : "High-performance AI hardware",
          category: (dbProd.category || "gpus") as Category,
          brand: dbProd.brand || "Unknown",
          price: dbProd.price || 0,
          originalPrice: dbProd.original_price || undefined,
          original_price: dbProd.original_price,
          image: dbProd.image_url || "/images/GPU_1024.png",
          image_url: dbProd.image_url,
          amazonUrl: dbProd.amazon_url || "#",
          amazon_url: dbProd.amazon_url,
          specs: dbProd.specs || {},
          keyFeatures: dbProd.features || [],
          features: dbProd.features,
          rating: dbProd.rating,
          reviewsCount: dbProd.reviews_count,
          isPopular: dbProd.is_popular,
          status: dbProd.status,
          ai_score: calculateAIScore(dbProd),
        }));
        
        console.log("✅ Products after mapping:", dbProducts.length);
        console.log("📊 Products by category:", dbProducts.reduce((acc, p) => {
          acc[p.category] = (acc[p.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>));
        console.log("📊 Products with price = 0:", dbProducts.filter(p => p.price === 0).length);
        console.log("📊 Products with price > 5000:", dbProducts.filter(p => p.price > 5000).length);
        
        setProducts(dbProducts);
        
        // Calcular el precio máximo dinámico (redondeado al próximo 10,000)
        const prices = dbProducts.map(p => p.price).filter(p => p > 0);
        if (prices.length > 0) {
          const maxPriceFound = Math.max(...prices);
          const roundedMax = Math.ceil(maxPriceFound / 10000) * 10000;
          console.log(`💰 Max price found: $${maxPriceFound}, setting limit to: $${roundedMax}`);
          setMaxPriceLimit(roundedMax);
          setMaxPrice(roundedMax);
        }
      }
      setIsLoading(false);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, activeBrand, maxPrice, searchQuery, activeVRAM, activeTOPS, activeMemory, sortBy]);

  const handleCategoryChange = (cat: Category | "all") => {
    setActiveCategory(cat);
    setActiveVRAM("all");
    setActiveTOPS("all");
    setActiveMemory("all");
  };

  const brands = useMemo(() => {
    const b = new Set<string>();
    products.forEach(p => {
      if (activeCategory === "all" || p.category === activeCategory) {
        if (p.brand && p.brand !== "Unknown") {
          b.add(p.brand);
        }
      }
    });
    return Array.from(b).sort();
  }, [products, activeCategory]);

  const vramOptions = useMemo(() => {
    const v = new Set<string>();
    products.forEach(p => {
      if (p.category === "gpus" && (activeCategory === "all" || activeCategory === "gpus")) {
        const keys = ['VRAM', 'Video Memory', 'Graphics Card Ram', 'Memory'];
        let vramVal = "";
        for (const k of keys) {
          if (p.specs[k]) { vramVal = String(p.specs[k]); break; }
        }
        if (!vramVal) {
          const match = p.name.match(/(\d+)\s*gb/i);
          if (match) vramVal = `${match[1]}GB`;
        }
        if (vramVal) {
          const num = vramVal.match(/(\d+)/);
          if (num) v.add(`${num[1]}GB`);
        }
      }
    });
    return Array.from(v).sort((a, b) => parseInt(a) - parseInt(b));
  }, [products, activeCategory]);

  const topsOptions = useMemo(() => {
    const t = new Set<string>();
    products.forEach(p => {
      if (p.category === "npus" && (activeCategory === "all" || activeCategory === "npus")) {
        const keys = ['Total AI TOPS', 'AI TOPS', 'TOPS'];
        let topsVal = "";
        for (const k of keys) {
          if (p.specs[k]) { topsVal = String(p.specs[k]); break; }
        }
        if (topsVal) {
          const num = topsVal.match(/(\d+)/);
          if (num) t.add(`${num[1]} TOPS`);
        }
      }
    });
    return Array.from(t).sort((a, b) => parseInt(a) - parseInt(b));
  }, [products, activeCategory]);

  const memoryOptions = useMemo(() => {
    const m = new Set<string>();
    products.forEach(p => {
      if (p.category === "laptops" && (activeCategory === "all" || activeCategory === "laptops")) {
        const keys = ['Unified Memory', 'Memory', 'RAM', 'System Memory'];
        let memVal = "";
        for (const k of keys) {
          if (p.specs[k]) { memVal = String(p.specs[k]); break; }
        }
        if (!memVal) {
          const match = p.name.match(/(\d+)\s*gb/i);
          if (match) memVal = `${match[1]}GB`;
        }
        if (memVal) {
          const num = memVal.match(/(\d+)/);
          if (num) m.add(`${num[1]}GB`);
        }
      }
    });
    return Array.from(m).sort((a, b) => parseInt(a) - parseInt(b));
  }, [products, activeCategory]);

  const filteredProducts = useMemo(() => {
    console.log("🔍 Filter debug - activeCategory:", activeCategory, "activeBrand:", activeBrand, "maxPrice:", maxPrice, "searchQuery:", searchQuery);
    console.log("🔍 Filter debug - activeVRAM:", activeVRAM, "activeTOPS:", activeTOPS, "activeMemory:", activeMemory);
    
    const result = products.filter((p) => {
      const matchCategory = activeCategory === "all" || p.category === activeCategory;
      const matchBrand = activeBrand === "all" || p.brand === activeBrand;
      const matchPrice = p.price === 0 || p.price <= maxPrice; 
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchContextual = true;
      if (activeCategory === "gpus" && activeVRAM !== "all") {
        const keys = ['VRAM', 'Video Memory', 'Graphics Card Ram', 'Memory'];
        let vramVal = "";
        for (const k of keys) {
          if (p.specs[k]) { vramVal = String(p.specs[k]); break; }
        }
        if (!vramVal) {
          const match = p.name.match(/(\d+)\s*gb/i);
          if (match) vramVal = `${match[1]}GB`;
        }
        let normalizedVram = "";
        if (vramVal) {
          const num = vramVal.match(/(\d+)/);
          if (num) normalizedVram = `${num[1]}GB`;
        }
        matchContextual = normalizedVram === activeVRAM;
      }
      
      if (activeCategory === "npus" && activeTOPS !== "all") {
        const keys = ['Total AI TOPS', 'AI TOPS', 'TOPS'];
        let topsVal = "";
        for (const k of keys) {
          if (p.specs[k]) { topsVal = String(p.specs[k]); break; }
        }
        let normalizedTops = "";
        if (topsVal) {
          const num = topsVal.match(/(\d+)/);
          if (num) normalizedTops = `${num[1]} TOPS`;
        }
        matchContextual = normalizedTops === activeTOPS;
      }
      
      if (activeCategory === "laptops" && activeMemory !== "all") {
        const keys = ['Unified Memory', 'Memory', 'RAM', 'System Memory'];
        let memVal = "";
        for (const k of keys) {
          if (p.specs[k]) { memVal = String(p.specs[k]); break; }
        }
        if (!memVal) {
          const match = p.name.match(/(\d+)\s*gb/i);
          if (match) memVal = `${match[1]}GB`;
        }
        let normalizedMem = "";
        if (memVal) {
          const num = memVal.match(/(\d+)/);
          if (num) normalizedMem = `${num[1]}GB`;
        }
        matchContextual = normalizedMem === activeMemory;
      }

      const passes = matchCategory && matchBrand && matchPrice && matchSearch && matchContextual;
      if (!passes) {
        const reasons = [];
        if (!matchCategory) reasons.push("category");
        if (!matchBrand) reasons.push("brand");
        if (!matchPrice) reasons.push(`price(${p.price} > ${maxPrice})`);
        if (!matchSearch) reasons.push("search");
        if (!matchContextual) reasons.push("contextual");
        console.log(`❌ ${p.name} filtered out: ${reasons.join(", ")}`);
      }
      return passes;
    });
    
    console.log("✅ Filtered products:", result.length, "out of", products.length);
    return result;
  }, [products, activeCategory, activeBrand, maxPrice, searchQuery, activeVRAM, activeTOPS, activeMemory]);

  const sortedProducts = useMemo(() => {
    let sorted = [...filteredProducts];
    switch (sortBy) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "brand-asc":
        sorted.sort((a, b) => a.brand.localeCompare(b.brand));
        break;
      case "brand-desc":
        sorted.sort((a, b) => b.brand.localeCompare(a.brand));
        break;
      default:
        break;
    }
    return sorted;
  }, [filteredProducts, sortBy]);

  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const currentProducts = sortedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-[#020202] pt-24 pb-12 relative">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-zinc-800/80 pb-6">
          <div>
            <nav className="flex items-center gap-2 text-sm text-zinc-400 mb-4 font-heading">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-zinc-100">Hardware Catalog</span>
            </nav>
            <h1 className="text-4xl md:text-5xl font-bold text-white font-heading">
              AI {activeCategory === "gpus" ? "GPUs" : activeCategory === "npus" ? "NPUs" : activeCategory !== "all" ? <span className="capitalize">{activeCategory}</span> : "Hardware"} <span className="text-primary">Catalog</span>
            </h1>
            <p className="text-zinc-400 mt-2">Find the perfect component for your next AI build.</p>
          </div>
          
          <button 
            onClick={() => setIsMobileFiltersOpen(true)}
            className="md:hidden flex items-center justify-center gap-2 bg-[#050505] border border-primary/30 text-primary py-3 px-6 font-heading font-bold"
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <aside className={`fixed inset-0 z-50 bg-[#020202]/95 backdrop-blur-md p-6 overflow-y-auto transition-transform duration-300 md:static md:z-0 md:bg-transparent md:backdrop-blur-none md:p-0 md:block md:w-64 shrink-0 ${isMobileFiltersOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
            
            <div className="flex items-center justify-between md:hidden mb-8">
              <h2 className="text-2xl font-heading font-bold text-white">Filters</h2>
              <button onClick={() => setIsMobileFiltersOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-8">
              {/* Search */}
              <div className="space-y-3">
                <label className="text-sm font-heading font-semibold text-zinc-400 uppercase tracking-widest">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input 
                    type="text" 
                    placeholder="Search hardware..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#050505] border border-white/10 text-white pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary/50 transition-colors text-sm"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <label className="text-sm font-heading font-semibold text-zinc-400 uppercase tracking-widest">Category</label>
                <div className="flex flex-col gap-2">
                  <Link href="/hardware" className={`text-left text-sm py-1.5 px-3 border-l-2 transition-all ${activeCategory === "all" ? "border-primary text-primary bg-primary/5" : "border-transparent text-zinc-400 hover:text-zinc-200"}`}>All Categories</Link>
                  <Link href="/category/gpus" className={`text-left text-sm py-1.5 px-3 border-l-2 transition-all ${activeCategory === "gpus" ? "border-primary text-primary bg-primary/5" : "border-transparent text-zinc-400 hover:text-zinc-200"}`}>Graphic Cards (GPUs)</Link>
                  <Link href="/category/laptops" className={`text-left text-sm py-1.5 px-3 border-l-2 transition-all ${activeCategory === "laptops" ? "border-primary text-primary bg-primary/5" : "border-transparent text-zinc-400 hover:text-zinc-200"}`}>AI Laptops</Link>
                  <Link href="/category/npus" className={`text-left text-sm py-1.5 px-3 border-l-2 transition-all ${activeCategory === "npus" ? "border-primary text-primary bg-primary/5" : "border-transparent text-zinc-400 hover:text-zinc-200"}`}>Processors (NPUs)</Link>
                  <Link href="/category/workstations" className={`text-left text-sm py-1.5 px-3 border-l-2 transition-all ${activeCategory === "workstations" ? "border-primary text-primary bg-primary/5" : "border-transparent text-zinc-400 hover:text-zinc-200"}`}>Workstations</Link>
                </div>
              </div>

              {/* Brands */}
              <div className="space-y-3">
                <label className="text-sm font-heading font-semibold text-zinc-400 uppercase tracking-widest">Brand</label>
                <div className="relative">
                  <select 
                    value={activeBrand} 
                    onChange={(e) => setActiveBrand(e.target.value)}
                    className="w-full bg-[#050505] border border-white/10 text-white px-4 py-2.5 pr-10 focus:outline-none focus:border-primary/50 transition-colors text-sm appearance-none cursor-pointer"
                  >
                    <option value="all">All Brands</option>
                    {brands.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                </div>
              </div>

              {/* Contextual Filters */}
              {activeCategory === "gpus" && (
                <div className="space-y-3">
                  <label className="text-sm font-heading font-semibold text-zinc-400 uppercase tracking-widest">VRAM</label>
                  <div className="relative">
                    <select 
                      value={activeVRAM} 
                      onChange={(e) => setActiveVRAM(e.target.value)}
                      className="w-full bg-[#050505] border border-white/10 text-white px-4 py-2.5 pr-10 focus:outline-none focus:border-primary/50 transition-colors text-sm appearance-none cursor-pointer"
                    >
                      <option value="all">All VRAM</option>
                      {vramOptions.map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  </div>
                </div>
              )}

              {activeCategory === "laptops" && (
                <div className="space-y-3">
                  <label className="text-sm font-heading font-semibold text-zinc-400 uppercase tracking-widest">Memory</label>
                  <div className="relative">
                    <select 
                      value={activeMemory} 
                      onChange={(e) => setActiveMemory(e.target.value)}
                      className="w-full bg-[#050505] border border-white/10 text-white px-4 py-2.5 pr-10 focus:outline-none focus:border-primary/50 transition-colors text-sm appearance-none cursor-pointer"
                    >
                      <option value="all">All Memory</option>
                      {memoryOptions.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  </div>
                </div>
              )}

              {activeCategory === "npus" && (
                <div className="space-y-3">
                  <label className="text-sm font-heading font-semibold text-zinc-400 uppercase tracking-widest">AI Performance (TOPS)</label>
                  <div className="relative">
                    <select 
                      value={activeTOPS} 
                      onChange={(e) => setActiveTOPS(e.target.value)}
                      className="w-full bg-[#050505] border border-white/10 text-white px-4 py-2.5 pr-10 focus:outline-none focus:border-primary/50 transition-colors text-sm appearance-none cursor-pointer"
                    >
                      <option value="all">All TOPS</option>
                      {topsOptions.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  </div>
                </div>
              )}

               {/* Price Range */}
               <div className="space-y-4">
                 <label className="text-sm font-heading font-semibold text-zinc-400 uppercase tracking-widest flex justify-between">
                   <span>Max Price</span>
                   <span className="text-primary">${maxPrice.toLocaleString()}</span>
                 </label>
                 <input 
                   type="range" 
                   min="0" 
                   max={maxPriceLimit} 
                   step="100"
                   value={maxPrice}
                   onChange={(e) => setMaxPrice(Number(e.target.value))}
                   className="w-full accent-primary"
                 />
                 <div className="flex justify-between text-xs text-zinc-600 font-heading">
                   <span>$0</span>
                   <span>${(maxPriceLimit / 1000).toFixed(0)}K+</span>
                 </div>
               </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="mb-6 flex flex-wrap gap-4 justify-between items-center">
              <p className="text-zinc-400 text-sm">Showing {filteredProducts.length} products</p>
              
              <div className="flex items-center gap-3">
                <label className="text-sm font-heading text-accent uppercase tracking-wider hidden sm:block">Sort by:</label>
                  <div className="relative">
                    {/* Click away overlay */}
                    {isSortOpen && (
                      <div 
                        className="fixed inset-0 z-10"
                        onClick={() => setIsSortOpen(false)}
                      />
                    )}
                    <div className="relative z-20">
                      <button 
                        onClick={() => setIsSortOpen(!isSortOpen)}
                        className="bg-[#050505] border border-white/10 text-primary px-4 py-2.5 focus:outline-none focus:border-primary/50 transition-colors text-sm cursor-pointer font-heading min-w-[200px] text-left flex items-center justify-between"
                      >
                        <span>{sortOptions.find(o => o.value === sortBy)?.label || "Featured"}</span>
                        <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isSortOpen ? "rotate-180" : ""}`} />
                      </button>
                      
                      {isSortOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-[#050505] border border-white/10 shadow-2xl overflow-hidden flex flex-col">
                          {sortOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                setSortBy(option.value);
                                setIsSortOpen(false);
                              }}
                              className={`w-full text-left px-4 py-3 text-sm font-heading hover:bg-white/5 transition-colors ${
                                sortBy === option.value ? "text-primary bg-primary/10" : "text-zinc-300"
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                  <div key={i} className="bg-[#050505] border border-white/10 flex flex-col shadow-xl animate-pulse">
                    <div className="aspect-square bg-white/5 border-b border-white/10"></div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="h-6 bg-white/10 rounded w-3/4 mb-3"></div>
                      <div className="h-4 bg-white/10 rounded w-1/2 mb-6 mt-auto"></div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="h-10 bg-white/10 rounded"></div>
                        <div className="h-10 bg-white/10 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-[#050505] border border-white/10 p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-zinc-600" />
                </div>
                <h3 className="text-xl font-bold text-white font-heading mb-2">No products found</h3>
                <p className="text-zinc-400">Try adjusting your filters or search query.</p>
                <button 
                  onClick={() => { handleCategoryChange("all"); setActiveBrand("all"); setMaxPrice(maxPriceLimit); setSearchQuery(""); }}
                  className="mt-6 text-primary hover:underline text-sm font-heading"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
                <motion.div 
                  key={`${activeCategory}-${currentPage}-${searchQuery}`}
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                  {currentProducts.map((product, index) => (
                    <motion.div 
                      variants={itemVariants} 
                      key={product.id} 
                      className="bg-[#050505] border border-white/10 group flex flex-col hover:border-primary/50 transition-all duration-300 shadow-xl hover:-translate-y-2 hover:shadow-[0_10px_30px_-10px_rgba(0,255,255,0.15)] relative overflow-hidden"
                    >
                      <Link href={`/product/${product.id}`} className="block relative aspect-square p-8 overflow-hidden bg-gradient-to-b from-white via-zinc-50 to-zinc-200 border-b border-white/10 flex items-center justify-center">
                        {/* Sci-fi scanner line effect */}
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/30 blur-[1px] group-hover:animate-pulse"></div>
                        
                        {/* Tech grid overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none"></div>
                        
                        {/* Inner shadow/vignette to make the white feel enclosed */}
                        <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.25)] pointer-events-none"></div>
                        
                        {/* Pedestal glow at the bottom */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1/4 bg-primary/10 blur-2xl rounded-full pointer-events-none group-hover:bg-primary/20 transition-all duration-500"></div>

                        <div className={`absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md border border-white/10 border-l-2 px-3 py-1.5 text-[10px] uppercase font-mono tracking-widest text-white shadow-lg flex items-center gap-2 ${index % 2 === 0 ? 'border-l-primary' : 'border-l-accent'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${index % 2 === 0 ? 'bg-primary' : 'bg-accent'}`}></span>
                          {product.brand}
                        </div>
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="relative z-10 w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500 saturate-110 drop-shadow-2xl"
                        />
                      </Link>
                      <div className="p-6 flex flex-col flex-1 border-t border-white/5 relative bg-[#050505]">
                        <Link href={`/product/${product.id}`} className="hover:opacity-80 transition-opacity">
                          <h3 className="font-heading font-bold text-lg mb-3 leading-tight tracking-wide text-white">
                            {product.name}
                          </h3>
                        </Link>
                        
                        <div className="mt-auto grid grid-cols-2 gap-2 pt-6">
                          <Link 
                            href={`/product/${product.id}`}
                            className="flex items-center justify-center py-2.5 bg-accent/10 border border-accent text-accent font-heading text-xs font-semibold uppercase hover:bg-accent hover:text-[#050505] transition-all duration-300 shadow-[0_0_10px_rgba(255,0,255,0.2)] hover:shadow-[0_0_20px_rgba(255,0,255,0.5)]"
                          >
                            View Specs
                          </Link>
                          <Link 
                            href={getAffiliateUrl(product.amazonUrl)}
                            target="_blank"
                            rel="nofollow noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 py-2.5 bg-primary/10 border border-primary text-primary font-heading text-xs font-semibold uppercase hover:bg-primary hover:text-[#050505] transition-colors"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            Amazon
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
            )}

            {/* Pagination Menu */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-12 gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentPage(i + 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-10 h-10 flex items-center justify-center rounded-full font-heading font-bold text-sm transition-colors ${
                      currentPage === i + 1 
                        ? 'bg-primary text-black' 
                        : 'bg-[#050505] text-zinc-400 border border-white/10 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
