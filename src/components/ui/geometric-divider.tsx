"use client";

import { cn } from "@/lib/utils";

type DividerVariant = "circuit" | "laser" | "dots" | "crosses";

export function GeometricDivider({ 
  className, 
  variant = "circuit" 
}: { 
  className?: string;
  variant?: DividerVariant;
}) {
  return (
    <div className={cn("hidden md:flex flex-col justify-center items-center w-12 lg:w-16 shrink-0 relative opacity-60", className)}>
      
      {/* VARIANT 1: CIRCUIT (Original but refined) */}
      {variant === "circuit" && (
        <>
          <svg 
            className="absolute inset-0 h-full w-full text-zinc-300 dark:text-zinc-700" 
            preserveAspectRatio="none" 
            viewBox="0 0 40 100"
          >
            <path 
              d="M 20 0 L 20 40 L 12 45 L 12 55 L 20 60 L 20 100" 
              fill="none" stroke="currentColor" strokeWidth="2" 
              vectorEffect="non-scaling-stroke" strokeDasharray="4 6" className="opacity-30"
            />
            <path 
              d="M 20 0 L 20 40 L 12 45 L 12 55 L 20 60 L 20 100" 
              fill="none" stroke="currentColor" strokeWidth="1" 
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-[8px] w-2 h-2 rotate-45 border border-primary bg-primary/20 shadow-[0_0_10px_rgba(139,92,246,0.6)]" />
          <div className="absolute top-1/4 -translate-x-0 w-1 h-1 rounded-full bg-zinc-400" />
          <div className="absolute bottom-1/4 -translate-x-0 w-1 h-1 rounded-full bg-zinc-400" />
        </>
      )}

      {/* VARIANT 2: NEON LASER */}
      {variant === "laser" && (
        <div className="relative h-full w-[1px] flex items-center justify-center">
          <div className="absolute top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
          <div className="absolute top-1/2 -translate-y-1/2 w-[2px] h-1/3 bg-primary shadow-[0_0_15px_2px_rgba(139,92,246,0.8)] rounded-full" />
        </div>
      )}

      {/* VARIANT 3: CYBER DOTS */}
      {variant === "dots" && (
        <div className="flex flex-col gap-6 items-center">
          <div className="w-1 h-1 rounded-full bg-zinc-700" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary/50 shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_15px_rgba(139,92,246,0.8)]" />
          <div className="w-1.5 h-1.5 rounded-full bg-accent/50 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
          <div className="w-1 h-1 rounded-full bg-zinc-700" />
        </div>
      )}

      {/* VARIANT 4: DATA CROSSES */}
      {variant === "crosses" && (
        <div className="flex flex-col gap-8 items-center text-zinc-600">
          <span className="text-[10px] font-mono leading-none">+</span>
          <span className="text-[14px] font-mono leading-none text-accent shadow-[0_0_10px_rgba(6,182,212,0.4)]">+</span>
          <span className="text-[10px] font-mono leading-none">+</span>
        </div>
      )}

    </div>
  );
}
