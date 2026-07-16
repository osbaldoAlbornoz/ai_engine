"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const brands = [
  "NVIDIA",
  "AMD",
  "INTEL",
  "QUALCOMM",
  "APPLE",
  "META",
  "OPENAI",
  "GOOGLE",
  "ANTHROPIC",
  "MISTRAL",
];

export function BrandMarquee({ className }: { className?: string }) {
  // We duplicate the array 4 times to ensure it's wide enough.
  // 50% of the content will exactly represent 2 complete sets.
  const repeatedBrands = [...brands, ...brands, ...brands, ...brands];

  return (
    <div className={cn("relative flex w-full overflow-hidden py-2", className)}>
      {/* Top Gradient Border */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-60"></div>
      
      {/* Bottom Gradient Border */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-60"></div>
      
      <div className="flex w-full py-2 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <motion.div
          className="flex flex-none items-center pr-12 sm:pr-24"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 120,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ willChange: "transform" }}
        >
          {repeatedBrands.map((brand, idx) => (
            <div key={idx} className="flex items-center">
              <span className="text-xl sm:text-2xl font-heading font-bold text-primary/70 uppercase tracking-widest whitespace-nowrap hover:text-primary hover:drop-shadow-[0_0_8px_rgba(0,229,255,0.8)] transition-all cursor-default px-8 sm:px-12">
                {brand}
              </span>
              <span className="text-accent/50 font-mono text-sm font-bold tracking-tighter">{/* /*/}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
