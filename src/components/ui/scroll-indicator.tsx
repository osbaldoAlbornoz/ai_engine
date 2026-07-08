"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming you have a cn utility, if not I'll just use template literals

interface ScrollIndicatorProps {
  text?: string;
  className?: string;
}

export function ScrollIndicator({ text = "Scroll to explore", className }: ScrollIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5, duration: 1 }}
      className={`flex flex-col items-center justify-center w-full gap-2 ${className || ""}`}
    >
      <span className="font-heading text-[10px] uppercase tracking-widest text-zinc-500">
        {text}
      </span>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <ArrowRight className="h-4 w-4 text-zinc-500 rotate-90" />
      </motion.div>
    </motion.div>
  );
}
