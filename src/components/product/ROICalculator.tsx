"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, Cloud, HardDrive, ArrowRight } from "lucide-react";

interface Props {
  localPrice: number;
}

export function ROICalculator({ localPrice }: Props) {
  const [hoursPerWeek, setHoursPerWeek] = useState(20);
  const cloudCostPerHour = 1.50; // Average cost for a high-end instance

  // If price is 0, we can't calculate ROI effectively
  if (!localPrice || localPrice <= 0) return null;

  const weeklyCloudCost = hoursPerWeek * cloudCostPerHour;
  const monthlyCloudCost = weeklyCloudCost * 4.33; // Average weeks per month
  
  const breakevenMonths = monthlyCloudCost > 0 ? (localPrice / monthlyCloudCost).toFixed(1) : "∞";

  return (
    <div className="mt-12 bg-[#050505] border border-white/5 rounded-lg p-6 md:p-8 relative overflow-hidden group shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] hover:border-primary/30 transition-all duration-500">
      {/* Technical Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-50 group-hover:opacity-70 transition-opacity duration-700" />
      
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/20 transition-all duration-700" />
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <Calculator className="w-6 h-6 text-primary drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
        <h3 className="text-xl md:text-2xl font-bold text-white font-heading">
          Cloud vs Local ROI Calculator
        </h3>
      </div>

      <p className="text-zinc-400 text-sm mb-8 relative z-10">
        Calculate how quickly this hardware pays for itself compared to renting a similar instance in the cloud (Avg. ${cloudCostPerHour.toFixed(2)}/hr).
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* Controls */}
        <div className="flex flex-col justify-center">
          <label className="flex justify-between items-center mb-4">
            <span className="text-zinc-300 font-heading text-sm uppercase tracking-widest">Usage per week</span>
            <span className="text-2xl font-bold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{hoursPerWeek} <span className="text-sm text-zinc-500">hours</span></span>
          </label>
          <div className="relative p-1 bg-black/50 rounded-lg border border-white/5 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
            <input 
              type="range" 
              min="1" 
              max="168" 
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(Number(e.target.value))}
              className="w-full h-2 bg-transparent appearance-none cursor-pointer accent-primary relative z-10"
            />
            {/* Custom slider track glow */}
            <div 
              className="absolute top-1/2 left-1 -translate-y-1/2 h-2 bg-gradient-to-r from-primary to-accent rounded-full pointer-events-none shadow-[0_0_10px_rgba(0,229,255,0.5)]"
              style={{ width: `calc(${(hoursPerWeek / 168) * 100}% - 8px)` }}
            />
          </div>
          <div className="flex justify-between mt-3 text-xs font-heading tracking-widest text-zinc-500 uppercase">
            <span>Casual (1h)</span>
            <span>24/7 (168h)</span>
          </div>
        </div>

        {/* Results */}
        <div className="bg-black/80 backdrop-blur-sm border border-white/10 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden group/results hover:border-primary/30 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover/results:opacity-100 transition-opacity duration-300" />
          
          <div className="text-center sm:text-left relative z-10">
            <div className="flex items-center gap-2 text-zinc-400 mb-1 justify-center sm:justify-start">
              <HardDrive className="w-4 h-4 text-primary" /> Est. MSRP
            </div>
            <div className="text-2xl font-bold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">${localPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          
          <ArrowRight className="w-6 h-6 text-zinc-600 hidden sm:block relative z-10" />
          
          <div className="text-center sm:text-left relative z-10">
            <div className="flex items-center gap-2 text-zinc-400 mb-1 justify-center sm:justify-start">
              <Cloud className="w-4 h-4 text-accent" /> Cloud Cost
            </div>
            <div className="text-xl font-bold text-zinc-300">${monthlyCloudCost.toFixed(0)} <span className="text-xs text-zinc-500">/mo</span></div>
          </div>
        </div>
      </div>

      <motion.div 
        key={breakevenMonths}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mt-8 pt-6 border-t border-white/5 text-center"
      >
        <span className="text-zinc-400 font-heading text-sm uppercase tracking-widest block mb-2">Breakeven Point</span>
        <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent font-heading drop-shadow-[0_0_15px_rgba(0,229,255,0.3)]">
          {breakevenMonths} Months
        </div>
        <p className="text-xs text-zinc-600 mt-2">Time until local hardware becomes cheaper than cloud rental.</p>

        {/* Price Disclaimer Footnote */}
        <p className="text-[11px] text-zinc-500 text-center leading-relaxed mt-4 max-w-2xl mx-auto">
          * Note: ROI calculations and comparisons use an estimated MSRP as a baseline. Actual Amazon prices fluctuate frequently. Check Amazon for the current exact price.
        </p>
      </motion.div>
    </div>
  );
}
