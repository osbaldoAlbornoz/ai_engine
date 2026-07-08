"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Info } from "lucide-react";
import { jargonDictionary } from "@/data/jargon";

interface JargonBusterProps {
  term: string;
  children: React.ReactNode;
}

export function JargonBuster({ term, children }: JargonBusterProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const spanRef = useRef<HTMLSpanElement>(null);

  const data = jargonDictionary[term.toLowerCase()];

  // Update coordinates when hovered
  useEffect(() => {
    if (isHovered && spanRef.current) {
      const rect = spanRef.current.getBoundingClientRect();
      setCoords({
        x: rect.left + rect.width / 2,
        y: rect.top - 8 // 8px spacing above the text
      });
    }
  }, [isHovered]);

  if (!data) return <>{children}</>;

  const tooltip = isHovered && typeof document !== "undefined" ? createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 5, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        style={{ left: coords.x, top: coords.y }}
        className="fixed -translate-x-1/2 -translate-y-full w-64 p-4 bg-[#0a0a0a]/95 backdrop-blur-xl border border-primary/40 rounded-lg shadow-[0_0_25px_rgba(0,229,255,0.15)] z-[9999] pointer-events-none"
      >
        <h4 className="text-primary font-heading font-bold text-sm mb-1">{data.title}</h4>
        <p className="text-zinc-300 text-xs leading-relaxed font-sans">{data.definition}</p>
        
        {/* Glow behind the arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-4 h-4 bg-primary/20 blur-md rounded-full -mt-2" />
        
        {/* Arrow pointer */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-8 border-transparent border-t-primary/40" />
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[2px] border-8 border-transparent border-t-[#0a0a0a]" />
      </motion.div>
    </AnimatePresence>,
    document.body
  ) : null;

  return (
    <>
      <span 
        ref={spanRef}
        className="relative inline-flex items-center gap-1 cursor-help group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span className="border-b border-dashed border-primary/50 text-zinc-300 group-hover:text-primary transition-colors font-medium">
          {children}
        </span>
        <Info className="w-3.5 h-3.5 text-primary/50 group-hover:text-primary transition-colors mb-0.5" />
      </span>
      {tooltip}
    </>
  );
}
