"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { HardwareProduct } from "@/data/hardware";
import { calculateAIScore, assignTier, tierStyles, calculateValueRating } from "@/utils/scoring";
import { Activity, Brain, Zap, BarChart3, Database, CheckCircle2, XCircle, DollarSign, Cpu } from "lucide-react";

interface AIAnalysisProps {
  product: HardwareProduct;
}

export function AIAnalysis({ product }: AIAnalysisProps) {
  const score = useMemo(() => calculateAIScore(product), [product]);
  const tier = useMemo(() => assignTier(score), [score]);
  const valueRating = useMemo(() => calculateValueRating(score, product.price), [score, product.price]);
  const styles = tierStyles[tier];

  // Extract insights based on specs to explain the score
  const insights = useMemo(() => {
    const list = [];
    const specs = product.specs;
    const lowerSpecs = Object.fromEntries(Object.entries(specs).map(([k, v]) => [k.toLowerCase(), v.toLowerCase()]));

    // AI specific insights
    if (lowerSpecs["tensor cores"] || lowerSpecs["npu"] || lowerSpecs["ai engine"]) {
      list.push({
        icon: Brain,
        label: "Dedicated AI Silicon",
        value: specs["Tensor Cores"] || specs["NPU"] || specs["AI Engine"] || "Yes",
        desc: "Hardware acceleration specifically for matrix math operations."
      });
    }

    // Memory is crucial for AI
    if (lowerSpecs["memory"] || lowerSpecs["vram"]) {
      list.push({
        icon: Database,
        label: "Memory Capacity",
        value: specs["Memory"] || specs["VRAM"],
        desc: "Determines the maximum model size (like LLMs) that can be loaded into memory."
      });
    }

    // Performance
    if (lowerSpecs["ai performance"] || lowerSpecs["compute"] || lowerSpecs["tensor performance"]) {
      list.push({
        icon: Zap,
        label: "Raw Compute",
        value: specs["AI Performance"] || specs["Compute"] || specs["Tensor Performance"],
        desc: "The theoretical speed of inference and training workloads."
      });
    }

    // Bandwidth
    if (lowerSpecs["memory bandwidth"]) {
      list.push({
        icon: Activity,
        label: "Memory Bandwidth",
        value: specs["Memory Bandwidth"],
        desc: "Crucial for memory-bound tasks like text generation speed (tokens/sec)."
      });
    }

    // Add fallback if we only found 0 or 1 insights
    if (list.length < 2) {
      list.push({
        icon: Cpu,
        label: "General Architecture",
        value: specs["Architecture"] || specs["Base Clock"] || "Standard",
        desc: "Foundation for general computing tasks."
      });
    }

    return list;
  }, [product]);

  const derivedPros = useMemo(() => {
    if (product.pros && product.pros.length > 0) return product.pros;
    const pros: string[] = [];
    const specs = product.specs || {};
    const lowerSpecs = Object.fromEntries(Object.entries(specs).map(([k, v]) => [k.toLowerCase(), String(v).toLowerCase()]));

    if (score >= 80) pros.push("Elite-tier AI performance for demanding workloads");
    else if (score >= 60) pros.push("Strong capability for most AI development tasks");

    if (lowerSpecs["tensor cores"] || lowerSpecs["npu"]) pros.push("Features dedicated AI acceleration silicon");

    const vram = lowerSpecs["graphics card ram"] || lowerSpecs["vram"] || lowerSpecs["memory"];
    if (vram) {
      if (vram.includes("24") || vram.includes("48") || vram.includes("80") || vram.includes("128")) {
        pros.push(`Massive ${vram.toUpperCase().trim()} memory capacity is ideal for large models`);
      } else {
        pros.push(`Includes ${vram.toUpperCase().trim()} of memory for standard AI tasks`);
      }
    }

    if (product.price > 0 && score > 70 && product.price < 1000) {
      pros.push("Excellent price-to-performance ratio for AI computing");
    }

    if (pros.length === 0) {
      pros.push("Solid foundation for general computing and entry-level AI");
      pros.push("Compatible with standard machine learning frameworks");
    }

    return pros;
  }, [product, score]);

  const derivedCons = useMemo(() => {
    if (product.cons && product.cons.length > 0) return product.cons;
    const cons: string[] = [];
    const specs = product.specs || {};
    const lowerSpecs = Object.fromEntries(Object.entries(specs).map(([k, v]) => [k.toLowerCase(), String(v).toLowerCase()]));

    if (product.price > 2000) {
      cons.push("Significant upfront investment required");
    }

    const vram = lowerSpecs["graphics card ram"] || lowerSpecs["vram"] || lowerSpecs["memory"];
    if (vram && (vram.includes("8gb") || vram.includes("8 gb") || vram.includes("12gb") || vram.includes("12 gb") || vram.includes("4gb"))) {
      cons.push("Limited memory may restrict training very large models locally");
    }

    if (!lowerSpecs["tensor cores"] && !lowerSpecs["npu"] && !lowerSpecs["ai engine"] && product.category === 'gpus') {
      cons.push("Lacks next-gen dedicated AI silicon architecture");
    }

    if (score < 50) {
      cons.push("May bottleneck during intensive deep learning training phases");
    }

    if (cons.length === 0) {
      cons.push("High power consumption during sustained AI workloads");
      cons.push("May require advanced cooling solutions for continuous operation");
    }

    return cons;
  }, [product, score]);

  return (
    <section className="my-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none blur-3xl opacity-50" />

      <div className="relative z-10 p-1">
        <div className="flex flex-col mb-10">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-primary" />
            <h2 className="text-2xl md:text-3xl font-bold text-white font-heading">
              Deep AI Analysis
            </h2>
          </div>
          <p className="text-zinc-400 max-w-2xl">
            Our algorithmic breakdown of how the {product.name} performs specifically in artificial intelligence workflows, comparing compute, memory, and architectural advantages.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Main Score Card */}
          <div className="lg:col-span-5 relative group">
            {/* Animated border/glow wrapper */}
            <div className={`absolute -inset-0.5 bg-gradient-to-br from-white/10 to-transparent rounded-lg blur-md ${styles.shadow} opacity-70 group-hover:opacity-100 transition-opacity duration-500`} />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`relative bg-[#050505] border ${styles.border} p-8 flex flex-col h-full rounded-lg overflow-hidden shadow-[inset_0_0_60px_rgba(0,0,0,0.8)]`}
            >
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Brain className={`w-32 h-32 ${styles.text}`} />
              </div>

              <div className="relative z-10 flex flex-col items-center justify-center text-center h-full">
                <span className="text-zinc-400 font-heading tracking-widest uppercase text-sm mb-2">Performance Tier</span>
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className={`text-8xl md:text-9xl font-bold font-heading ${styles.text} drop-shadow-[0_0_30px_currentColor] mb-6`}
                >
                  {tier}
                </motion.div>

                <div className="w-full space-y-2 mt-auto">
                  <div className="flex justify-between items-end">
                    <span className="text-sm text-zinc-400 font-heading tracking-widest uppercase">AI Score</span>
                    <span className="text-3xl font-bold text-white font-heading">{score}<span className="text-zinc-500 text-lg">/100</span></span>
                  </div>
                  <div className="h-3 w-full bg-zinc-900 overflow-hidden border border-white/5 rounded-full shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${score}%` }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                      className={`h-full ${styles.bg} shadow-[0_0_15px_currentColor]`}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Insights Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {insights.map((insight, idx) => {
              const Icon = insight.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * idx }}
                  className="bg-[#050505] border border-white/5 p-6 rounded-lg hover:border-primary/50 transition-all duration-300 group relative overflow-hidden flex flex-col justify-center shadow-[inset_0_0_30px_rgba(0,0,0,0.5)] hover:shadow-[inset_0_0_40px_rgba(0,229,255,0.1)]"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-50" />
                  <div className="absolute -inset-full h-full w-full bg-gradient-to-r from-transparent via-primary/10 to-transparent group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
                  <div className="absolute top-0 left-0 w-1 h-full bg-white/10 group-hover:bg-primary transition-colors duration-300" />
                  <Icon className="w-6 h-6 text-zinc-500 mb-4 group-hover:text-primary transition-colors relative z-10" />
                  <h4 className="text-xs text-zinc-400 font-heading uppercase tracking-widest mb-1 relative z-10">{insight.label}</h4>
                  <p className="text-xl md:text-2xl font-bold text-white mb-2 line-clamp-1 relative z-10">{insight.value}</p>
                  <p className="text-sm text-zinc-500 line-clamp-3 relative z-10">{insight.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Value Proposition & Pros/Cons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">

          {/* Value Proposition Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`bg-[#050505] border ${valueRating.border} p-6 rounded-lg flex flex-col justify-center items-center text-center relative overflow-hidden group shadow-[inset_0_0_30px_rgba(0,0,0,0.5)] hover:shadow-[inset_0_0_40px_rgba(0,229,255,0.1)] transition-all duration-300`}
          >
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-50" />
            <div className={`absolute inset-0 ${valueRating.bg} opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />
            <DollarSign className={`w-10 h-10 mb-4 ${valueRating.color}`} />
            <h4 className="text-xs text-zinc-400 font-heading uppercase tracking-widest mb-2">Value Proposition</h4>
            <p className={`text-3xl font-bold font-heading ${valueRating.color} mb-3`}>{valueRating.label}</p>
            <p className="text-sm text-zinc-500 max-w-[200px]">
              {product.price > 0
                ? `Based on $${product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} price vs. ${score} AI Score`
                : "Pricing varies by configuration and retailer."}
            </p>
          </motion.div>

          {/* Pros */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-[#050505] border border-emerald-500/20 p-6 rounded-lg hover:border-emerald-500/40 transition-colors relative overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,0.5)] group"
          >
            <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
            <h4 className="flex items-center gap-2 text-xl font-bold text-white font-heading mb-6">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              Strengths
            </h4>
            <ul className="space-y-4">
              {derivedPros.map((pro, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm md:text-base text-zinc-300">
                  <span className="text-emerald-400 mt-1 shrink-0">•</span>
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Cons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-[#050505] border border-red-500/20 p-6 rounded-lg hover:border-red-500/40 transition-colors relative overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,0.5)] group"
          >
            <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
            <h4 className="flex items-center gap-2 text-xl font-bold text-white font-heading mb-6">
              <XCircle className="w-6 h-6 text-red-400" />
              Limitations
            </h4>
            <ul className="space-y-4">
              {derivedCons.map((con, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm md:text-base text-zinc-300">
                  <span className="text-red-400 mt-1 shrink-0">•</span>
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

