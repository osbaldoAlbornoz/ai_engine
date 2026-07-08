"use client";

import React from "react";
import { motion } from "framer-motion";
import { AnimatedGPU } from "@/components/home/AnimatedGPU";

interface ThreeColumnLayoutProps {
  children: React.ReactNode;
}

// Notch size constants — tuned to look correct at 100% browser zoom.
// The notch should be a subtle decorative accent, not a dominant element.
const NOTCH_H = 384; // px — height of the diamond-cut notch
const NOTCH_W = 28;  // px — how far the notch protrudes into the center
const NOTCH_SLOPE = 40; // px — vertical distance of the angled cut

function SidebarBorder({ side, height }: { side: "left" | "right"; height: number }) {
  const isLeft = side === "left";

  const halfNotch = NOTCH_H / 2;
  const centerY = height / 2;

  const startY = centerY - halfNotch;
  const endY = centerY + halfNotch;

  const p1 = startY + NOTCH_SLOPE;
  const p2 = endY - NOTCH_SLOPE;

  // Path for left sidebar: line goes down the right edge (X=0), but at the middle it goes right by NOTCH_W
  // Path for right sidebar: line goes down the left edge (X=NOTCH_W), but at the middle it goes left to X=0
  const path = isLeft
    ? `M 0 0 L 0 ${startY} L ${NOTCH_W} ${p1} L ${NOTCH_W} ${p2} L 0 ${endY} L 0 ${height}`
    : `M ${NOTCH_W} 0 L ${NOTCH_W} ${startY} L 0 ${p1} L 0 ${p2} L ${NOTCH_W} ${endY} L ${NOTCH_W} ${height}`;

  // Fill path for the notch background only
  const fillPath = isLeft
    ? `M 0 ${startY} L ${NOTCH_W} ${p1} L ${NOTCH_W} ${p2} L 0 ${endY} Z`
    : `M ${NOTCH_W} ${startY} L 0 ${p1} L 0 ${p2} L ${NOTCH_W} ${endY} Z`;

  // Beam colors
  const beamColor = isLeft ? "#8b5cf6" : "#06b6d4";

  return (
    <div
      className="absolute top-0 pointer-events-none"
      style={{
        width: NOTCH_W,
        height: height,
        ...(isLeft ? { right: -NOTCH_W } : { left: -NOTCH_W }),
      }}
    >
      {/* Carbon Fiber Background for the Notch portion */}
      <div
        className="absolute inset-0 bg-carbon-fiber"
        style={{ clipPath: `path('${fillPath}')` }}
      />

      {/* Continuous Stroke Container */}
      <svg
        width={NOTCH_W}
        height={height}
        viewBox={`0 0 ${NOTCH_W} ${height}`}
        fill="none"
        className="absolute inset-0 overflow-visible"
      >
        {/* Base Neon Border (Idle State) */}
        <path
          d={path}
          stroke={beamColor}
          strokeWidth="2"
          style={{
            opacity: 0.4,
            filter: `drop-shadow(0 0 8px ${beamColor})`
          }}
        />
        <path
          d={path}
          stroke={beamColor}
          strokeWidth="4"
          style={{
            opacity: 0.2,
            filter: `drop-shadow(0 0 16px ${beamColor}) drop-shadow(0 0 24px ${beamColor})`
          }}
        />

        {/* Core Beam (Thin & Intense) */}
        <motion.path
          d={path}
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray="15 85"
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: -100 }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            filter: `drop-shadow(0 0 5px ${beamColor}) drop-shadow(0 0 10px ${beamColor}) drop-shadow(0 0 20px ${beamColor}) drop-shadow(0 0 40px ${beamColor})`,
          }}
        />
      </svg>
    </div>
  );
}

export function ThreeColumnLayout({ children }: ThreeColumnLayoutProps) {
  const [height, setHeight] = React.useState(0);

  React.useEffect(() => {
    const handleResize = () => {
      setHeight(window.innerHeight);
    };

    // Set initial height
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex w-full min-h-screen">
      {/* LEFT SIDEBAR */}
      <aside
        id="sidebar-left"
        className="hidden xl:flex flex-col w-[160px] 2xl:w-[200px] flex-shrink-0 sticky top-0 h-screen relative z-20 bg-carbon-fiber"
        aria-label="Left sidebar"
      >
        {height > 0 && <SidebarBorder side="left" height={height} />}
        <div className="relative w-full h-full overflow-hidden">
          <div
            className="absolute inset-0 z-0 mix-blend-lighten"
            style={{
              backgroundImage: "url('/images/ai_processor_vertical.png')",
              backgroundSize: "135% auto",
              backgroundPosition: "top center",
              backgroundRepeat: "repeat-y"
            }}
          />
          <div className="relative z-10 w-full h-full overflow-y-auto flex flex-col items-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-full relative z-10" style={{ marginTop: i === 0 ? "0" : "15%" }}>
                <AnimatedGPU />
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* CENTER COLUMN */}
      <main className="flex-1 min-w-0 flex flex-col relative z-10">
        {children}
      </main>

      {/* RIGHT SIDEBAR */}
      <aside
        id="sidebar-right"
        className="hidden xl:flex flex-col w-[160px] 2xl:w-[200px] flex-shrink-0 sticky top-0 h-screen relative z-20 bg-carbon-fiber"
        aria-label="Right sidebar"
      >
        {height > 0 && <SidebarBorder side="right" height={height} />}
        <div className="relative w-full h-full overflow-hidden">
          <div
            className="absolute inset-0 z-0 mix-blend-lighten"
            style={{
              backgroundImage: "url('/images/ai_processor_vertical.png')",
              backgroundSize: "135% auto",
              backgroundPosition: "top center",
              backgroundRepeat: "repeat-y"
            }}
          />
          <div className="relative z-10 w-full h-full overflow-y-auto flex flex-col items-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-full relative z-10" style={{ marginTop: i === 0 ? "0" : "15%" }}>
                <AnimatedGPU />
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

