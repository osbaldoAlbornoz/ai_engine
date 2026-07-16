"use client";

import { motion } from "framer-motion";
import { BenchmarkData } from "@/types/product";
import { Zap } from "lucide-react";

interface Props {
  benchmarks?: BenchmarkData[];
}

export function AIBenchmarks({ benchmarks }: Props) {
  if (!benchmarks || benchmarks.length === 0) return null;

  // Find max value to calculate percentage for progress bars
  const maxValue = Math.max(...benchmarks.map(b => b.value));

  return (
    <div className="mt-12 bg-[#050505] border border-white/5 rounded-lg p-6 md:p-8 relative overflow-hidden group shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] hover:border-primary/30 transition-all duration-500">
      {/* Technical Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-50 group-hover:opacity-80 transition-opacity duration-700" />

      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent opacity-50 group-hover:opacity-100 group-hover:shadow-[0_0_20px_rgba(0,229,255,0.6)] transition-all duration-500" />

      <div className="flex items-center gap-3 mb-8 relative z-10">
        <Zap className="w-6 h-6 text-accent drop-shadow-[0_0_8px_rgba(255,0,255,0.8)]" />
        <h3 className="text-xl md:text-2xl font-bold text-white font-heading">
          Real-World AI Benchmarks
        </h3>
      </div>

      <div className="space-y-6 relative z-10">
        {benchmarks.map((bm, idx) => {
          const percentage = Math.max((bm.value / maxValue) * 100, 10);

          return (
            <div key={idx} className="relative group/bar">
              <div className="flex justify-between items-end mb-2">
                <span className="text-zinc-300 font-medium group-hover/bar:text-white transition-colors">{bm.model}</span>
                <span className="text-primary font-bold font-heading drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]">
                  {bm.value} <span className="text-xs text-zinc-500 uppercase tracking-widest">{bm.metric}</span>
                </span>
              </div>
              <div className="h-3 w-full bg-[#0a0a0a] rounded-full overflow-hidden border border-white/5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: 0.1 * idx, ease: "easeOut" }}
                  viewport={{ once: true }}
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full relative shadow-[0_0_15px_rgba(0,229,255,0.6)]"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:20px_20px] animate-shimmer" />
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
