"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ClarityStream } from "@/components/ui/clarity-stream";
import { Terminal } from "lucide-react";

/**
 * Splash Screen page with ClarityStream animation.
 * Only shown to users who have not entered before.
 */
export default function SplashPage() {
  const router = useRouter();

  const handleEnter = () => {
    // Save flag in both localStorage (legacy) AND a cookie (for middleware)
    localStorage.setItem("aiEngineEntered", "true");
    // Set cookie that middleware can read on the server side
    // Max-age = 1 year (365 days x 24h x 60m x 60s)
    document.cookie = "aiEngineEntered=true; path=/; max-age=31536000; SameSite=Lax";
    // Redirect to main page
    router.push("/");
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#030303]">
      {/* Animación de cinta 3D de fondo */}
      <ClarityStream
        backgroundFill="#030303"
        speed="fast"
        blur={0}
      >
        {/* Contenido del splash */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
          
          <div className="relative z-20 flex flex-col items-center pointer-events-none mt-[-10vh]">
            <div className="flex flex-col items-center">
              <h1 className="text-5xl md:text-8xl font-heading font-black tracking-wider uppercase">
                <span className="text-cyan-400 drop-shadow-[0_0_30px_rgba(34,211,238,0.4)]">AI</span>
                <span className="ml-3 md:ml-6 text-fuchsia-500 drop-shadow-[0_0_30px_rgba(217,70,239,0.4)]">Engine</span>
              </h1>
            </div>

            <div className="mt-6 flex flex-col items-center">
              <div className="flex items-center gap-3 mb-4 opacity-70">
                <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-white" />
                <Terminal size={14} className="text-white" />
                <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-white" />
              </div>
              <h2 className="text-[10px] md:text-sm font-heading font-semibold tracking-[0.4em] text-white/80 uppercase text-center leading-relaxed drop-shadow-md">
                High-Performance <br className="sm:hidden" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent font-black">AI Hardware</span>
              </h2>
            </div>
          </div>

          {/* Botón de entrada */}
          <div className="absolute bottom-24 z-30 pointer-events-auto">
            <button
              onClick={handleEnter}
              className="group relative px-10 py-4 overflow-hidden rounded-sm bg-transparent border border-primary shadow-[0_0_15px_rgba(0,229,255,0.5)] hover:shadow-[0_0_25px_rgba(0,229,255,0.8)] hover:bg-primary/10 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
              
              <span className="relative text-white font-mono text-sm tracking-[0.3em] uppercase flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Enter System
              </span>
              
              {/* Esquinas decorativas */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>
      </ClarityStream>
    </div>
  );
}