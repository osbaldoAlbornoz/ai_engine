"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, Zap, BookOpen, Gamepad2, 
  Wallet, Coins, Landmark, 
  Monitor, Laptop, Layers, Server,
  ChevronRight, ArrowRight, ShoppingCart, Target,
  RefreshCw
} from "lucide-react";
import { UseCase, Budget, FormFactor, MatcherAnswers, getTopMatches, MatchResult } from "@/utils/matcher";
import Link from "next/link";
import { getAffiliateUrl } from "@/utils/affiliate";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types/product";
import { useQuery } from '@tanstack/react-query';

type Category = "gpus" | "laptops" | "npus" | "workstations";

interface HardwareProduct extends Product {
  image_url: string;
  amazon_url: string;
  original_price?: number;
  features: string[];
  // Legacy aliases
  image?: string;
  amazonUrl?: string;
  originalPrice?: number;
  keyFeatures?: string[];
}

// --- Wizard Data ---
const USE_CASES = [
  { id: "training", label: "Model Training", desc: "Training LLMs, LoRAs, heavy AI workloads", icon: Brain },
  { id: "inference", label: "Local Inference", desc: "Running LLMs & Stable Diffusion locally", icon: Zap },
  { id: "learning", label: "Learning AI", desc: "Starting out, studying, budget-conscious", icon: BookOpen },
  { id: "gaming", label: "Gaming + AI", desc: "High FPS gaming and AI side-projects", icon: Gamepad2 },
] as const;

const BUDGETS = [
  { id: "budget", label: "Around $1,100", desc: "Best value entry-to-mid level hardware", icon: Wallet },
  { id: "mid", label: "$1,100 - $2,600 est.", desc: "Sweet spot for performance and VRAM", icon: Coins },
  { id: "high", label: "No Limit", desc: "I want the absolute best hardware", icon: Landmark },
] as const;

const FORM_FACTORS = [
  { id: "desktop", label: "Desktop GPU", desc: "Maximum raw power and upgradeability", icon: Monitor },
  { id: "workstation", label: "Workstation", desc: "Pre-built high performance systems", icon: Server },
  { id: "laptop", label: "Laptop", desc: "Portability and all-in-one convenience", icon: Laptop },
  { id: "any", label: "No Preference", desc: "Just show me the best match", icon: Layers },
] as const;

export function HardwareMatcher() {
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<MatchResult[]>([]);
  
  const [answers, setAnswers] = useState<MatcherAnswers>({
    useCase: "learning",
    budget: "mid",
    formFactor: "any"
  });

  const { data: products = [] } = useQuery({
    queryKey: ['activeProducts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').eq('status', 'active');
      if (error) throw error;
      return data;
    },
    select: (data) => {
      return data.map(dbProd => ({
        id: dbProd.id,
        amazon_asin: dbProd.amazon_asin,
        name: dbProd.clean_name || dbProd.name,
        description: (dbProd.features && dbProd.features.length > 0) ? dbProd.features[0] : "High-performance AI hardware",
        category: (dbProd.category || "gpus") as Category,
        brand: dbProd.brand || "Unknown",
        price: dbProd.price || 0,
        original_price: dbProd.original_price,
        image_url: dbProd.image_url || "",
        amazon_url: dbProd.amazon_url || "#",
        specs: dbProd.specs || {},
        features: dbProd.features || [],
        rating: dbProd.rating,
        reviewsCount: dbProd.reviews_count,
        isPopular: dbProd.is_popular,
        status: dbProd.status,
        ai_score: dbProd.ai_score,
        // Legacy aliases for backward compatibility
        image: dbProd.image_url || "",
        amazonUrl: dbProd.amazon_url || "#",
        originalPrice: dbProd.original_price,
        keyFeatures: dbProd.features || [],
      }));
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const handleSelectUseCase = (id: UseCase) => {
    setAnswers(prev => ({ ...prev, useCase: id }));
    setStep(2);
  };

  const handleSelectBudget = (id: Budget) => {
    setAnswers(prev => ({ ...prev, budget: id }));
    setStep(3);
  };

  const handleSelectFormFactor = (id: FormFactor) => {
    // Build the final answers inline — do NOT rely on `answers` state here
    // because setAnswers is async and the state won't be updated yet.
    const finalAnswers: MatcherAnswers = { ...answers, formFactor: id };
    setAnswers(finalAnswers);
    analyzeResults(finalAnswers);
  };

  const analyzeResults = (finalAnswers: MatcherAnswers = answers) => {
    setStep(4);
    setIsAnalyzing(true);
    
    // Simulate AI thinking time for dramatic effect
    setTimeout(() => {
      // Use finalAnswers (passed directly) to avoid stale state closure
      const matches = getTopMatches(finalAnswers, products);
      setResults(matches);
      setIsAnalyzing(false);
      setStep(5);
    }, 1500);
  };

  const resetWizard = () => {
    setStep(1);
    setResults([]);
  };

  return (
    <section id="hardware-matcher" className="relative w-full max-w-5xl mx-auto py-12 px-4">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative bg-[#050505]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-10 shadow-2xl overflow-hidden min-h-[500px] flex flex-col">
        
        {/* Header */}
        {step < 5 && (
          <div className="mb-8 text-center relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-white flex items-center justify-center gap-3">
              <Target className="w-6 h-6 text-primary" />
              AI Hardware <span className="text-accent">Matcher</span>
            </h2>
            <p className="text-zinc-400 mt-2">Find your perfect setup in 3 quick questions</p>
            
            {/* Progress Bar */}
            {step < 4 && (
              <div className="w-full max-w-md mx-auto mt-6 bg-white/5 rounded-full h-1.5 overflow-hidden">
                <motion.div 
                  className="h-full bg-primary"
                  initial={{ width: `${((step - 1) / 3) * 100}%` }}
                  animate={{ width: `${(step / 3) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 relative z-10">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Use Case */}
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col items-center justify-center"
              >
                <h3 className="text-xl text-white font-semibold mb-6">1. What is your primary goal?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl">
                  {USE_CASES.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button 
                        key={item.id}
                        onClick={() => handleSelectUseCase(item.id)}
                        className="group bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-white/10 p-5 rounded-xl text-left transition-all flex items-start gap-4"
                      >
                        <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="text-white font-bold mb-1">{item.label}</div>
                          <div className="text-sm text-zinc-400">{item.desc}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 2: Budget */}
            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col items-center justify-center"
              >
                <h3 className="text-xl text-white font-semibold mb-6">2. What is your budget range?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
                  {BUDGETS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button 
                        key={item.id}
                        onClick={() => handleSelectBudget(item.id)}
                        className="group bg-white/5 border border-white/10 hover:border-accent/50 hover:bg-white/10 p-5 rounded-xl text-left transition-all flex flex-col items-center text-center gap-3"
                      >
                        <div className="bg-accent/10 p-4 rounded-full group-hover:bg-accent/20 group-hover:scale-110 transition-all">
                          <Icon className="w-8 h-8 text-accent" />
                        </div>
                        <div>
                          <div className="text-white font-bold mb-1">{item.label}</div>
                          <div className="text-sm text-zinc-400">{item.desc}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
                <button onClick={() => setStep(1)} className="mt-8 text-sm text-zinc-500 hover:text-white transition-colors">
                  ← Back to previous step
                </button>
              </motion.div>
            )}

            {/* STEP 3: Form Factor */}
            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col items-center justify-center"
              >
                <h3 className="text-xl text-white font-semibold mb-6">3. Do you have a hardware preference?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
                  {FORM_FACTORS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button 
                        key={item.id}
                        onClick={() => handleSelectFormFactor(item.id)}
                        className="group bg-white/5 border border-white/10 hover:border-emerald-500/50 hover:bg-white/10 p-5 rounded-xl text-left transition-all flex flex-col items-center text-center gap-3"
                      >
                        <div className="bg-emerald-500/10 p-4 rounded-full group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all">
                          <Icon className="w-8 h-8 text-emerald-400" />
                        </div>
                        <div>
                          <div className="text-white font-bold mb-1">{item.label}</div>
                          <div className="text-sm text-zinc-400">{item.desc}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
                <button onClick={() => setStep(2)} className="mt-8 text-sm text-zinc-500 hover:text-white transition-colors">
                  ← Back to previous step
                </button>
              </motion.div>
            )}

            {/* STEP 4: Loading / Analyzing */}
            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="h-full flex flex-col items-center justify-center"
              >
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="mb-6"
                >
                  <RefreshCw className="w-16 h-16 text-primary opacity-50" />
                </motion.div>
                <h3 className="text-2xl text-white font-bold font-heading mb-2">Analyzing Catalog...</h3>
                <p className="text-zinc-400">Finding the perfect hardware for your needs.</p>
              </motion.div>
            )}

            {/* STEP 5: Results */}
            {step === 5 && (
              <motion.div 
                key="step5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full flex flex-col"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold font-heading text-white mb-2">Your Perfect Matches</h2>
                  <p className="text-zinc-400">Based on your selections, here is what we recommend.</p>
                </div>

                {results.length === 0 ? (
                  <div className="text-center text-zinc-400 py-12">
                    <p>No products found matching your strict criteria.</p>
                    <button onClick={resetWizard} className="mt-4 text-primary hover:underline">Try again with a higher budget</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
                    {results.map((result, idx) => (
                      <div key={result.product.id} className={`relative bg-[#0a0a0a] border ${idx === 0 ? 'border-primary/50' : 'border-white/10'} rounded-xl overflow-hidden flex flex-col group`}>
                        {idx === 0 && (
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent z-20" />
                        )}
                        {idx === 0 && (
                          <div className="absolute top-3 right-3 bg-primary text-black text-xs font-bold font-heading px-2 py-1 rounded uppercase tracking-wider z-20">
                            Top Match
                          </div>
                        )}
                        
                        <div className="relative h-48 w-full bg-black overflow-hidden">
                          <Image 
                            src={result.product.image || "/images/GPU_1024.png"} 
                            alt={result.product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
                          
                          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                            <div>
                              <div className="text-xs text-primary font-heading uppercase tracking-widest mb-1">{result.product.brand}</div>
                              <h3 className="text-lg font-bold text-white leading-tight line-clamp-2">{result.product.name}</h3>
                            </div>
                          </div>
                        </div>

                        <div className="p-5 flex-1 flex flex-col">
                          {/* Match Score */}
                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${idx === 0 ? 'bg-primary' : 'bg-emerald-500'}`} 
                                style={{ width: `${result.matchPercentage}%` }} 
                              />
                            </div>
                            <span className="font-heading font-bold text-white">{result.matchPercentage}% Match</span>
                          </div>

                          {/* Reasons */}
                          <ul className="space-y-2 mb-6 flex-1">
                            {result.matchReasons.map((reason, i) => (
                              <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                                <ArrowRight className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>

                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">AI Score</span>
                              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                                {result.product.ai_score}/100
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Link 
                                href={`/product/${result.product.id}`}
                                className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white text-sm rounded-lg transition-colors font-medium"
                              >
                                Specs
                              </Link>
                              <a 
                                href={getAffiliateUrl(result.product.amazonUrl)}
                                target="_blank"
                                rel="nofollow noopener noreferrer"
                                className="px-3 py-2 bg-primary hover:bg-primary/90 text-black text-sm rounded-lg transition-colors font-bold flex items-center gap-2"
                              >
                                <ShoppingCart className="w-4 h-4" />
                                Check on Amazon
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}


                <div className="text-center mt-8">
                  <button onClick={resetWizard} className="text-sm text-zinc-500 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto">
                    <RefreshCw className="w-4 h-4" />
                    Start Over
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
