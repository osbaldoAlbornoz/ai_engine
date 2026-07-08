"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Terminal, Zap } from "lucide-react";
import { Particles } from "@/components/ui/particles";

export function SplashScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [hexCode, setHexCode] = useState("0x000000");

  useEffect(() => {
    // Start counting progress at 4.5s
    const progressTimer = setTimeout(() => {
      let current = 0;
      const interval = setInterval(() => {
        current += Math.floor(Math.random() * 5) + 1; // random steps
        if (current >= 100) {
          current = 100;
          clearInterval(interval);
        }
        setProgress(current);
        
        // Generate random memory address/hex code
        const hex = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0').toUpperCase();
        setHexCode(`0x${hex}`);
      }, 30); 
    }, 4500);

    // Total duration before exit transition: 7.0s
    const exitTimer = setTimeout(() => {
      setIsLoading(false);
    }, 7000);

    return () => {
      clearTimeout(progressTimer);
      clearTimeout(exitTimer);
    };
  }, []);

  // Custom premium easing curve (Apple-like smooth snap)
  const premiumEase = [0.22, 1, 0.36, 1];

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#030303] overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 1.4, // Fly-through effect
            filter: "blur(10px)",
            transition: { duration: 0.7, ease: premiumEase } 
          }}
        >
          {/* =========================================================================
              GLOBAL BACKGROUND: Deep space/tech noise + 21st.dev Particles
             ========================================================================= */}
          {/* Subtle grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_60%,transparent_100%)]" />
          
          {/* Noise Texture for premium matte feel */}
          <div
            className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Interactive Particle System */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, ease: premiumEase }}
            className="absolute inset-0 z-0"
          >
            <Particles
              className="absolute inset-0"
              quantity={150}
              ease={60}
              color="#ffffff"
              refresh
            />
          </motion.div>

          {/* =========================================================================
              PHASE 1 (0.0s - 1.5s): Circuit Data Streams
             ========================================================================= */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center opacity-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, ease: premiumEase }}
          >
            <svg width="400" height="400" viewBox="0 0 400 400" className="absolute">
              <motion.path
                d="M200 0 L200 180 M0 200 L180 200 M400 200 L220 200 M200 400 L200 220"
                stroke="rgba(var(--primary), 1)"
                strokeWidth="1.5"
                fill="transparent"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                strokeDasharray="4 4"
              />
            </svg>
            <motion.div 
              className="w-2 h-2 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),1)]"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 2, 0] }}
              transition={{ delay: 1, duration: 0.5 }}
            />
          </motion.div>

          {/* =========================================================================
              PHASE 2 (1.2s - 2.8s): 3D Hardware Core Ignition
             ========================================================================= */}
          <motion.div
            className="absolute flex items-center justify-center z-10"
            style={{ perspective: 1200 }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1, 1.2, 4] }}
            transition={{ delay: 1.2, duration: 1.6, ease: premiumEase }}
          >
            {/* Outer 3D Ring */}
            <motion.div 
              className="absolute w-[22rem] h-[22rem] border-t-[1px] border-b-[2px] border-primary/40 rounded-full"
              animate={{ rotateX: 360, rotateY: 180, rotateZ: 90 }}
              transition={{ duration: 3, ease: "linear" }}
            />
            {/* Middle 3D Ring */}
            <motion.div 
              className="absolute w-[18rem] h-[18rem] border-[1px] border-dashed border-white/20 rounded-full"
              animate={{ rotateX: -180, rotateY: 360, rotateZ: -180 }}
              transition={{ duration: 4, ease: "linear" }}
            />
            {/* Inner 3D Ring */}
            <motion.div 
              className="absolute w-[14rem] h-[14rem] border-[2px] border-accent/60 rounded-full shadow-[0_0_40px_rgba(var(--accent),0.3)]"
              animate={{ rotateX: -180, rotateY: -360, rotateZ: -90 }}
              transition={{ duration: 2.5, ease: "linear" }}
            />
            {/* Core Icon */}
            <motion.div
              animate={{ rotate: [0, 90, 0], scale: [0.8, 1.2, 1] }}
              transition={{ duration: 2, ease: "easeInOut" }}
            >
              <Cpu size={80} strokeWidth={1} className="text-white drop-shadow-[0_0_40px_rgba(255,255,255,1)]" />
            </motion.div>
          </motion.div>

          {/* =========================================================================
              PHASE 3 (2.5s - 5.5s): Cinematic Logo & Volumetric Light
             ========================================================================= */}
          {/* Massive Volumetric Flare */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0.25], scale: [0, 3, 1.8] }}
            transition={{ delay: 2.5, duration: 2.5, ease: premiumEase }}
            className="absolute z-10 flex items-center justify-center pointer-events-none"
          >
            <div className="absolute w-[60rem] h-[15rem] bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 blur-[80px] mix-blend-screen transform -rotate-12" />
            <div className="absolute w-[40rem] h-[8rem] bg-gradient-to-r from-accent/0 via-accent/40 to-accent/0 blur-[60px] mix-blend-screen transform -rotate-12" />
            <div className="absolute w-[20rem] h-[4rem] bg-white/30 blur-[40px] mix-blend-screen transform -rotate-12" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, filter: "blur(30px)", letterSpacing: "0.8em", y: 20 }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)", letterSpacing: "0em", y: 0 }}
            transition={{ delay: 2.5, duration: 1.8, ease: premiumEase }}
            className="absolute z-20 flex flex-col items-center"
          >
            <h1 className="text-5xl md:text-8xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 uppercase drop-shadow-[0_0_50px_rgba(255,255,255,0.4)]">
              AiEngine
            </h1>
          </motion.div>

          {/* =========================================================================
              PHASE 4 (4.5s - 7.0s): Tech Loading Data UI
             ========================================================================= */}
          <motion.div 
            className="absolute mt-48 flex flex-col items-center z-20 w-full max-w-[400px] px-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 4.5, duration: 0.8, ease: premiumEase }}
          >
            {/* Tech Data Headers */}
            <div className="flex justify-between w-full mb-3 text-[10px] md:text-xs font-mono tracking-[0.2em] uppercase">
              <div className="flex gap-4">
                <span className="text-primary/90 flex items-center gap-1"><Zap size={12}/> System Boot</span>
                <span className="text-white/40 hidden sm:inline">{hexCode}</span>
              </div>
              <div className="text-white/90 font-bold">{progress}%</div>
            </div>
            
            {/* Precision Loading Bar */}
            <div className="w-full h-[1px] bg-white/10 relative">
              <motion.div
                className="absolute top-0 left-0 h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: "linear" }} // Maps directly to React state updates
              />
              {/* Glowing playhead at the tip of the bar */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_rgba(var(--primary),1)]"
                initial={{ left: "0%" }}
                animate={{ left: `${progress}%` }}
                transition={{ duration: 0.1, ease: "linear" }}
              />
            </div>
          </motion.div>

          {/* =========================================================================
              PHASE 5 (5.2s - 7.0s): Tagline Resolution
             ========================================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 15, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 5.2, duration: 1.0, ease: premiumEase }}
            className="absolute mt-72 flex flex-col items-center z-10"
          >
            <div className="flex items-center gap-3 mb-4 opacity-50">
               <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-white" />
               <Terminal size={14} className="text-white" />
               <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-white" />
            </div>
            <h2 className="text-[10px] md:text-xs font-heading font-semibold tracking-[0.4em] text-white/70 uppercase text-center leading-relaxed">
              High-Performance <br className="sm:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent font-black">AI Hardware</span>
            </h2>
          </motion.div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
