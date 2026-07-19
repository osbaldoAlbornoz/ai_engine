"use client";

import { ArrowUp } from "lucide-react";

export function GoToTopButton() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="flex justify-center w-full py-8 mt-auto">
      <button
        onClick={scrollToTop}
        className="group flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#050505] border border-primary/50 text-primary hover:text-accent hover:border-accent/50 transition-all font-heading text-sm shadow-[0_0_15px_rgba(0,229,255,0.2)] hover:shadow-[0_0_25px_rgba(255,0,255,0.4)] hover:-translate-y-1"
      >
        <ArrowUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
        Go to Top
      </button>
    </div>
  );
}
