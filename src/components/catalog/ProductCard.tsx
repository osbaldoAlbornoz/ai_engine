"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Cpu, Zap, Star, HardDrive } from 'lucide-react';
import { Product } from '@/data/products';
import Link from 'next/link';

export function ProductCard({ product }: { product: Product }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      className="relative group rounded-none overflow-hidden bg-[#050505] border border-white/10 hover:border-primary/50 transition-all duration-300 shadow-xl hover:-translate-y-2 hover:shadow-[0_10px_30px_-10px_rgba(0,255,255,0.15)] h-full flex flex-col"
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/0 via-primary/0 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Image container - Showroom Style */}
      <Link href={`/product/${product.id}`} className="block relative h-64 w-full flex items-center justify-center bg-gradient-to-b from-white via-zinc-50 to-zinc-200 overflow-hidden shrink-0 border-b border-white/10">
        {/* Sci-fi scanner line effect */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/30 blur-[1px] group-hover:animate-pulse"></div>
        
        {/* Tech grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none"></div>

        {/* Inner shadow/vignette to make the white feel enclosed */}
        <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.25)] pointer-events-none"></div>
        
        {/* Pedestal glow at the bottom */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1/4 bg-primary/10 blur-2xl rounded-full pointer-events-none group-hover:bg-primary/20 transition-all duration-500"></div>

        <img
          src={product.imageUrl}
          alt={product.title}
          className="relative z-10 w-full h-full object-contain p-8 group-hover:scale-110 transition-transform duration-500 mix-blend-multiply saturate-110 drop-shadow-2xl"
        />

        {product.isPopular && (
          <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md border border-white/10 border-l-2 border-l-primary px-3 py-1.5 text-[10px] uppercase font-mono tracking-widest text-white shadow-lg flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-primary"></span>
            Popular
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-6 relative z-10 flex flex-col flex-grow justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="font-heading text-[11px] font-mono text-primary uppercase tracking-widest bg-primary/10 px-2 py-1 rounded-none border border-primary/20">{product.brand}</span>
            {product.rating && (
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="text-xs font-semibold">{product.rating}</span>
                <span className="text-[10px] text-zinc-500">({product.reviewsCount})</span>
              </div>
            )}
          </div>
          <Link href={`/product/${product.id}`} className="hover:opacity-80 transition-opacity">
            <h3 className="text-lg font-bold text-zinc-100 leading-tight mb-2 line-clamp-2">{product.title}</h3>
          </Link>
          <p className="text-sm text-zinc-400 line-clamp-2 mb-4 leading-relaxed">{product.description}</p>

          {/* Specs */}
          <div className="flex flex-wrap gap-2">
            {(product.specs.vram || product.specs.memory) && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none bg-[#050505] border border-white/10 text-xs text-zinc-300">
                <Cpu className="w-3.5 h-3.5 text-primary" /> {product.specs.vram || product.specs.memory}
              </span>
            )}
            {product.specs.storage && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none bg-[#050505] border border-white/10 text-xs text-zinc-300">
                <HardDrive className="w-3.5 h-3.5 text-zinc-400" /> {product.specs.storage}
              </span>
            )}
            {product.specs.tops && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none bg-[#050505] border border-white/10 text-xs text-zinc-300">
                <Zap className="w-3.5 h-3.5 text-accent" /> {product.specs.tops} TOPS
              </span>
            )}
            {product.specs.tdp && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none bg-[#050505] border border-white/10 text-xs text-zinc-300">
                <Zap className="w-3.5 h-3.5 text-accent" /> {product.specs.tdp}
              </span>
            )}
          </div>
        </div>

        {/* Price and CTA */}
        <div className="mt-6 flex items-center justify-between pt-5 border-t border-white/5">
          <div className="flex flex-col min-w-[80px]">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">Est. Price</span>
            <span className="font-heading text-xl font-bold text-white tracking-tight">{product.price > 0 ? `$${product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Varies"}</span>
          </div>
          <a
            href={product.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 bg-primary/10 hover:bg-primary border border-primary/30 hover:border-primary text-primary hover:text-[#050505] rounded-none transition-all duration-300 shadow-[0_0_15px_rgba(0,229,255,0.1)] hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] relative overflow-hidden group/btn"
          >
            {/* Button sweep effect */}
            <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"></div>

            <ShoppingCart className="w-4 h-4 relative z-10" />
            <span className="font-heading text-sm font-semibold relative z-10">Check on Amazon</span>
          </a>
        </div>
      </div>
    </motion.div>
  );
}
