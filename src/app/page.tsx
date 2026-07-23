import { HomeDataClient } from "@/components/home/HomeDataClient";
import dynamic from "next/dynamic";

const HardwareMatcher = dynamic(() => import("@/components/matcher/HardwareMatcher").then(mod => mod.HardwareMatcher), {
  loading: () => <div className="w-full min-h-[400px] flex items-center justify-center animate-pulse bg-zinc-900/20 text-zinc-500 font-mono text-sm">Loading AI Matcher...</div>
});

const CatalogSection = dynamic(() => import("@/components/catalog/CatalogSection").then(mod => mod.CatalogSection), {
  loading: () => <div className="w-full min-h-[800px] flex items-center justify-center animate-pulse bg-zinc-900/20 text-zinc-500 font-mono text-sm">Loading Hardware Catalog...</div>
});

const PopularMatchups = dynamic(() => import("@/components/home/PopularMatchups").then(mod => mod.PopularMatchups), {
  loading: () => <div className="w-full min-h-[400px] flex items-center justify-center animate-pulse bg-zinc-900/20 text-zinc-500 font-mono text-sm">Loading Matchups...</div>
});

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <HomeDataClient />
      
      {/* Decorative separator */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent my-10" />
      
      <HardwareMatcher />
      
      {/* Decorative separator */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent my-10" />

      <CatalogSection />

      {/* Decorative separator */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent my-4" />

      <PopularMatchups />
    </div>
  );
}