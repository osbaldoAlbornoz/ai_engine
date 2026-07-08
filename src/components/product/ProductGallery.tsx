"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // If there are no images, return null or a fallback (handled by parent usually)
  if (!images || images.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative aspect-square md:aspect-[4/3] bg-[#050505] border border-white/10 rounded-none overflow-hidden group shadow-[inset_0_0_60px_rgba(0,0,0,0.5)] flex items-center justify-center p-8">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        <AnimatePresence mode="wait">
          <motion.img
            key={activeIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            src={images[activeIndex]}
            alt={`${productName} - Image ${activeIndex + 1}`}
            className="w-full h-full object-contain filter drop-shadow-[0_0_30px_rgba(0,229,255,0.2)] group-hover:scale-105 transition-transform duration-500 relative z-10"
          />
        </AnimatePresence>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative w-20 h-20 shrink-0 bg-[#050505] border transition-all duration-300 overflow-hidden flex items-center justify-center p-2 group ${
                activeIndex === idx 
                  ? "border-primary opacity-100 shadow-[0_0_15px_rgba(0,229,255,0.3)]" 
                  : "border-white/10 opacity-50 hover:opacity-80 hover:border-white/30"
              }`}
            >
              {activeIndex === idx && (
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,229,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,255,0.1)_1px,transparent_1px)] bg-[size:4px_4px] opacity-30 pointer-events-none" />
              )}
              <img 
                src={img} 
                alt={`Thumbnail ${idx + 1}`} 
                className="w-full h-full object-cover relative z-10"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
