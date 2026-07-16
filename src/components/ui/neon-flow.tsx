import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";

// Helper for random colors
const randomColors = (count: number) => {
  return new Array(count)
    .fill(0)
    .map(() => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'));
};

interface TubesBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  enableClickInteraction?: boolean;
}

export function TubesBackground({
  children,
  className,
  enableClickInteraction = true
}: TubesBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const tubesRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;
    let cleanup: (() => void) | undefined;

    const initTubes = async () => {
      if (!canvasRef.current) return;

      try {
        // Import from local node_modules instead of CDN to avoid CSP and Webpack issues
        // @ts-ignore
        const module = await import('threejs-components/build/cursors/tubes1.min.js');
        const TubesCursor = module.default;

        if (!mounted) return;

        const app = TubesCursor(canvasRef.current, {
          tubes: {
            colors: ["#00E5FF", "#FF00FF", "#0088FF"],
            lights: {
              intensity: 200,
              colors: ["#00E5FF", "#FF00FF", "#00FFFF", "#8A2BE2"]
            }
          }
        });

        tubesRef.current = app;
        setIsLoaded(true);

        // Handle resize if the library doesn't automatically
        const handleResize = () => {
          // The library might handle it, but typically we ensure canvas matches container
          // For this specific lib, it likely attaches to window resize or we might need to manually resize
        };

        window.addEventListener('resize', handleResize);

        cleanup = () => {
          window.removeEventListener('resize', handleResize);
          // If the library has a destroy method, call it
          // app.destroy?.(); 
          // Based on typical threejs-components, it might not have an explicit destroy exposed easily
          // but we should at least nullify the ref
        };

      } catch (error) {
        console.error("Failed to load TubesCursor:", error);
      }
    };

    initTubes();

    return () => {
      mounted = false;
      if (cleanup) cleanup();
    };
  }, []);

  const handleClick = () => {
    if (!enableClickInteraction || !tubesRef.current) return;

    const colors = randomColors(3);
    const lightsColors = randomColors(4);

    tubesRef.current.tubes.setColors(colors);
    tubesRef.current.tubes.setLightsColors(lightsColors);
  };

  return (
    <div
      className={cn("relative w-full h-full min-h-[400px]", className)}
      onClick={handleClick}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block mix-blend-screen"
        style={{ 
          touchAction: 'none',
          maskImage: 'radial-gradient(circle at center, black 20%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 20%, transparent 70%)'
        }}
      />

      {/* Content Overlay */}
      <div className="relative z-10 w-full h-full pointer-events-none [&>*]:pointer-events-auto flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

// Default export
export default TubesBackground;
