"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Zap, Cpu, Laptop, CircuitBoard, Target, Server } from "lucide-react";
import dynamic from 'next/dynamic';
const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => <div className="w-full h-full animate-pulse bg-zinc-800/10 rounded-none flex items-center justify-center text-xs text-zinc-500 font-heading font-mono">Loading...</div>
});
import { BorderRotate } from "@/components/ui/animated-gradient-border";
import { BrandMarquee } from "@/components/ui/brand-marquee";
import { ScrollIndicator } from "@/components/ui/scroll-indicator";
const TubesBackground = dynamic(() => import("@/components/ui/neon-flow").then(mod => mod.TubesBackground), {
  ssr: false
});
import { useState, useEffect } from "react";

function DelayedSpline() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    // Delay Spline load by 2 seconds so TubesBackground can initialize its WebGL context first
    const t = setTimeout(() => setShow(true), 2500);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;


  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1 }}
      className="absolute flex items-center justify-center w-[280px] h-[280px] xl:w-[320px] xl:h-[320px] right-[-60px] xl:right-[-100px] top-[40%] -translate-y-1/2 pointer-events-auto z-10"
    >
      <Spline scene="https://prod.spline.design/GrcaP5js8LN5vDWi/scene.splinecode" />
    </motion.div>
  );
}

export interface TopProduct {
  id: string;
  name: string;
  specs: Record<string, string>;
  aiScore?: number | null;
}

interface HeroSectionProps {
  topGPU?: TopProduct | null;
  topLaptop?: TopProduct | null;
  topNPU?: TopProduct | null;
  topWorkstation?: TopProduct | null;
}

export function HeroSection({ topGPU, topLaptop, topNPU, topWorkstation }: HeroSectionProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" as const },
    },
  };

  return (
    // min-h fills viewport minus the ~56px navbar so footer stays below the fold on load
    <section className="relative min-h-[calc(100vh-64px)] flex flex-col justify-start pt-6 pb-6 overflow-hidden">
      {/* Background Gradients & Grid */}
      <div className="absolute inset-0 w-full h-full bg-background -z-30"></div>

      {/* Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-20 mix-blend-screen opacity-60 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-accent/20 rounded-full blur-[150px] -z-20 mix-blend-screen opacity-50 pointer-events-none"></div>

      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:40px_40px] -z-10 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      {/* Noise Texture */}
      <div
        className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none z-0 mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      ></div>

      <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* TOP SECTION: Text on Left, Robot on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-6">

          {/* Text Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col space-y-6 text-center lg:text-left relative z-20"
          >
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-3 mx-auto lg:mx-0">
              {/* Active Status Indicator */}
              <div className="flex items-center gap-2 bg-[#050505] border border-primary/30 rounded-none px-2.5 py-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-none bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-none h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                </span>
                <span className="text-label text-[9px] text-zinc-400">SYS.ONLINE // V.2.0.4</span>
              </div>

              {/* Zap Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-primary/10 border border-primary/20 text-primary">
                <Zap className="h-4 w-4" />
                <span className="text-label text-[11px]">Next-Gen Performance</span>
              </div>
            </motion.div>

            <motion.h1 variants={itemVariants} className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter text-foreground leading-[1.1] uppercase">
              The Ultimate <br />
              <span className="whitespace-nowrap">
                <span className="text-neon">
                  AI Hardware
                </span>{" "}
                Engine
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-subtitle text-base sm:text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Compare and discover the most powerful GPUs, Laptops, and NPUs for AI workloads.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <a href="#hardware-matcher" className="text-label px-6 py-3 rounded-sm bg-gradient-to-r from-primary to-accent text-black hover:opacity-90 transition-opacity flex items-center justify-center gap-2 w-full text-sm font-bold">
                  <Target className="h-4 w-4" /> Find Your Match
                </a>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Link href="/category/gpus" className="text-label px-6 py-3 rounded-sm border border-primary/50 text-primary hover:bg-primary/10 transition-colors flex items-center justify-center gap-2 w-full text-sm bg-transparent">
                  Explore GPUs <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Visual Container for Robot & Neon */}
          <div className="relative hidden lg:flex w-full h-[400px] items-center justify-end pr-8">
            {/* Main Visual Image - Neon Background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2 }}
              className="absolute flex items-center justify-center w-[600px] xl:w-[700px] h-[500px] xl:h-[600px] right-[-225px] xl:right-[-300px] top-[40%] -translate-y-1/2 pointer-events-none mix-blend-screen z-0 opacity-80 scale-[0.6] origin-center"
            >
              <TubesBackground className="w-full h-full relative !min-h-0 !bg-transparent" enableClickInteraction={false} />
            </motion.div>

            {/* Main Visual Image - Spline Robot (Delayed to avoid WebGL crash with TubesBackground) */}
            <DelayedSpline />
          </div>
        </div>

        {/* BRAND MARQUEE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full mb-4 relative z-50 pointer-events-none"
        >
          <p className="text-label text-center text-[10px] text-slate-500 mb-2">
            Leading the AI Hardware Revolution
          </p>
          <div className="pointer-events-auto">
            <BrandMarquee />
          </div>
        </motion.div>

        {/* BOTTOM: 4 Featured Hardware Cards — landscape rectangles */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col md:flex-row gap-5 w-full justify-between items-stretch mt-12 lg:mt-20 relative z-30"
        >
          {/* GPU Card */}
          <Link href={topGPU ? `/product/${topGPU.id}` : "/category/gpus"} className="flex-1 block">
            <BorderRotate
              className="w-full cursor-pointer transition-transform hover:-translate-y-1 duration-300 h-full"
              gradientColors={{ primary: "#00E5FF", secondary: "#FF00FF", accent: "#00E5FF" }}
              animationMode="rotate-on-hover"
              backgroundColor="#050505"
              spotlight={true}
            >
              <div className="relative p-5 flex flex-col justify-between h-full min-h-[140px]">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-[20px] rounded-none mix-blend-screen pointer-events-none"></div>
                <div className="relative z-10 h-full flex flex-col justify-between gap-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-label text-[10px] text-primary">Top GPU</span>
                    <CircuitBoard className="h-5 w-5 text-primary flex-shrink-0 drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base sm:text-lg text-primary leading-tight tracking-wide drop-shadow-[0_0_12px_rgba(0,229,255,0.6)] line-clamp-2" title={topGPU?.name}>{topGPU?.name || "NVIDIA RTX 4090"}</h3>
                    <p className="font-sans text-xs text-slate-300 mt-1.5 opacity-90 font-medium line-clamp-2">
                      {topGPU?.specs['Graphics Card Ram'] || topGPU?.specs['VRAM'] || ""}{topGPU?.specs['Graphics Card Ram'] || topGPU?.specs['VRAM'] ? " GB" : ""} • {topGPU?.specs['Graphics Coprocessor'] || topGPU?.specs['GPU Series'] || topGPU?.specs['CUDA Cores'] || "GPU"}
                    </p>
                  </div>
                </div>
              </div>
            </BorderRotate>
          </Link>

          {/* Laptop Card */}
          <Link href={topLaptop ? `/product/${topLaptop.id}` : "/category/laptops"} className="flex-1 block">
            <BorderRotate
              className="w-full cursor-pointer transition-transform hover:-translate-y-1 duration-300 h-full"
              gradientColors={{ primary: "#FF00FF", secondary: "#00E5FF", accent: "#FF00FF" }}
              animationMode="rotate-on-hover"
              backgroundColor="#050505"
              spotlight={true}
            >
              <div className="relative p-5 flex flex-col justify-between h-full min-h-[140px]">
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/5 blur-[20px] rounded-none mix-blend-screen pointer-events-none"></div>
                <div className="relative z-10 h-full flex flex-col justify-between gap-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-label text-[10px] text-accent">Top AI Laptop</span>
                    <Laptop className="h-5 w-5 text-accent flex-shrink-0 drop-shadow-[0_0_8px_rgba(255,0,255,0.8)]" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base sm:text-lg text-accent leading-tight tracking-wide drop-shadow-[0_0_12px_rgba(255,0,255,0.6)] line-clamp-2" title={topLaptop?.name}>{topLaptop?.name || "MacBook Pro M3 Max"}</h3>
                    <p className="font-sans text-xs text-slate-300 mt-1.5 opacity-90 font-medium line-clamp-2">
                      {topLaptop?.specs['Memory'] || topLaptop?.specs['Unified Memory'] || ""} • {topLaptop?.specs['Graphics Coprocessor'] || topLaptop?.specs['GPU'] || ""}
                    </p>
                  </div>
                </div>
              </div>
            </BorderRotate>
          </Link>

          {/* NPU Card */}
          <Link href={topNPU ? `/product/${topNPU.id}` : "/category/npus"} className="flex-1 block">
            <BorderRotate
              className="w-full cursor-pointer transition-transform hover:-translate-y-1 duration-300 h-full"
              gradientColors={{ primary: "#00E5FF", secondary: "#FF00FF", accent: "#00E5FF" }}
              animationMode="rotate-on-hover"
              backgroundColor="#050505"
              spotlight={true}
            >
              <div className="relative p-5 flex flex-col justify-between h-full min-h-[140px]">
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-primary/5 blur-[20px] rounded-none mix-blend-screen pointer-events-none"></div>
                <div className="relative z-10 h-full flex flex-col justify-between gap-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-label text-[10px] text-primary">Top NPU / CPU</span>
                    <Cpu className="h-5 w-5 text-primary flex-shrink-0 drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base sm:text-lg text-primary leading-tight tracking-wide drop-shadow-[0_0_12px_rgba(0,229,255,0.6)] line-clamp-2" title={topNPU?.name}>{topNPU?.name || "Snapdragon X Elite"}</h3>
                    <p className="font-sans text-xs text-slate-300 mt-1.5 opacity-90 font-medium line-clamp-2">
                      {topNPU?.specs['Processor Series'] || topNPU?.specs['Total AI TOPS'] || topNPU?.specs['AI Performance'] || ""} • {topNPU?.specs['Processor'] || topNPU?.specs['Architecture'] || ""}
                    </p>
                  </div>
                </div>
              </div>
            </BorderRotate>
          </Link>

          {/* Workstation Card */}
          <Link href={topWorkstation ? `/product/${topWorkstation.id}` : "/category/workstations"} className="flex-1 block">
            <BorderRotate
              className="w-full cursor-pointer transition-transform hover:-translate-y-1 duration-300 h-full"
              gradientColors={{ primary: "#FFD700", secondary: "#FFA500", accent: "#FFD700" }}
              animationMode="rotate-on-hover"
              backgroundColor="#050505"
              spotlight={true}
            >
              <div className="relative p-5 flex flex-col justify-between h-full min-h-[140px]">
                <div className="absolute top-0 left-0 w-24 h-24 bg-amber-500/5 blur-[20px] rounded-none mix-blend-screen pointer-events-none"></div>
                <div className="relative z-10 h-full flex flex-col justify-between gap-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-label text-[10px] text-amber-500">Top Workstation</span>
                    <Server className="h-5 w-5 text-amber-500 flex-shrink-0 drop-shadow-[0_0_8px_rgba(255,165,0,0.8)]" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base sm:text-lg text-amber-500 leading-tight tracking-wide drop-shadow-[0_0_12px_rgba(255,215,0,0.6)] line-clamp-2" title={topWorkstation?.name}>{topWorkstation?.name || "Dell Precision 7960"}</h3>
                    <p className="font-sans text-xs text-slate-300 mt-1.5 opacity-90 font-medium line-clamp-2">
                      {topWorkstation?.specs['Processor'] || topWorkstation?.specs['CPU'] || ""} • {topWorkstation?.specs['Memory'] || topWorkstation?.specs['RAM'] || ""}
                    </p>
                  </div>
                </div>
              </div>
            </BorderRotate>
          </Link>
        </motion.div>

      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 hidden md:flex">
        <ScrollIndicator text="Scroll to explore" />
      </div>

    </section>
  );
}
