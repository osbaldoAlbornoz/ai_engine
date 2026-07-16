"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal } from "lucide-react";
import { ClarityStream } from "@/components/ui/clarity-stream";

export function NewSplashScreen() {
  // Usamos null para indicar que aún no sabemos si el usuario ya entró
  const [isEntered, setIsEntered] = useState<boolean | null>(null);

  // Verificar localStorage solo después de montar en el cliente
  useEffect(() => {
    const hasEntered = localStorage.getItem('aiEngineEntered') === 'true';
    setIsEntered(hasEntered);

    // Si es usuario nuevo, remover la clase show-splash que se agregó en el layout
    // y restaurar el scroll normal
    if (!hasEntered) {
      document.documentElement.classList.remove('show-splash');
      document.documentElement.style.overflow = '';
    }
  }, []);

  const handleEnter = () => {
    localStorage.setItem('aiEngineEntered', 'true');
    setIsEntered(true);

    // Restaurar scroll cuando el usuario hace clic en entrar
    document.documentElement.style.overflow = '';
  };

  // Mientras verificamos localStorage, no mostrar nada
  // El script sincrónico en layout.tsx ya previno el FOUC
  if (isEntered === null) {
    return null;
  }

  // Si ya entró, no mostrar la splash screen
  if (isEntered) {
    return null;
  }

  // Si no ha entrado, mostrar la splash screen
  const premiumEase = [0.22, 1, 0.36, 1] as const;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#030303] overflow-hidden"
        initial={{ opacity: 1 }}
        exit={{
          opacity: 0,
          scale: 1.2,
          filter: "blur(10px)",
          transition: { duration: 0.8, ease: premiumEase }
        }}
      >
        {/* =========================================================================
            FONDO 3D SPLINE (Animación que pasaste)
           ========================================================================= */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-80">
          <ClarityStream />
        </div>

        {/* =========================================================================
            TEXTOS Y BOTÓN (Por encima del 3D)
           ========================================================================= */}

        <div className="relative z-20 flex flex-col items-center pointer-events-none mt-[-10vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.5, ease: premiumEase }}
            className="flex flex-col items-center"
          >
            <h1 className="text-5xl md:text-8xl font-heading font-black tracking-wider uppercase">
              <span className="text-cyan-400 drop-shadow-[0_0_30px_rgba(34,211,238,0.4)]">AI</span>
              <span className="ml-3 md:ml-6 text-fuchsia-500 drop-shadow-[0_0_30px_rgba(217,70,239,0.4)]">Engine</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1.0, ease: premiumEase }}
            className="mt-6 flex flex-col items-center"
          >
            <div className="flex items-center gap-3 mb-4 opacity-70">
              <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-white" />
              <Terminal size={14} className="text-white" />
              <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-white" />
            </div>
            <h2 className="text-[10px] md:text-sm font-heading font-semibold tracking-[0.4em] text-white/80 uppercase text-center leading-relaxed drop-shadow-md">
              High-Performance <br className="sm:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent font-black">AI Hardware</span>
            </h2>
          </motion.div>
        </div>

        {/* Botón de Entrada */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 1.0, ease: premiumEase }}
          className="absolute bottom-24 z-30 pointer-events-auto"
        >
          <button
            onClick={handleEnter}
            className="group relative px-10 py-4 overflow-hidden rounded-sm bg-transparent border border-white/20 hover:border-primary/50 transition-colors duration-500"
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
        </motion.div>

      </motion.div>
    </AnimatePresence>
  );
}