"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { hardwareData, Category, HardwareProduct } from "@/data/hardware";
import { ShoppingCart, ChevronDown, Plus, X, Trophy, Check } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { calculateAIScore, assignTier, tierStyles, calculateValueRating } from "@/utils/scoring";
import { supabase } from "@/lib/supabase";

const categories: { id: Category; label: string }[] = [
  { id: "gpus", label: "Graphic Cards (GPUs)" },
  { id: "laptops", label: "AI Laptops" },
  { id: "npus", label: "Processors (NPUs)" },
  { id: "workstations", label: "Workstations" },
];

function CustomSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { id: string; name: string }[];
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.id === value);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative flex-grow min-w-0" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="font-heading w-full bg-[#050505] border-2 border-primary/60 hover:border-primary shadow-[0_0_15px_rgba(0,229,255,0.15)] transition-all text-white pl-4 pr-10 py-2.5 rounded-none focus:outline-none focus:ring-1 focus:ring-primary font-semibold cursor-pointer text-sm truncate flex items-center justify-between"
      >
        <span className="truncate">{selectedOption?.name || "Select Product"}</span>
        <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-1 bg-[#050505] border border-primary/40 shadow-[0_5px_20px_rgba(0,229,255,0.2)] max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent"
          >
            {options.map((opt) => (
              <div
                key={opt.id}
                onClick={() => {
                  onChange(opt.id);
                  setIsOpen(false);
                }}
                className={`font-heading px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                  opt.id === value
                    ? "bg-primary/20 text-primary border-l-2 border-primary font-bold"
                    : "text-zinc-300 hover:bg-zinc-800 hover:text-primary border-l-2 border-transparent"
                }`}
              >
                {opt.name}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CompareTool() {
  const [activeCategory, setActiveCategory] = useState<Category>("gpus");
  const [products, setProducts] = useState<HardwareProduct[]>(hardwareData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.from('products').select('*').eq('status', 'active');
      if (data && !error) {
        const dbProducts = data.map(dbProd => ({
          id: dbProd.id,
          name: dbProd.name,
          category: (dbProd.category || "gpus") as Category,
          brand: dbProd.brand || "Unknown",
          price: dbProd.price || 0,
          originalPrice: dbProd.original_price || undefined,
          image: dbProd.image_url || "",
          amazonUrl: dbProd.amazon_url || "#",
          specs: dbProd.specs || {},
          keyFeatures: dbProd.features || [],
          pros: dbProd.pros || [],
          cons: dbProd.cons || [],
        }));
        
        const dbCategories = new Set(dbProducts.map(p => p.category));
        const filteredStatic = hardwareData.filter(p => !dbCategories.has(p.category));
        
        setProducts([...dbProducts, ...filteredStatic]);
      }
      setIsLoading(false);
    };
    fetchProducts();
  }, []);

  const categoryProducts = useMemo(() => {
    return products.filter((p) => p.category === activeCategory);
  }, [activeCategory, products]);

  const [selectedProdIds, setSelectedProdIds] = useState<string[]>([
    categoryProducts[0]?.id || "",
    categoryProducts[1]?.id || categoryProducts[0]?.id || "",
  ]);

  useEffect(() => {
    const prods = products.filter((p) => p.category === activeCategory);
    if (prods.length > 0) {
      setSelectedProdIds(current => {
        let needsUpdate = false;
        current.forEach(id => {
          if (!prods.find(p => p.id === id)) {
            needsUpdate = true;
          }
        });
        
        if (needsUpdate) {
          return [
            prods[0]?.id || "",
            prods[1]?.id || prods[0]?.id || "",
          ];
        }
        return current;
      });
    }
  }, [products, activeCategory]);

  const handleCategoryChange = (cat: Category) => {
    setActiveCategory(cat);
    const prods = products.filter((p) => p.category === cat);
    setSelectedProdIds([
      prods[0]?.id || "",
      prods[1]?.id || prods[0]?.id || "",
    ]);
  };

  const updateProduct = (index: number, newId: string) => {
    const newSelected = [...selectedProdIds];
    newSelected[index] = newId;
    setSelectedProdIds(newSelected);
  };

  const addProduct = () => {
    if (selectedProdIds.length < 3) {
      setSelectedProdIds([...selectedProdIds, categoryProducts[0]?.id || ""]);
    }
  };

  const removeProduct = (index: number) => {
    if (selectedProdIds.length > 2) {
      const newSelected = [...selectedProdIds];
      newSelected.splice(index, 1);
      setSelectedProdIds(newSelected);
    }
  };

  const selectedProducts = useMemo(() => {
    return selectedProdIds.map(id => categoryProducts.find(p => p.id === id)).filter(Boolean) as HardwareProduct[];
  }, [selectedProdIds, categoryProducts]);

  const { scores, maxScore } = useMemo(() => {
    const scores = selectedProducts.map(p => calculateAIScore(p));
    const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
    return { scores, maxScore };
  }, [selectedProducts]);

  const specKeys = useMemo(() => {
    const keys = new Set<string>();
    selectedProducts.forEach(p => {
      Object.keys(p.specs).forEach(k => keys.add(k));
    });
    return Array.from(keys);
  }, [selectedProducts]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-4 relative">
      <div className="bg-[#050505] border border-white/10 rounded-none shadow-2xl relative">
        
        {/* Unified Sticky Header for the Table */}
        <div className="sticky top-16 z-40 bg-[#050505] border-b border-white/10 pt-5 pb-5 px-4 sm:px-6 lg:px-8 rounded-none shadow-xl flex flex-col gap-5">
          
          {/* Title & Category Selector */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-zinc-800/50 pb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
              Hardware Matchup
            </h1>
            
            <div className="flex flex-wrap justify-start md:justify-end gap-2 sm:gap-3 w-full md:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`font-heading px-4 py-1.5 rounded-none font-semibold text-xs sm:text-sm transition-all duration-300 ${activeCategory === cat.id
                      ? "bg-primary text-[#050505] shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                      : "bg-zinc-900/80 text-zinc-400 hover:text-primary hover:bg-zinc-800/80 border border-white/10"
                    }`}
                >
                  {cat.label}
                </button>
              ))}
              {selectedProdIds.length < 3 && (
                <button
                  onClick={addProduct}
                  className="font-heading px-4 py-1.5 rounded-none font-semibold text-xs sm:text-sm transition-all duration-300 bg-zinc-900/80 text-primary hover:bg-primary/20 border border-primary/50 flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" /> Add Product
                </button>
              )}
            </div>
          </div>

          {/* Product Selectors Row */}
          <div className={`grid grid-cols-1 ${selectedProdIds.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6 md:gap-0 md:divide-x divide-zinc-800/80`}>
            {selectedProdIds.map((prodId, idx) => {
              const product = selectedProducts[idx];
              return (
                <div key={`selector-${idx}`} className={`flex flex-col gap-3 ${idx === 0 ? 'md:pr-6' : idx === selectedProdIds.length - 1 ? 'md:pl-6' : 'md:px-6'}`}>
                  <div className="flex items-center gap-2">
                    <CustomSelect
                      value={prodId}
                      options={categoryProducts.map(p => ({ id: p.id, name: p.name }))}
                      onChange={(val) => updateProduct(idx, val)}
                    />
                    {selectedProdIds.length > 2 && (
                      <button onClick={() => removeProduct(idx)} className="p-2 border-2 border-red-500/50 hover:border-red-500 text-red-500 hover:bg-red-500/10 transition-colors h-[44px]">
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  {product && (
                    <div className="flex justify-between items-center bg-[#050505] p-2 rounded-none border border-white/10">
                      <div className="flex flex-col">
                        <span className="text-sm text-zinc-300 line-clamp-1">{product.name}</span>
                        <span className="text-xs text-primary">{product.price > 0 ? `$${product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Price Varies"}</span>
                      </div>
                      <Link
                        href={product.amazonUrl}
                        target="_blank"
                        className="font-heading inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-[#050505] py-1.5 px-4 rounded-none font-semibold transition-all shadow-[0_0_10px_rgba(0,229,255,0.3)] text-xs sm:text-sm"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span className="hidden xl:inline">Amazon</span>
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className={`grid grid-cols-1 ${selectedProdIds.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} divide-y md:divide-y-0 md:divide-x divide-zinc-800/80 relative z-10`}>
          {selectedProdIds.map((prodId, idx) => {
            const product = selectedProducts[idx];
            const score = scores[idx];
            const tier = score ? assignTier(score) : "C";
            const tStyle = tierStyles[tier];
            const isWinner = score > 0 && score === maxScore;

            return (
              <div key={`details-${idx}`} className="p-4 sm:p-6 lg:p-8 flex flex-col relative bg-transparent rounded-none">
                <AnimatePresence mode="wait">
                  {product && (
                    <motion.div
                      key={product.id + "-details"}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col h-full"
                    >
                      <div className={`aspect-[16/9] relative rounded-none overflow-hidden mb-6 bg-[#050505] border ${isWinner ? 'border-primary shadow-[0_0_20px_rgba(0,229,255,0.2)]' : 'border-white/10'} group transition-all duration-500`}>
                        <img src={product.image} alt={product.name} className="object-contain p-4 w-full h-full opacity-80 group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
                        
                        {isWinner && (
                          <div className="absolute top-3 left-3 bg-primary/20 border border-primary text-primary px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 font-heading backdrop-blur-sm z-10 shadow-[0_0_10px_rgba(0,229,255,0.3)]">
                            <Trophy className="w-3.5 h-3.5" /> Top Choice
                          </div>
                        )}

                        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end z-10">
                           <div className="flex flex-col">
                              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-heading mb-0.5">AI Score</span>
                              <span className="text-2xl font-bold font-heading text-white leading-none">{score}</span>
                           </div>
                           <div className={`w-10 h-10 flex items-center justify-center rounded-none bg-[#050505]/80 backdrop-blur-sm border ${tStyle.border} ${tStyle.shadow}`}>
                              <span className={`text-xl font-bold font-heading ${tStyle.text}`}>{tier}</span>
                           </div>
                        </div>
                      </div>

                      <div className="mb-6 flex justify-between items-center">
                        {(() => {
                           const valueRating = calculateValueRating(score, product.price);
                           return (
                             <div className={`inline-flex items-center px-3 py-1 rounded-none border ${valueRating.border} ${valueRating.bg}`}>
                               <span className={`font-heading text-xs uppercase tracking-wider font-semibold ${valueRating.color}`}>
                                 {valueRating.label}
                               </span>
                             </div>
                           )
                        })()}
                        <span className="text-sm text-zinc-400 font-heading">
                          {product.price > 0 ? `$${product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Price Varies"}
                        </span>
                      </div>

                      <div className="space-y-4 flex-grow mb-4">
                        {specKeys.map((key) => (
                          <div key={key} className="flex flex-col">
                            <span className="font-heading text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">{key}</span>
                            <span className="text-sm text-zinc-200 font-medium bg-[#050505] px-3 py-2 rounded-none border border-white/10">
                              {product.specs[key] || "N/A"}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Pros and Cons */}
                      <div className="flex flex-col gap-4 mb-6 mt-2 border-t border-white/10 pt-4">
                        {product.pros && product.pros.length > 0 && (
                          <div>
                            <span className="font-heading text-xs text-emerald-400 uppercase tracking-wider font-semibold mb-2 block">Pros</span>
                            <ul className="space-y-2">
                              {product.pros.map((pro, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                  <span>{pro}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {product.cons && product.cons.length > 0 && (
                          <div>
                            <span className="font-heading text-xs text-red-400 uppercase tracking-wider font-semibold mb-2 block">Cons</span>
                            <ul className="space-y-2">
                              {product.cons.map((con, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                                  <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                  <span>{con}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="mt-auto">
                        <Link 
                          href={`/product/${product.id}`}
                          className="font-heading block w-full text-center border-2 border-primary/50 hover:border-primary text-primary hover:bg-primary/10 py-3 font-semibold transition-all duration-300 text-sm uppercase tracking-wider"
                        >
                          View Full Details
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
