"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function AnimatedGPU() {
  return (
    <div className="relative w-full flex items-center justify-center">
      {/* We use an inline-block wrapper so it wraps exactly to the image's dimensions. */}
      <div className="relative inline-block w-full max-w-[280px] group transition-transform duration-500 scale-[1.30]">

        {/* Glow effect behind the GPU */}
        <div className="absolute top-[15%] bottom-[15%] left-[30%] right-[30%] bg-primary/40 blur-[15px] rounded-full z-0 opacity-40 group-hover:opacity-60 transition-opacity duration-700"></div>

        {/* GPU Base - using standard img so it sets the container's height/width proportionally */}
        <img
          src="/images/GPU_1024.png"
          alt="GPU Base"
          className="relative z-10 w-full h-auto block drop-shadow-2xl contrast-125 saturate-110"
        />

        {/* Metal Sweep Effect */}
        <div
          className="absolute inset-0 z-[15] pointer-events-none mix-blend-overlay"
          style={{
            maskImage: 'url(/images/GPU_1024.png)',
            maskSize: '100% 100%',
            WebkitMaskImage: 'url(/images/GPU_1024.png)',
            WebkitMaskSize: '100% 100%',
          }}
        >
          <motion.div
            className="absolute top-0 bottom-0 w-[100%] bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-30deg]"
            initial={{ left: "-150%" }}
            animate={{ left: "150%" }}
            transition={{
              duration: 1.5,
              ease: "easeInOut",
              repeat: Infinity,
              repeatDelay: 3.5
            }}
          />
        </div>

        {/* Fan Container
            Since the container is now exactly the size of the card, percentages are relative to the card.
            Adjusting top to 55% and width to 40% to make it perfectly fit inside the screws.
        */}
        <div
          className="absolute z-20 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{ top: '68%', width: '28%', aspectRatio: '1/1' }}
        >
          {/* Frame */}
          <img
            src="/images/frame_315.png"
            alt="GPU Frame"
            className="absolute inset-0 w-full h-full object-contain z-20 contrast-125 saturate-105 drop-shadow-md"
          />

          {/* Spinning Fan */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 1.5, // Fan speed
            }}
            className="absolute inset-0 flex items-center justify-center z-30"
          >
            <img
              src="/images/fan_315.png"
              alt="GPU Fan"
              className="w-full h-full object-contain contrast-110 saturate-110"
            />
          </motion.div>
        </div>

      </div>
    </div>
  );
}
