export type ModelCategory = 'llm' | 'image';

export interface AIModel {
  id: string;
  name: string;
  category: ModelCategory;
  parameters?: number; // In billions (B), for LLMs
  baseVram?: number; // In GB, base requirement for non-LLMs
}

export const popularModels: AIModel[] = [
  // --- LLMs (Small / Edge 1B - 9B) ---
  { id: 'gemma-2-2b', name: 'Gemma 2 (2B)', category: 'llm', parameters: 2.6 },
  { id: 'llama-3-2-3b', name: 'Meta Llama 3.2 (3B)', category: 'llm', parameters: 3.2 },
  { id: 'phi-3-mini', name: 'Phi-3 / Phi-4 Mini (3.8B)', category: 'llm', parameters: 3.8 },
  { id: 'qwen-2-5-7b', name: 'Qwen 2.5 (7B)', category: 'llm', parameters: 7 },
  { id: 'deepseek-r1-8b', name: 'DeepSeek R1 Distill (8B)', category: 'llm', parameters: 8 },
  { id: 'glm-4-9b', name: 'GLM-4 / GLM-4-Voice (9B)', category: 'llm', parameters: 9 },
  { id: 'gemma-2-9b', name: 'Gemma 2 (9B)', category: 'llm', parameters: 9 },

  // --- LLMs (Medium & Coding 14B - 47B) ---
  { id: 'phi-3-medium', name: 'Phi-3 Medium (14B)', category: 'llm', parameters: 14 },
  { id: 'deepseek-r1-14b', name: 'DeepSeek R1 Distill (14B)', category: 'llm', parameters: 14 },
  { id: 'kimi-k1-5', name: 'Kimi / Moonshot (16B)', category: 'llm', parameters: 16 },
  { id: 'codestral-22b', name: 'Mistral Codestral (22B)', category: 'llm', parameters: 22 },
  { id: 'gemma-2-27b', name: 'Gemma 2 (27B)', category: 'llm', parameters: 27 },
  { id: 'qwen-2-5-coder-32b', name: 'Qwen 2.5 Coder (32B)', category: 'llm', parameters: 32 },
  { id: 'deepseek-r1-32b', name: 'DeepSeek R1 Distill (32B)', category: 'llm', parameters: 32 },
  { id: 'command-r-35b', name: 'Cohere Command R (35B)', category: 'llm', parameters: 35 },
  { id: 'mixtral-8x7b', name: 'Mixtral 8x7B (MoE 47B)', category: 'llm', parameters: 47 },

  // --- LLMs (Large & Reasoning 70B - 141B) ---
  { id: 'llama-3-3-70b', name: 'Meta Llama 3.3 (70B)', category: 'llm', parameters: 70 },
  { id: 'deepseek-r1-70b', name: 'DeepSeek R1 Distill (70B)', category: 'llm', parameters: 70 },
  { id: 'qwen-2-5-72b', name: 'Qwen 2.5 (72B)', category: 'llm', parameters: 72 },
  { id: 'command-r-plus', name: 'Cohere Command R+ (104B)', category: 'llm', parameters: 104 },
  { id: 'mistral-large-2', name: 'Mistral Large 2 (123B)', category: 'llm', parameters: 123 },
  { id: 'glm-4-130b', name: 'GLM-4 (130B MoE)', category: 'llm', parameters: 130 },
  { id: 'mixtral-8x22b', name: 'Mixtral 8x22B (MoE 141B)', category: 'llm', parameters: 141 },

  // --- Frontier / Massive MoE (200B+) ---
  { id: 'deepseek-r1-671b', name: 'DeepSeek R1 / V3 (671B MoE)', category: 'llm', parameters: 671 },
  { id: 'llama-3-405b', name: 'Meta Llama 3.1 (405B)', category: 'llm', parameters: 405 },

  // --- Image & Video Generation ---
  { id: 'sd-1-5', name: 'Stable Diffusion 1.5', category: 'image', baseVram: 4 },
  { id: 'sdxl', name: 'Stable Diffusion XL (SDXL)', category: 'image', baseVram: 8 },
  { id: 'sd3-5-large', name: 'Stable Diffusion 3.5 (Large)', category: 'image', baseVram: 12 },
  { id: 'flux-1-schnell', name: 'Flux.1 (Schnell)', category: 'image', baseVram: 12 },
  { id: 'flux-1-dev', name: 'Flux.1 (Dev)', category: 'image', baseVram: 16 },
  { id: 'wan-2-1-video', name: 'Wan 2.1 / HunYuan Video (14B)', category: 'image', baseVram: 24 },

  // --- Custom Option ---
  { id: 'custom', name: 'Custom Model (Enter Parameters)', category: 'llm' }
];
