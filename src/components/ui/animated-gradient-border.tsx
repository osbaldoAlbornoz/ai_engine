"use client";

import React, { useRef, useState } from "react";interface BorderRotateProps {
  children?: React.ReactNode;
  className?: string;
  animationSpeed?: number;
  gradientColors?: { primary: string; secondary: string; accent: string };
  backgroundColor?: string;
  animationMode?: "continuous" | "stop-rotate-on-hover" | "rotate-on-hover";
  spotlight?: boolean;
}

export function BorderRotate({
  children,
  className = "",
  animationSpeed = 3,
  gradientColors = { primary: "#00E5FF", secondary: "#FF00FF", accent: "#00E5FF" },
  backgroundColor = "rgba(5, 5, 5, 1)", // Solid black/dark background for cyberpunk feel
  animationMode = "continuous",
  spotlight = true,
}: BorderRotateProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const animationClass = 
    animationMode === "stop-rotate-on-hover" 
      ? "animate-[spin_3s_linear_infinite] group-hover:[animation-play-state:paused]" 
      : animationMode === "rotate-on-hover"
      ? "opacity-0 group-hover:opacity-100 group-hover:animate-[spin_3s_linear_infinite] transition-opacity duration-300"
      : "animate-[spin_3s_linear_infinite]";

  return (
    <div 
      ref={divRef}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden rounded-none p-[1px] group ${className}`}
    >
      {/* Default static border layer (white/10) */}
      <div className="absolute inset-0 bg-white/10 rounded-none" />
      
      {/* The animated rotating gradient layer */}
      <div
        className={`absolute inset-[-100%] w-[300%] h-[300%] -top-[100%] -left-[100%] ${animationClass}`}
        style={{
          background: `conic-gradient(from 0deg, transparent 0 60%, ${gradientColors.primary} 75%, ${gradientColors.secondary} 85%, ${gradientColors.accent} 100%)`,
          animationDuration: `${animationSpeed}s`,
        }}
      />
      {/* The inner card background which covers the center of the gradient */}
      <div
        className="relative h-full w-full rounded-none z-10 overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
        style={{ background: backgroundColor }}
      >
        {/* Spotlight Effect Layer */}
        {spotlight && (
          <div
            className="pointer-events-none absolute -inset-px rounded-none opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-0"
            style={{
              background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.08), transparent 40%)`,
            }}
          />
        )}
        <div className="relative z-10 h-full w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
