export type ModelCategory = 'llm' | 'image';

export interface AIModel {
  id: string;
  name: string;
  category: ModelCategory;
  parameters?: number; // In billions (B), for LLMs
  baseVram?: number; // In GB, base requirement for non-LLMs
}

export const popularModels: AIModel[] = [
  // --- LLMs (Small / Edge) ---
  { id: 'gemma-2-2b', name: 'Gemma 2 (2B)', category: 'llm', parameters: 2.6 },
  { id: 'phi-3-mini', name: 'Phi-3 Mini (3.8B)', category: 'llm', parameters: 3.8 },
  { id: 'llama-3-8b', name: 'Meta Llama 3 / 3.1 (8B)', category: 'llm', parameters: 8 },
  { id: 'qwen-2-5-7b', name: 'Qwen 2.5 (7B)', category: 'llm', parameters: 7 },
  { id: 'gemma-2-9b', name: 'Gemma 2 (9B)', category: 'llm', parameters: 9 },

  // --- LLMs (Medium) ---
  { id: 'phi-3-medium', name: 'Phi-3 Medium (14B)', category: 'llm', parameters: 14 },
  { id: 'qwen-2-5-32b', name: 'Qwen 2.5 (32B)', category: 'llm', parameters: 32 },
  { id: 'gemma-2-27b', name: 'Gemma 2 (27B)', category: 'llm', parameters: 27 },
  { id: 'command-r-35b', name: 'Cohere Command R (35B)', category: 'llm', parameters: 35 },
  { id: 'deepseek-coder-33b', name: 'DeepSeek Coder (33B)', category: 'llm', parameters: 33 },
  { id: 'mixtral-8x7b', name: 'Mixtral 8x7B (MoE)', category: 'llm', parameters: 47 },

  // --- LLMs (Large / Heavy) ---
  { id: 'llama-3-70b', name: 'Meta Llama 3 / 3.1 (70B)', category: 'llm', parameters: 70 },
  { id: 'qwen-2-5-72b', name: 'Qwen 2.5 (72B)', category: 'llm', parameters: 72 },
  { id: 'command-r-plus', name: 'Cohere Command R+ (104B)', category: 'llm', parameters: 104 },
  { id: 'mixtral-8x22b', name: 'Mixtral 8x22B (MoE)', category: 'llm', parameters: 141 },
  { id: 'deepseek-v2', name: 'DeepSeek V2 (236B MoE)', category: 'llm', parameters: 236 },
  { id: 'llama-3-405b', name: 'Meta Llama 3.1 (405B)', category: 'llm', parameters: 405 },

  // --- Image Generation ---
  { id: 'sd-1-5', name: 'Stable Diffusion 1.5', category: 'image', baseVram: 4 },
  { id: 'sdxl', name: 'Stable Diffusion XL (SDXL)', category: 'image', baseVram: 8 },
  { id: 'sd3-medium', name: 'Stable Diffusion 3 (Medium)', category: 'image', baseVram: 10 },
  { id: 'flux-1-schnell', name: 'Flux.1 (Schnell)', category: 'image', baseVram: 12 },
  { id: 'flux-1-dev', name: 'Flux.1 (Dev)', category: 'image', baseVram: 16 },
  { id: 'auraflow', name: 'AuraFlow', category: 'image', baseVram: 20 },

  // --- Custom Option ---
  { id: 'custom', name: 'Custom Model (Enter Parameters)', category: 'llm' }
];
