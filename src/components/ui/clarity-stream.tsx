"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";
import { createNoise3D } from "simplex-noise";

export const ClarityStream = ({
  children,
  className,
  containerClassName,
  backgroundFill,
  blur = 0,
  speed = "fast",
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  backgroundFill?: string;
  blur?: number;
  speed?: "slow" | "fast";
  [key: string]: any;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const noise3D = useRef(createNoise3D());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // ── DESIGN PARAMETERS ──────────────────────────────────────────────
    // A completely new approach to create a premium, 3D-like silk ribbon.
    // Instead of parallel horizontal lines, we use a centerline and a twist factor.
    // When twist approaches 0, the threads converge (ribbon edge-on).
    // When twist is 1, they spread out (ribbon face-on).
    const RIBBON_COUNT = 3;             // Multiple intertwining ribbons
    const THREADS_PER_RIBBON = 80;      // Number of threads per ribbon for smoothness
    const THREAD_WIDTH = 2.0;           // Slightly wider to overlap smoothly
    const MAX_SPREAD = 180;             // Max width of the ribbon in pixels
    const TIME_SPEED = speed === "fast" ? 0.003 : 0.0015;

    // A curated, elegant color palette (Deep purples, magentas, soft pinks, and white)
    const palettes = [
      // Ribbon 1: Deep Indigo to Bright Magenta
      [
        { stop: 0.0, r: 20,  g: 10,  b: 150, a: 0.0 },
        { stop: 0.2, r: 60,  g: 20,  b: 220, a: 0.2 },
        { stop: 0.5, r: 180, g: 30,  b: 240, a: 0.5 },
        { stop: 0.8, r: 240, g: 80,  b: 200, a: 0.2 },
        { stop: 1.0, r: 100, g: 10,  b: 100, a: 0.0 },
      ],
      // Ribbon 2: Cyan to Deep Purple
      [
        { stop: 0.0, r: 10,  g: 50,  b: 150, a: 0.0 },
        { stop: 0.2, r: 20,  g: 120, b: 255, a: 0.2 },
        { stop: 0.5, r: 100, g: 200, b: 255, a: 0.5 },
        { stop: 0.8, r: 150, g: 50,  b: 255, a: 0.2 },
        { stop: 1.0, r: 50,  g: 10,  b: 100, a: 0.0 },
      ],
      // Ribbon 3: Crimson to Rose/White (The bright core)
      [
        { stop: 0.0, r: 150, g: 10,  b: 50,  a: 0.0 },
        { stop: 0.2, r: 220, g: 30,  b: 100, a: 0.3 },
        { stop: 0.5, r: 255, g: 200, b: 220, a: 0.8 }, // White-ish center
        { stop: 0.8, r: 255, g: 80,  b: 150, a: 0.3 },
        { stop: 1.0, r: 100, g: 10,  b: 50,  a: 0.0 },
      ]
    ];

    function samplePalette(palette: any[], t: number) {
      let lo = palette[0], hi = palette[palette.length - 1];
      for (let k = 0; k < palette.length - 1; k++) {
        if (t >= palette[k].stop && t <= palette[k + 1].stop) {
          lo = palette[k];
          hi = palette[k + 1];
          break;
        }
      }
      const f = lo.stop === hi.stop ? 0 : (t - lo.stop) / (hi.stop - lo.stop);
      return {
        r: Math.round(lo.r + (hi.r - lo.r) * f),
        g: Math.round(lo.g + (hi.g - lo.g) * f),
        b: Math.round(lo.b + (hi.b - lo.b) * f),
        a: lo.a + (hi.a - lo.a) * f,
      };
    }

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      timeRef.current += TIME_SPEED;
      const t = timeRef.current;

      // Crisp background refresh
      ctx.fillStyle = backgroundFill || "#000000";
      ctx.fillRect(0, 0, w, h);

      // Additive blending for a luminous silk effect
      ctx.globalCompositeOperation = "lighter";
      ctx.lineWidth = THREAD_WIDTH;

      // Precompute the ribbon centerlines and twists for this frame
      // This is a massive optimization for Firefox, reducing noise3D calls by 98.7%
      const ribbonData = [];
      const step = 4;
      for (let r = 0; r < RIBBON_COUNT; r++) {
        const points = [];
        for (let px = 0; px <= w; px += step) {
          const nx = px / w;
          const wave1 = noise3D.current(nx * 1.2 + t * 0.8, r * 10, t * 0.2);
          const wave2 = noise3D.current(nx * 0.7 - t * 0.5, r * 10 + 5, t * 0.3) * 0.5;
          const centerY = h * 0.5 + (wave1 + wave2) * h * 0.25;
          const twist = noise3D.current(nx * 1.5 - t * 0.6, r * 20, t * 0.4);
          points.push({ px, centerY, twist });
        }
        ribbonData.push(points);
      }

      for (let r = 0; r < RIBBON_COUNT; r++) {
        const palette = palettes[r % palettes.length];
        const points = ribbonData[r];

        for (let i = 0; i < THREADS_PER_RIBBON; i++) {
          const normalPos = i / (THREADS_PER_RIBBON - 1); // 0.0 to 1.0
          const col = samplePalette(palette, normalPos);
          if (col.a < 0.01) continue;

          ctx.beginPath();
          // Extremely low opacity per thread so they build up to a solid volume
          ctx.strokeStyle = `rgba(${col.r},${col.g},${col.b},${col.a * 0.15})`;

          // Spread determines how far this thread is from the ribbon's centerline
          const spread = (normalPos - 0.5) * 2.0 * MAX_SPREAD;

          // Step through the precomputed points
          for (let pIdx = 0; pIdx < points.length; pIdx++) {
            const { px, centerY, twist } = points[pIdx];
            
            // Apply the twist to the spread to calculate the final vertical position
            const y = centerY + spread * twist;

            if (pIdx === 0) {
              ctx.moveTo(px, y);
            } else {
              ctx.lineTo(px, y);
            }
          }
          ctx.stroke();
        }
      }

      ctx.globalCompositeOperation = "source-over";
      animRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [speed, backgroundFill]);

  const [isSafari, setIsSafari] = useState(false);
  useEffect(() => {
    setIsSafari(
      typeof window !== "undefined" &&
        navigator.userAgent.includes("Safari") &&
        !navigator.userAgent.includes("Chrome")
    );
  }, []);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center absolute inset-0 overflow-hidden",
        containerClassName
      )}
    >
      <canvas
        className="absolute inset-0 z-0"
        ref={canvasRef}
        id="canvas"
        style={isSafari && blur > 0 ? { filter: `blur(${blur}px)` } : {}}
      />
      <div className={cn("relative z-10 w-full h-full", className)} {...props}>
        {children}
      </div>
    </div>
  );
};
