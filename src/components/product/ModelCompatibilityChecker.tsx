'use client';

import { useState, useMemo, useEffect } from 'react';
import { popularModels, AIModel, ModelCategory } from '@/data/aiModels';
import { HardwareProduct } from '@/types/product';
import { Cpu, CheckCircle2, AlertTriangle, XCircle, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModelCompatibilityCheckerProps {
  product: HardwareProduct;
}

const CONTEXT_OVERHEAD_GB = 1.5; // Buffer for context window and OS overhead

export function ModelCompatibilityChecker({ product }: ModelCompatibilityCheckerProps) {
  const [selectedModelId, setSelectedModelId] = useState<string>('llama-3-8b');
  const [customParams, setCustomParams] = useState<number | ''>(8);
  const [customCategory, setCustomCategory] = useState<ModelCategory>('llm');

  // Extract VRAM from product specs
  const availableVram = useMemo(() => {
    // Try to get VRAM or Unified Memory (Case insensitive search through keys)
    const specsKeys = Object.keys(product.specs);
    const vramKey = specsKeys.find(k => {
      const lowerK = k.toLowerCase();
      return lowerK === 'vram' || lowerK === 'memory' || lowerK === 'graphics card ram';
    });
    
    if (!vramKey) return null;
    
    const vramSpec = product.specs[vramKey];
    if (!vramSpec) return null;

    // Extract numbers from strings like "16GB GDDR6" or "128 GB Unified"
    const match = String(vramSpec).match(/(\d+)\s*(?:GB|TB)/i);
    if (match) {
      const value = parseInt(match[1], 10);
      // Basic sanity check, if it says "1 TB", that's 1024 GB. But usually it's in GB.
      if (String(vramSpec).toUpperCase().includes('TB')) {
        return value * 1024;
      }
      return value;
    }
    return null;
  }, [product.specs]);

  const selectedModel = useMemo(() => {
    return popularModels.find(m => m.id === selectedModelId) || popularModels[0];
  }, [selectedModelId]);

  const isCustom = selectedModelId === 'custom';

  const analysisResult = useMemo(() => {
    if (availableVram === null) return null;

    const category = isCustom ? customCategory : selectedModel.category;
    let requiredVram = 0;
    
    // Default optimistic assumption
    let status: 'success' | 'warning' | 'danger' = 'success';
    let message = '';
    let details = '';

    if (category === 'llm') {
      const params = isCustom ? (Number(customParams) || 0) : (selectedModel.parameters || 0);
      if (params === 0) {
        return { status: 'warning' as const, message: 'Please enter parameter size', details: '' };
      }

      // Calculations (GB)
      const vram4bit = (params * 0.6) + CONTEXT_OVERHEAD_GB;
      const vram8bit = (params * 1.0) + CONTEXT_OVERHEAD_GB;
      const vram16bit = (params * 2.0) + CONTEXT_OVERHEAD_GB;

      if (availableVram >= vram16bit) {
        status = 'success';
        message = 'Runs Perfectly (Uncompressed)';
        details = `Can fit the full 16-bit model (~${vram16bit.toFixed(1)}GB) with room to spare.`;
      } else if (availableVram >= vram8bit) {
        status = 'success';
        message = 'Runs Great (8-bit Quantized)';
        details = `Fits easily at 8-bit precision (~${vram8bit.toFixed(1)}GB) with minimal quality loss.`;
      } else if (availableVram >= vram4bit) {
        status = 'warning';
        message = 'Runs Acceptably (4-bit Quantized)';
        details = `Requires 4-bit quantization (~${vram4bit.toFixed(1)}GB). Good speed, slight quality drop.`;
      } else {
        status = 'danger';
        message = 'Not Recommended (Requires Offloading)';
        details = `Even at 4-bit (~${vram4bit.toFixed(1)}GB), it exceeds your ${availableVram}GB VRAM. It will heavily offload to slow system RAM.`;
      }
      requiredVram = vram4bit; // Base requirement for display

    } else if (category === 'image') {
      const baseReq = isCustom ? (Number(customParams) || 8) : (selectedModel.baseVram || 8);
      
      if (availableVram >= baseReq + 4) {
        status = 'success';
        message = 'Excellent Performance';
        details = `Plenty of VRAM for high-res generation and complex workflows (Requires ~${baseReq}GB).`;
      } else if (availableVram >= baseReq) {
        status = 'warning';
        message = 'Acceptable Performance';
        details = `Meets minimum requirements (~${baseReq}GB). Very high resolutions might cause Out of Memory errors.`;
      } else {
        status = 'danger';
        message = 'Insufficient VRAM';
        details = `Model requires ~${baseReq}GB. Your ${availableVram}GB is not enough and will likely crash or be extremely slow.`;
      }
      requiredVram = baseReq;
    }

    return { status, message, details, requiredVram };

  }, [availableVram, selectedModel, isCustom, customParams, customCategory]);


  if (availableVram === null) {
    return null; // Don't render if we can't determine VRAM
  }

  return (
    <div className="bg-[#050505] border border-white/10 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] mb-12">
      {/* Header */}
      <div className="bg-zinc-900/50 p-6 border-b border-white/5 flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Cpu className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white font-heading">"Will it Run?" Compatibility Checker</h3>
          <p className="text-sm text-zinc-400">See if {product.name}'s {availableVram}GB VRAM can handle popular AI models.</p>
        </div>
      </div>

      <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Col: Controls */}
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Select AI Model</label>
            <div className="relative">
              <select
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg px-4 py-3 appearance-none focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-medium"
              >
                {popularModels.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                ▼
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isCustom && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 pt-4 border-t border-white/5"
              >
                <div className="flex gap-4">
                  <button
                    onClick={() => setCustomCategory('llm')}
                    className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${customCategory === 'llm' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-zinc-900 text-zinc-400 border border-transparent hover:bg-zinc-800'}`}
                  >
                    LLM (Text)
                  </button>
                  <button
                    onClick={() => setCustomCategory('image')}
                    className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${customCategory === 'image' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-zinc-900 text-zinc-400 border border-transparent hover:bg-zinc-800'}`}
                  >
                    Image Gen
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">
                    {customCategory === 'llm' ? 'Parameters (Billions)' : 'Required Base VRAM (GB)'}
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      value={customParams}
                      onChange={(e) => setCustomParams(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50"
                      placeholder={customCategory === 'llm' ? "e.g., 8" : "e.g., 12"}
                    />
                    <span className="text-zinc-500 font-semibold">{customCategory === 'llm' ? 'B' : 'GB'}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Col: Result */}
        <div className="flex items-center">
          {analysisResult ? (
            <motion.div
              key={analysisResult.status + selectedModelId + customParams} // Re-animate on change
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`w-full p-6 rounded-xl border relative overflow-hidden ${
                analysisResult.status === 'success' ? 'bg-emerald-500/10 border-emerald-500/30' :
                analysisResult.status === 'warning' ? 'bg-amber-500/10 border-amber-500/30' :
                'bg-red-500/10 border-red-500/30'
              }`}
            >
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  {analysisResult.status === 'success' && <CheckCircle2 className="w-8 h-8 text-emerald-500 shrink-0" />}
                  {analysisResult.status === 'warning' && <AlertTriangle className="w-8 h-8 text-amber-500 shrink-0" />}
                  {analysisResult.status === 'danger' && <XCircle className="w-8 h-8 text-red-500 shrink-0" />}
                  
                  <div>
                    <h4 className={`text-xl font-bold mb-1 ${
                      analysisResult.status === 'success' ? 'text-emerald-400' :
                      analysisResult.status === 'warning' ? 'text-amber-400' :
                      'text-red-400'
                    }`}>
                      {analysisResult.message}
                    </h4>
                    <p className="text-zinc-300 text-sm leading-relaxed">
                      {analysisResult.details}
                    </p>
                  </div>
                </div>

                {/* VRAM Progress Bar */}
                <div className="mt-2 pt-4 border-t border-white/10">
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-zinc-400">VRAM Capacity ({availableVram}GB)</span>
                    <span className={analysisResult.status === 'danger' ? 'text-red-400' : 'text-primary'}>
                      Min Req: ~{analysisResult.requiredVram?.toFixed(1)}GB
                    </span>
                  </div>
                  <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden flex relative">
                    {/* The bar filling up */}
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, ((analysisResult.requiredVram || 0) / availableVram) * 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full ${
                        analysisResult.status === 'success' ? 'bg-emerald-500' :
                        analysisResult.status === 'warning' ? 'bg-amber-500' :
                        'bg-red-500'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </div>

      </div>
    </div>
  );
}
