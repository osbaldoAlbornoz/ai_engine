'use client';

import { useState, useMemo } from 'react';
import { HardwareProduct } from '@/types/product';
import { Calculator, Zap, HardDrive, AlertTriangle, ExternalLink, Cpu, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MultiGpuSimulatorProps {
  product: HardwareProduct;
}

export function MultiGpuSimulator({ product }: MultiGpuSimulatorProps) {
  const [gpuCount, setGpuCount] = useState<number>(2);

  // Extract VRAM from product specs
  const baseVram = useMemo(() => {
    const specsKeys = Object.keys(product.specs || {});
    const vramKey = specsKeys.find(k => {
      const lowerK = k.toLowerCase();
      return lowerK === 'vram' || lowerK === 'memory' || lowerK === 'graphics card ram';
    });
    if (!vramKey) return 0;
    const vramSpec = product.specs[vramKey];
    if (!vramSpec) return 0;
    const match = String(vramSpec).match(/(\d+)\s*(?:GB|TB)/i);
    if (match) {
      const value = parseInt(match[1], 10);
      if (String(vramSpec).toUpperCase().includes('TB')) return value * 1024;
      return value;
    }
    return 0;
  }, [product.specs]);

  // Extract Power/TDP from product specs, default to 350W for high end GPUs if not found
  const basePower = useMemo(() => {
    const specsKeys = Object.keys(product.specs || {});
    const powerKey = specsKeys.find(k => {
      const lowerK = k.toLowerCase();
      return lowerK === 'tdp' || lowerK === 'power' || lowerK === 'wattage' || lowerK === 'power consumption';
    });
    if (!powerKey) return 350; // Fallback estimate
    const powerSpec = product.specs[powerKey];
    if (!powerSpec) return 350;
    const match = String(powerSpec).match(/(\d+)\s*(?:W|Watt|Watts)/i);
    if (match) {
      return parseInt(match[1], 10);
    }
    return 350; // Fallback
  }, [product.specs]);

  const totalVram = baseVram * gpuCount;
  // Estimate system baseline power overhead (CPU, Mobo, RAM, Fans) at ~250W
  const systemOverhead = 250;
  const totalPower = (basePower * gpuCount) + systemOverhead;

  // Add a 20% safety margin for PSU recommendation
  const recommendedPsu = Math.ceil((totalPower * 1.2) / 100) * 100; // Round up to nearest 100

  // Amazon Affiliate Search URL for PSU
  const psuSearchUrl = `https://www.amazon.com/s?k=${recommendedPsu}W+ATX+3.0+Power+Supply&tag=aiengine-20`;
  const riserSearchUrl = `https://www.amazon.com/s?k=PCIe+4.0+Riser+Cable&tag=aiengine-20`;

  // We only show this if it's a GPU with valid VRAM, though the parent component already filters for 'gpus' category.
  if (baseVram === 0) return null;

  return (
    <div className="bg-[#050505] border border-white/10 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] mb-12">
      {/* Header */}
      <div className="bg-zinc-900/50 p-6 border-b border-white/5 flex items-center gap-4">
        <div className="p-3 bg-fuchsia-500/10 rounded-lg">
          <Layers className="w-6 h-6 text-fuchsia-500" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white font-heading">Multi-GPU Rig Simulator</h3>
          <p className="text-sm text-zinc-400">Calculate requirements for a multi-GPU AI server setup.</p>
        </div>
      </div>

      <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Col: Controls */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Number of GPUs</label>
              <span className="text-2xl font-bold text-fuchsia-400">{gpuCount}x</span>
            </div>
            
            <input 
              type="range" 
              min="1" 
              max="8" 
              value={gpuCount}
              onChange={(e) => setGpuCount(parseInt(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
            />
            
            <div className="flex justify-between text-xs font-semibold text-zinc-500">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
              <span>6</span>
              <span>7</span>
              <span>8</span>
            </div>
          </div>

          <div className="bg-zinc-900/80 rounded-lg p-4 border border-white/5 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-400">Base VRAM (Per GPU)</span>
              <span className="font-semibold text-white">{baseVram} GB</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-400">Base Power (Per GPU)</span>
              <span className="font-semibold text-white">~{basePower} W</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-400">System Overhead</span>
              <span className="font-semibold text-white">~{systemOverhead} W</span>
            </div>
          </div>
        </div>

        {/* Right Col: Results & Cross-Sell */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900 border border-white/10 rounded-lg p-4 flex flex-col items-center justify-center text-center">
              <HardDrive className="w-6 h-6 text-primary mb-2" />
              <span className="text-xs text-zinc-400 uppercase font-semibold tracking-wider">Total VRAM</span>
              <span className="text-2xl font-bold text-white mt-1">{totalVram} GB</span>
            </div>
            
            <div className="bg-zinc-900 border border-white/10 rounded-lg p-4 flex flex-col items-center justify-center text-center">
              <Zap className="w-6 h-6 text-amber-500 mb-2" />
              <span className="text-xs text-zinc-400 uppercase font-semibold tracking-wider">Estimated Power</span>
              <span className="text-2xl font-bold text-white mt-1">~{totalPower} W</span>
            </div>
          </div>

          {gpuCount > 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary/5 border border-primary/20 rounded-lg p-5 mt-4 space-y-4"
            >
              <h4 className="text-primary font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Recommended Upgrades
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">Power Supply (PSU)</div>
                    <div className="text-xs text-zinc-400">Recommended: {recommendedPsu}W Minimum</div>
                  </div>
                  {/* Temporarily disabled until Amazon API is integrated
                  <a 
                    href={psuSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-bold bg-primary text-black px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Find PSU <ExternalLink className="w-3 h-3" />
                  </a>
                  */}
                  <span className="text-xs font-bold text-primary px-3 py-1.5 border border-primary/30 rounded-md">Required</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">PCIe Extensions</div>
                    <div className="text-xs text-zinc-400">For multi-GPU airflow & spacing</div>
                  </div>
                  {/* Temporarily disabled until Amazon API is integrated
                  <a 
                    href={riserSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-bold bg-zinc-800 text-white px-3 py-1.5 rounded-md hover:bg-zinc-700 transition-colors"
                  >
                    Find Risers <ExternalLink className="w-3 h-3" />
                  </a>
                  */}
                  <span className="text-xs font-bold text-zinc-400 px-3 py-1.5 border border-white/10 rounded-md">Required</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
