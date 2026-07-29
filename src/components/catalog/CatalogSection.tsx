"use client";

import React, { useState } from 'react';
import { Product } from '@/types/product';
import { ProductCard } from './ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

import { calculateAIScore } from '@/utils/scoring';

const CATEGORIES = ["All", "GPU", "Laptop", "NPU", "Workstation"];

// Función para mapear datos de Supabase a Product
function mapDbToProduct(dbProd: any): Product {
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
    specs: {
      vram: dbProd.specs?.VRAM || undefined,
      memory: dbProd.specs?.['Unified Memory'] || dbProd.specs?.Memory || undefined,
      tops: dbProd.specs?.['Total AI TOPS'] || undefined,
      storage: dbProd.specs?.Storage || undefined,
      tdp: dbProd.specs?.TDP || undefined,
    },
    features: dbProd.features,
    rating: dbProd.rating || 4.5,
    reviewsCount: dbProd.reviews_count || undefined,
    isPopular: dbProd.is_popular || false,
    status: dbProd.status,
    ai_score: calculateAIScore(dbProd),
  };
}

export function CatalogSection() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  
  const ITEMS_PER_PAGE = 12;

  // Usar React Query para cachear datos compartidos con otros componentes
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['activeProducts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').eq('status', 'active');
      if (error) throw error;
      return data;
    },
    select: (data) => data.map(mapDbToProduct),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1); // Reset to page 1 when changing category
  };

  const filteredProducts = products.filter(p => 
    activeCategory === "All" || p.category === activeCategory
  );

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <section className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 relative z-10">
      <div className="mb-8 flex flex-col items-center sm:items-start text-center sm:text-left">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight"
        >
          <span className="text-primary">Featured</span> Hardware
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-subtitle text-zinc-400 max-w-2xl text-lg"
        >
          Discover top-tier GPUs, Laptops, and AI accelerators handpicked for maximum performance in deep learning and creative workflows.
        </motion.p>
      </div>

      {/* Tabs Menu */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-10">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`font-heading relative px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
              activeCategory === cat 
                ? "text-white" 
                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
            }`}
          >
            {activeCategory === cat && (
              <motion.div 
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-primary/20 border border-primary/50 rounded-full shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">
              {cat === "NPU" ? "NPUs / CPUs" : cat === "Laptop" ? "AI Laptops" : cat === "GPU" ? "GPUs" : cat === "Workstation" ? "Workstations" : "All Hardware"}
            </span>
          </button>
        ))}
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 min-h-[500px]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#050505] border border-white/10 flex flex-col shadow-xl animate-pulse h-full">
              <div className="h-64 bg-white/5 border-b border-white/10"></div>
              <div className="p-6 flex flex-col flex-1">
                <div className="h-6 bg-white/10 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-white/10 rounded w-full mb-2"></div>
                <div className="h-4 bg-white/10 rounded w-1/2 mb-6"></div>
                <div className="mt-auto pt-5 border-t border-white/5 flex justify-between">
                  <div className="h-8 bg-white/10 rounded w-20"></div>
                  <div className="h-10 bg-white/10 rounded w-32"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 min-h-[500px] items-stretch">
          <AnimatePresence mode="popLayout">
            {currentProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </AnimatePresence>
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
              }}
              className={`w-10 h-10 flex items-center justify-center rounded-full font-heading font-bold text-sm transition-colors ${
                currentPage === i + 1 
                  ? 'bg-primary text-black' 
                  : 'bg-white/5 text-zinc-400 border border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
