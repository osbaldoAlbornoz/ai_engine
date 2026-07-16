"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { HardwareProduct } from "@/types/product";
import { AlertTriangle, CheckCircle2, Cpu, MemoryStick, Zap } from "lucide-react";
import { calculateAIScore, assignTier } from "@/utils/scoring";

interface BottleneckCheckerProps {
  product: HardwareProduct;
}

type CpuTier = "high" | "mid" | "low";
type RamTier = "8" | "16" | "32" | "64";

export function BottleneckChecker({ product }: BottleneckCheckerProps) {
  const [cpu, setCpu] = useState<CpuTier>("mid");
  const [ram, setRam] = useState<RamTier>("32");

  const score = useMemo(() => calculateAIScore(product), [product]);
  const gpuTier = useMemo(() => assignTier(score), [score]);

  // If it's not a GPU, the bottleneck logic doesn't strictly apply as a modular component
  if (product.category !== "gpus") {
    return null;
  }

  const { bottleneckPercent, status, color, message, recommendations } = useMemo(() => {
    let cpuPenalty = 0;
    if (cpu === "mid") cpuPenalty = 15;
    if (cpu === "low") cpuPenalty = 35;

    let ramPenalty = 0;
    if (ram === "16") ramPenalty = 20;
    if (ram === "8") ramPenalty = 45;

    // The stronger the GPU, the more it demands from the rest of the system
    let multiplier = 1;
    if (gpuTier === "S") multiplier = 1.5;
    if (gpuTier === "A") multiplier = 1.2;
    if (gpuTier === "B") multiplier = 0.8;
    if (gpuTier === "C") multiplier = 0.5;

    let totalPenalty = Math.min(100, Math.round((cpuPenalty + ramPenalty) * multiplier));

    let status = "Optimal";
    let color = "text-emerald-400";
    let message = "Your system is well-balanced to handle this GPU for AI workloads.";
    let recommendations: string[] = [];

    if (totalPenalty > 15 && totalPenalty <= 40) {
      status = "Minor Bottleneck";
      color = "text-amber-400";
      message = "You might not get 100% of the theoretical performance from this GPU.";

      if (cpu !== "high") recommendations.push("Consider upgrading to a newer generation i7/i9 or Ryzen 7/9.");
      if (ram === "16" || ram === "8") recommendations.push("Upgrade to at least 32GB of System RAM. AI models require significant system memory to move data to the GPU.");
    } else if (totalPenalty > 40) {
      status = "Severe Bottleneck";
      color = "text-red-400";
      message = "Your current system will significantly hold back this GPU. Not recommended without other upgrades.";

      if (cpu === "low") recommendations.push("Your older/entry-level CPU will limit data transfer rates (PCIe lanes) to the GPU.");
      if (ram === "8" || ram === "16") recommendations.push("Your RAM is too low. Out-Of-Memory (OOM) errors are highly likely when offloading models.");
    } else {
      recommendations.push("Your CPU won't limit PCIe bandwidth.");
      recommendations.push("Sufficient RAM to handle model offloading and context windows.");
    }

    return { bottleneckPercent: totalPenalty, status, color, message, recommendations };
  }, [cpu, ram, gpuTier]);

  return (
    <section className="my-16">
      <div className="flex items-center gap-3 mb-8">
        <AlertTriangle className="w-8 h-8 text-primary" />
        <h2 className="text-2xl md:text-3xl font-bold text-white font-heading">
          Bottleneck Checker
        </h2>
      </div>

      <div className="bg-[#050505] border border-white/10 rounded-lg p-6 lg:p-8 relative overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] group">
        {/* Technical Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-50 group-hover:opacity-70 transition-opacity duration-700" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Controls */}
          <div className="space-y-8">
            <div>
              <label className="flex items-center gap-2 text-sm font-heading tracking-widest text-zinc-400 uppercase mb-4">
                <Cpu className="w-4 h-4" /> Current Processor (CPU)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "high", label: "High-End", desc: "i9, Ryzen 9 (Latest Gen)" },
                  { id: "mid", label: "Mid-Range", desc: "i5/i7, Ryzen 5/7" },
                  { id: "low", label: "Entry / Old", desc: "i3, Ryzen 3, or >4 yrs old" }
                ].map(option => (
                  <button
                    key={option.id}
                    onClick={() => setCpu(option.id as CpuTier)}
                    className={`relative z-10 flex flex-col items-center justify-center p-3 rounded border text-center transition-all duration-300 ${cpu === option.id
                        ? "border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(0,229,255,0.2),inset_0_0_10px_rgba(0,229,255,0.1)]"
                        : "border-white/5 bg-white/5 text-zinc-400 hover:border-white/20 hover:bg-white/10"
                      }`}
                  >
                    <span className="font-bold text-sm mb-1">{option.label}</span>
                    <span className="text-[10px] opacity-70 hidden sm:block">{option.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-heading tracking-widest text-zinc-400 uppercase mb-4">
                <MemoryStick className="w-4 h-4" /> System RAM
              </label>
              <div className="grid grid-cols-4 gap-2">
                {["8", "16", "32", "64"].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setRam(amount as RamTier)}
                    className={`relative z-10 p-3 rounded border text-center transition-all duration-300 font-bold ${ram === amount
                        ? "border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(0,229,255,0.2),inset_0_0_10px_rgba(0,229,255,0.1)]"
                        : "border-white/5 bg-white/5 text-zinc-400 hover:border-white/20 hover:bg-white/10"
                      }`}
                  >
                    {amount}GB{amount === "64" ? "+" : ""}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-lg blur-xl pointer-events-none" />

            <motion.div
              className={`relative z-10 h-full flex flex-col justify-center p-6 border rounded-lg bg-black/80 backdrop-blur-sm shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] ${bottleneckPercent > 40 ? "border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.1)]" : bottleneckPercent > 15 ? "border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.1)]" : "border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
                }`}
              animate={{ opacity: 1 }}
              initial={{ opacity: 0 }}
            >
              <div className="flex items-end justify-between mb-4">
                <div>
                  <span className="text-xs font-heading uppercase tracking-widest text-zinc-500 block mb-1">Status</span>
                  <span className={`text-2xl font-bold font-heading ${color}`}>{status}</span>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-bold text-white font-heading">{bottleneckPercent}%</span>
                  <span className="text-xs font-heading uppercase tracking-widest text-zinc-500 block">Restriction</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-3 w-full bg-[#050505] rounded-full overflow-hidden mb-6 border border-white/5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                <motion.div
                  className={`h-full relative overflow-hidden ${bottleneckPercent > 40 ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" : bottleneckPercent > 15 ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]" : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                    }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(5, bottleneckPercent)}%` }}
                  transition={{ type: "spring", damping: 20 }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:20px_20px] animate-shimmer" />
                </motion.div>
              </div>

              <p className="text-zinc-300 text-sm mb-6">{message}</p>

              <div className="space-y-3 mt-auto">
                <span className="text-xs font-heading uppercase tracking-widest text-zinc-500">Analysis</span>
                {recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-zinc-400">
                    {bottleneckPercent > 15 ? (
                      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" />
                    )}
                    <span>{rec}</span>
                  </div>
                ))}
              </div>

            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
