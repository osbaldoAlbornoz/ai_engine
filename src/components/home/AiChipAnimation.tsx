"use client";
import { motion } from "framer-motion";
import { Cpu } from "lucide-react";

export function AiChipAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-700">
      
      {/* Background glow that intensifies on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
      
      {/* Rotating dashed rings representing tech/data orbit */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute w-64 h-64 border-[1px] border-dashed border-primary/30 rounded-full"
      />
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute w-80 h-80 border-[1px] border-dashed border-accent/30 rounded-full"
      />
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute w-96 h-96 border-[1px] border-primary/10 rounded-full"
      />

      {/* Floating particles/data nodes flying out of the chip */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-accent rounded-full shadow-[0_0_10px_#06b6d4]"
          animate={{
            x: [0, Math.cos(i * 60 * (Math.PI/180)) * 140],
            y: [0, Math.sin(i * 60 * (Math.PI/180)) * 140],
            opacity: [0, 1, 0],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Center Chip Container */}
      <div className="relative z-10 w-32 h-32">
        {/* Glowing aura */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-primary/40 rounded-2xl blur-xl"
        />
        
        {/* The physical chip */}
        <div className="absolute inset-0 bg-zinc-950 rounded-2xl border border-zinc-700 shadow-2xl flex items-center justify-center overflow-hidden">
          {/* Inner circuit grid effect */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808020_1px,transparent_1px),linear-gradient(to_bottom,#80808020_1px,transparent_1px)] bg-[size:8px_8px]"></div>
          
          {/* CPU Icon */}
          <motion.div
            animate={{ filter: ["drop-shadow(0 0 5px rgba(139,92,246,0.5))", "drop-shadow(0 0 20px rgba(139,92,246,0.8))", "drop-shadow(0 0 5px rgba(139,92,246,0.5))"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Cpu className="h-12 w-12 text-primary" />
          </motion.div>
        </div>

        {/* Data processing pulse scanline */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl z-20 mix-blend-overlay">
          <motion.div
            className="w-full h-[4px] bg-accent shadow-[0_0_10px_#06b6d4]"
            animate={{ y: [-20, 150] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
    </div>
  );
}
