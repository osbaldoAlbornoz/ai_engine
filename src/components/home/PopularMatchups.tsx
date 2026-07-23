"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Swords, ArrowRight, Zap } from "lucide-react";

interface MatchupProduct {
  slug: string;
  name: string;
  image_url?: string;
}

interface Matchup {
  category: string;
  p1: MatchupProduct;
  p2: MatchupProduct;
}

export function PopularMatchups() {
  const [matchups, setMatchups] = useState<Matchup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMatchups() {
      try {
        const { data: products, error } = await supabase
          .from("products")
          .select("slug, clean_name, name, category, image_url, ai_score")
          .in("category", ["gpus", "laptops"])
          .eq("status", "active")
          .order("ai_score", { ascending: false });

        if (error || !products) return;

        const gpus = products.filter(p => p.category === "gpus");
        const laptops = products.filter(p => p.category === "laptops");

        const newMatchups: Matchup[] = [];

        if (gpus.length >= 2) {
          newMatchups.push({
            category: "GPUs",
            p1: { slug: gpus[0].slug, name: gpus[0].clean_name || gpus[0].name, image_url: gpus[0].image_url },
            p2: { slug: gpus[1].slug, name: gpus[1].clean_name || gpus[1].name, image_url: gpus[1].image_url }
          });
        }
        
        if (laptops.length >= 2) {
          newMatchups.push({
            category: "Laptops",
            p1: { slug: laptops[0].slug, name: laptops[0].clean_name || laptops[0].name, image_url: laptops[0].image_url },
            p2: { slug: laptops[1].slug, name: laptops[1].clean_name || laptops[1].name, image_url: laptops[1].image_url }
          });
        }
        
        // Add a third matchup (Mid-Range GPUs) to fill a 3-column grid
        if (gpus.length >= 4) {
          newMatchups.push({
            category: "GPUs Mid-Range",
            p1: { slug: gpus[2].slug, name: gpus[2].clean_name || gpus[2].name, image_url: gpus[2].image_url },
            p2: { slug: gpus[3].slug, name: gpus[3].clean_name || gpus[3].name, image_url: gpus[3].image_url }
          });
        }

        setMatchups(newMatchups);
      } catch (err) {
        console.error("Error fetching matchups:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMatchups();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse">
        <div className="h-8 bg-zinc-900/50 w-64 mx-auto mb-8 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-zinc-900/40 rounded-xl border border-zinc-800"></div>
          ))}
        </div>
      </div>
    );
  }

  if (matchups.length === 0) return null;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      <div className="text-center mb-10 flex flex-col items-center">
        <div className="inline-flex items-center justify-center p-2 bg-accent/10 rounded-full mb-4">
          <Zap className="w-5 h-5 text-accent" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold font-heading text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
          Comparativas <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-fuchsia-500">Destacadas</span>
        </h2>
        <p className="text-zinc-400 mt-2 text-sm max-w-2xl mx-auto">
          Enfrentamientos épicos entre los componentes más potentes para inteligencia artificial.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matchups.map((match, idx) => (
          <Link 
            href={`/compare/${match.p1.slug}-vs-${match.p2.slug}`} 
            key={idx}
            className="group relative flex flex-col bg-[#050505] rounded-xl border border-zinc-800/80 overflow-hidden transition-all duration-300 hover:border-accent/50 hover:shadow-[0_0_30px_rgba(0,255,255,0.15)] hover:-translate-y-1"
          >
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="p-6 flex-grow flex flex-col justify-center relative z-10">
              <div className="text-[10px] text-fuchsia-500 uppercase tracking-widest mb-6 font-heading text-center font-bold">
                Top {match.category} Matchup
              </div>
              
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 flex flex-col items-center text-center">
                  {match.p1.image_url && (
                    <div className="w-16 h-16 mb-3 rounded-lg overflow-hidden bg-white/5 p-1 border border-zinc-800 group-hover:border-accent/30 transition-colors">
                      <img src={match.p1.image_url} alt={match.p1.name} className="w-full h-full object-contain mix-blend-screen" />
                    </div>
                  )}
                  <span className="font-heading font-bold text-sm text-zinc-300 group-hover:text-white transition-colors line-clamp-2">
                    {match.p1.name}
                  </span>
                </div>
                
                <div className="flex-shrink-0 flex flex-col items-center justify-center px-1">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center group-hover:border-accent group-hover:bg-accent/10 transition-colors shadow-[0_0_15px_rgba(0,0,0,0.5)] z-10 relative">
                    <Swords className="w-5 h-5 text-zinc-500 group-hover:text-accent transition-colors" />
                    <div className="absolute inset-0 rounded-full border border-accent opacity-0 group-hover:opacity-100 group-hover:animate-ping" />
                  </div>
                  <span className="text-[11px] text-zinc-500 font-bold mt-2 group-hover:text-accent transition-colors">VS</span>
                </div>

                <div className="flex-1 flex flex-col items-center text-center">
                  {match.p2.image_url && (
                    <div className="w-16 h-16 mb-3 rounded-lg overflow-hidden bg-white/5 p-1 border border-zinc-800 group-hover:border-fuchsia-500/30 transition-colors">
                      <img src={match.p2.image_url} alt={match.p2.name} className="w-full h-full object-contain mix-blend-screen" />
                    </div>
                  )}
                  <span className="font-heading font-bold text-sm text-zinc-300 group-hover:text-white transition-colors line-clamp-2">
                    {match.p2.name}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/50 py-4 px-6 flex items-center justify-center gap-2 border-t border-zinc-800/80 group-hover:bg-zinc-900 transition-colors">
              <span className="text-xs font-bold text-zinc-400 group-hover:text-accent transition-colors uppercase tracking-widest">
                Ver Comparativa
              </span>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-accent group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
