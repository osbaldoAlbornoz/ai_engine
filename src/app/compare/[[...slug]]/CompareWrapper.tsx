"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { CompareTool } from "@/components/compare/CompareTool";

function LoadingFallback() {
  return (
    <div className="w-full min-h-[50vh] flex flex-col items-center justify-center py-24 text-center px-4 z-10">
      <div className="w-20 h-20 rounded-full bg-zinc-900/50 border border-primary/20 flex items-center justify-center mb-6">
        <Search className="w-10 h-10 text-primary animate-pulse" />
      </div>
      <h3 className="text-2xl font-heading font-bold text-zinc-300 mb-3 animate-pulse">
        Loading Comparison Engine...
      </h3>
    </div>
  );
}

export function CompareToolWrapper({ initialProduct1, initialProduct2 }: { initialProduct1?: any; initialProduct2?: any }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <LoadingFallback />;
  }

  return (
    <CompareTool
      initialProduct1={initialProduct1}
      initialProduct2={initialProduct2}
    />
  );
}
