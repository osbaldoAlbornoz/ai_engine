/**
 * Casos de Uso para Hardware AI
 * 
 * Define los diferentes casos de uso y cómo ponderan las specs
 * para calcular scores específicos por caso de uso.
 */

export type UseCaseId =
  | 'ai-ml-training'
  | 'stable-diffusion'
  | 'llm-local'
  | 'gaming-4k'
  | 'video-editing'
  | 'general-use'
  | '3d-rendering';

export interface UseCase {
  id: UseCaseId;
  name: string;
  description: string;
  icon: string;
  // Ponderación de specs (debe sumar 1.0)
  specWeights: {
    vram?: number;
    memoryBandwidth?: number;
    cudaCores?: number;
    tensorCores?: number;
    clockSpeed?: number;
    architecture?: number;
    powerEfficiency?: number;
    price?: number;
    brand?: number;
    features?: number;
  };
  // Specs mínimas recomendadas
  minimumSpecs?: Record<string, number>;
}

export const USE_CASES: Record<UseCaseId, UseCase> = {
  'ai-ml-training': {
    id: 'ai-ml-training',
    name: 'AI/ML Training',
    description: 'Training machine learning and deep learning models',
    icon: '🧠',
    specWeights: {
      vram: 0.35,
      memoryBandwidth: 0.20,
      tensorCores: 0.20,
      cudaCores: 0.10,
      architecture: 0.10,
      price: 0.05,
    },
    minimumSpecs: {
      vramGB: 12,
    },
  },
  'stable-diffusion': {
    id: 'stable-diffusion',
    name: 'Stable Diffusion',
    description: 'AI image generation (SDXL, Flux, etc.)',
    icon: '🎨',
    specWeights: {
      vram: 0.40,
      cudaCores: 0.20,
      tensorCores: 0.15,
      memoryBandwidth: 0.10,
      architecture: 0.10,
      price: 0.05,
    },
    minimumSpecs: {
      vramGB: 8,
    },
  },
  'llm-local': {
    id: 'llm-local',
    name: 'LLM Local',
    description: 'Local LLM execution (Ollama, LM Studio, llama.cpp)',
    icon: '💬',
    specWeights: {
      vram: 0.45,
      memoryBandwidth: 0.25,
      architecture: 0.15,
      tensorCores: 0.10,
      price: 0.05,
    },
    minimumSpecs: {
      vramGB: 16,
    },
  },
  'gaming-4k': {
    id: 'gaming-4k',
    name: 'Gaming 4K',
    description: '4K resolution gaming with high FPS',
    icon: '🎮',
    specWeights: {
      cudaCores: 0.25,
      clockSpeed: 0.20,
      vram: 0.20,
      architecture: 0.15,
      memoryBandwidth: 0.10,
      brand: 0.05,
      price: 0.05,
    },
    minimumSpecs: {
      vramGB: 12,
    },
  },
  'video-editing': {
    id: 'video-editing',
    name: 'Video Editing',
    description: '4K/8K video editing and rendering',
    icon: '🎬',
    specWeights: {
      vram: 0.30,
      cudaCores: 0.20,
      memoryBandwidth: 0.15,
      architecture: 0.15,
      features: 0.10,
      price: 0.05,
      brand: 0.05,
    },
    minimumSpecs: {
      vramGB: 12,
    },
  },
  'general-use': {
    id: 'general-use',
    name: 'General Use',
    description: 'Daily tasks and multimedia',
    icon: '💼',
    specWeights: {
      price: 0.30,
      vram: 0.20,
      cudaCores: 0.15,
      architecture: 0.15,
      powerEfficiency: 0.10,
      brand: 0.05,
      features: 0.05,
    },
    minimumSpecs: {
      vramGB: 8,
    },
  },
  '3d-rendering': {
    id: '3d-rendering',
    name: '3D Rendering',
    description: '3D rendering (Blender, Cinema 4D, etc.)',
    icon: '🏗️',
    specWeights: {
      cudaCores: 0.30,
      vram: 0.25,
      architecture: 0.15,
      memoryBandwidth: 0.15,
      price: 0.10,
      brand: 0.05,
    },
    minimumSpecs: {
      vramGB: 12,
    },
  },
};

/**
 * Calcula el score de un producto para un caso de uso específico
 */
export function calculateUseCaseScore(
  product: {
    name?: string;
    specs?: Record<string, any>;
    price?: number;
    brand?: string;
    category?: string;
  },
  useCaseId: UseCaseId,
  onlyUseFields?: string[]
): number {
  const useCase = USE_CASES[useCaseId];

  let score = 0;
  let totalWeightUsed = 0;

  const checkField = (field: string, weight?: number) => {
    if (!weight) return false;
    if (onlyUseFields && !onlyUseFields.includes(field)) return false;
    return true;
  };

  // VRAM Score (0-100, 96GB = 100)
  if (checkField('vram', useCase.specWeights.vram)) {
    const vramGB = parseVRAM(product);
    if (vramGB !== null) {
      const vramScore = Math.min(100, (vramGB / 96) * 100);
      score += vramScore * useCase.specWeights.vram!;
      totalWeightUsed += useCase.specWeights.vram!;
    }
  }

  // CUDA Cores Score (0-100, 18176 = 100)
  if (checkField('cudaCores', useCase.specWeights.cudaCores)) {
    const cudaCores = parseNumberSpec(product, ['CUDA Cores', 'Cuda Cores', 'cuda cores', 'Stream Processors', 'Cores']);
    if (cudaCores !== null) {
      const cudaScore = Math.min(100, (cudaCores / 18176) * 100);
      score += cudaScore * useCase.specWeights.cudaCores!;
      totalWeightUsed += useCase.specWeights.cudaCores!;
    }
  }

  // Tensor Cores Score (0-100, 568 = 100)
  if (checkField('tensorCores', useCase.specWeights.tensorCores)) {
    const tensorCores = parseNumberSpec(product, ['Tensor Cores', 'tensor cores', 'AI Cores']);
    if (tensorCores !== null) {
      const tensorScore = Math.min(100, (tensorCores / 568) * 100);
      score += tensorScore * useCase.specWeights.tensorCores!;
      totalWeightUsed += useCase.specWeights.tensorCores!;
    }
  }

  // Memory Bandwidth Score (0-100, 2000 GB/s = 100)
  if (checkField('memoryBandwidth', useCase.specWeights.memoryBandwidth)) {
    const bandwidth = parseNumberSpec(product, ['Memory Bandwidth', 'Ancho de banda', 'Bandwidth', 'Memory Bus']);
    if (bandwidth !== null) {
      const bandwidthScore = Math.min(100, (bandwidth / 2000) * 100);
      score += bandwidthScore * useCase.specWeights.memoryBandwidth!;
      totalWeightUsed += useCase.specWeights.memoryBandwidth!;
    }
  }

  // Clock Speed Score (0-100, 3000 MHz = 100)
  if (checkField('clockSpeed', useCase.specWeights.clockSpeed)) {
    const clock = parseNumberSpec(product, ['Boost Clock', 'Base Clock', 'Clock Speed', 'GPU Clock']);
    if (clock !== null) {
      const clockScore = Math.min(100, (clock / 3000) * 100);
      score += clockScore * useCase.specWeights.clockSpeed!;
      totalWeightUsed += useCase.specWeights.clockSpeed!;
    }
  }

  // Architecture Score (0-100)
  if (checkField('architecture', useCase.specWeights.architecture)) {
    const arch = parseArchitecture(product);
    if (arch !== null) {
      // mapping: 12 (Blackwell) -> 100, 10 (Ada) -> 85, 8 (Ampere) -> 70, 6 (Turing) -> 55, 4 (Pascal) -> 40
      const archScore = Math.min(100, Math.max(0, (arch / 12) * 100));
      score += archScore * useCase.specWeights.architecture!;
      totalWeightUsed += useCase.specWeights.architecture!;
    }
  }

  // Price Value Score (0-100) - $0 = 100, $10000 = 0
  if (checkField('price', useCase.specWeights.price)) {
    if (product.price && product.price > 0) {
      const priceValue = Math.max(0, 100 - (product.price / 100));
      score += priceValue * useCase.specWeights.price!;
      totalWeightUsed += useCase.specWeights.price!;
    }
  }

  // Brand Score (0-100)
  if (checkField('brand', useCase.specWeights.brand)) {
    if (product.brand) {
      const brandScores: Record<string, number> = {
        'NVIDIA': 100,
        'AMD': 85,
        'Apple': 85,
        'Intel': 70,
        'ASUS': 70,
        'MSI': 70,
        'Gigabyte': 60,
        'EVGA': 70,
        'Zotac': 60,
        'PNY': 60,
      };
      score += (brandScores[product.brand] || 50) * useCase.specWeights.brand!;
      totalWeightUsed += useCase.specWeights.brand!;
    }
  }

  // Features Score (0-100)
  if (checkField('features', useCase.specWeights.features)) {
    const features = Array.isArray(product.specs?.features) ? product.specs.features : [];
    if (features.length > 0) {
      const featureScore = Math.min(100, features.length * 20);
      score += featureScore * useCase.specWeights.features!;
      totalWeightUsed += useCase.specWeights.features!;
    }
  }

  if (totalWeightUsed === 0) return 0;

  // Normalization logic with a penalty for missing critical data.
  // If a device lacks most specs (e.g. barebone Mini PCs with no RAM/GPU), 
  // its totalWeightUsed will be very low (e.g. 0.05 from price only).
  // We apply a penalty so incomplete items don't falsely score 100%.
  const penaltyFactor = Math.min(1, totalWeightUsed / 0.7);

  return Math.round((score / totalWeightUsed) * penaltyFactor);
}

/**
 * Obtiene el mejor caso de uso para un producto
 */
export function getBestUseCase(product: {
  name?: string;
  specs?: Record<string, any>;
  price?: number;
  brand?: string;
  category?: string;
}): { useCase: UseCase; score: number } {
  let bestUseCase: UseCase = USE_CASES['general-use'];
  let bestScore = 0;

  for (const useCaseId of Object.keys(USE_CASES) as UseCaseId[]) {
    const score = calculateUseCaseScore(product, useCaseId);
    if (score > bestScore) {
      bestScore = score;
      bestUseCase = USE_CASES[useCaseId];
    }
  }

  return { useCase: bestUseCase, score: bestScore };
}

// Helpers para parsear specs
function parseVRAM(product: { name?: string; specs?: Record<string, any>; category?: string }): number | null {
  const specs = product.specs || {};
  const name = (product.name || '').toLowerCase();

  const vramKeys = ['Graphics Card Ram', 'VRAM', 'Video Memory', 'Memory', 'vram', 'video memory', 'memoria'];
  for (const key of vramKeys) {
    const val = specs[key];
    if (val) {
      const num = parseFloat(String(val).replace(/[^0-9.]/g, ''));
      if (!isNaN(num)) return num;
    }
  }
  // Try title if not in specs. Be careful to avoid capturing System RAM (e.g. 32GB RAM)
  // Look for VRAM specifically or near GPU keywords (RTX, RX, GDDR, VRAM)
  const vramMatch = name.match(/(\d+)\s*gb\s*(?:gddr|vram|video)/i) ||
    name.match(/(?:rtx|rx|geforce|radeon).*?(\d+)\s*gb/i) ||
    name.match(/(\d+)\s*gb\s*(?:rtx|rx)/i);
  if (vramMatch) return parseFloat(vramMatch[1]);

  // Fallback if it's explicitly a GPU (not a laptop)
  if (product.category === 'gpus') {
    const genericMatch = name.match(/(\d+)\s*gb/i);
    if (genericMatch) return parseFloat(genericMatch[1]);
  }

  return null; // genuinely missing
}

function parseNumberSpec(product: { specs?: Record<string, any> }, keys: string[]): number | null {
  const specs = product.specs || {};
  for (const key of keys) {
    const val = specs[key];
    if (val) {
      const num = parseFloat(String(val).replace(/[^0-9.]/g, ''));
      if (!isNaN(num)) return num;
    }
  }
  return null;
}

function parseArchitecture(product: { name?: string; specs?: Record<string, any> }): number | null {
  const specs = product.specs || {};
  const name = (product.name || '').toLowerCase();

  const archKeys = ['Architecture', 'architecture', 'GPU Architecture', 'Generation'];
  let archStr = name + " ";
  for (const key of archKeys) {
    if (specs[key]) archStr += String(specs[key]).toLowerCase() + " ";
  }

  if (archStr.includes('blackwell') || archStr.includes('5090') || archStr.includes('5080') || archStr.includes('5070')) return 12; // Top tier
  if (archStr.includes('ada') || archStr.includes('40')) return 10;
  if (archStr.includes('ampere') || archStr.includes('30')) return 8;
  if (archStr.includes('turing') || archStr.includes('20')) return 6;
  if (archStr.includes('pascal')) return 4;

  return null;
}

export function getPresentFields(product: {
  name?: string;
  specs?: Record<string, any>;
  price?: number;
  brand?: string;
  category?: string;
}): string[] {
  const fields: string[] = [];
  if (parseVRAM(product) !== null) fields.push('vram');
  if (parseNumberSpec(product, ['CUDA Cores', 'Cuda Cores', 'cuda cores', 'Stream Processors', 'Cores']) !== null) fields.push('cudaCores');
  if (parseNumberSpec(product, ['Tensor Cores', 'tensor cores', 'AI Cores']) !== null) fields.push('tensorCores');
  if (parseNumberSpec(product, ['Memory Bandwidth', 'Ancho de banda', 'Bandwidth', 'Memory Bus']) !== null) fields.push('memoryBandwidth');
  if (parseNumberSpec(product, ['Boost Clock', 'Base Clock', 'Clock Speed', 'GPU Clock']) !== null) fields.push('clockSpeed');
  if (parseArchitecture(product) !== null) fields.push('architecture');
  if (parseNumberSpec(product, ['Cores', 'Number of Cores', 'CPU Cores']) !== null) fields.push('cores');
  if (parseNumberSpec(product, ['Threads', 'Number of Threads']) !== null) fields.push('threads');
  if (product.price && product.price > 0) fields.push('price');
  if (product.brand) fields.push('brand');
  const features = Array.isArray(product.specs?.features) ? product.specs.features : [];
  if (features.length > 0) fields.push('features');
  return fields;
}

/**
 * Obtiene las diferencias clave entre dos productos para un caso de uso
 */
export function getKeyDifferences(
  productA: { name: string; specs?: Record<string, any>; price?: number },
  productB: { name: string; specs?: Record<string, any>; price?: number },
  useCaseId: UseCaseId,
  onlyUseFields?: string[]
): string[] {
  const differences: string[] = [];

  // VRAM Difference
  if (!onlyUseFields || onlyUseFields.includes('vram')) {
    const vramA = parseVRAM(productA);
    const vramB = parseVRAM(productB);
    if (vramA !== null && vramB !== null) {
      const vramDiff = Math.abs(vramA - vramB);
      if (vramDiff >= 4) {
        const winner = vramA > vramB ? productA.name : productB.name;
        differences.push(`💾 VRAM: ${winner} has ${Math.max(vramA, vramB)}GB vs ${Math.min(vramA, vramB)}GB (${vramDiff > 8 ? 'CRITICAL difference' : 'significant difference'})`);
      }
    }
  }

  // CUDA Cores Difference
  if (!onlyUseFields || onlyUseFields.includes('cudaCores')) {
    const cudaA = parseNumberSpec(productA, ['CUDA Cores', 'Cuda Cores', 'cuda cores']);
    const cudaB = parseNumberSpec(productB, ['CUDA Cores', 'Cuda Cores', 'cuda cores']);
    if (cudaA !== null && cudaB !== null) {
      const cudaDiffPercent = Math.abs(cudaA - cudaB) / Math.max(cudaA, cudaB, 1) * 100;
      if (cudaDiffPercent >= 20) {
        const winner = cudaA > cudaB ? productA.name : productB.name;
        differences.push(`⚡ CUDA Cores: ${winner} has ${Math.round(Math.max(cudaA, cudaB))} vs ${Math.round(Math.min(cudaA, cudaB))} (+${Math.round(cudaDiffPercent)}%)`);
      }
    }
  }

  // Price Difference
  if (!onlyUseFields || onlyUseFields.includes('price')) {
    if (productA.price && productB.price) {
      const priceDiff = Math.abs(productA.price - productB.price);
      if (priceDiff >= 200) {
        const cheaper = productA.price < productB.price ? productA : productB;
        differences.push(`💰 Price: ${cheaper.name} is $${priceDiff.toLocaleString()} more affordable`);
      }
    }
  }

  // Architecture Difference
  if (!onlyUseFields || onlyUseFields.includes('architecture')) {
    const archA = parseArchitecture(productA);
    const archB = parseArchitecture(productB);
    if (archA !== null && archB !== null) {
      if (Math.abs(archA - archB) >= 2) {
        const newer = archA > archB ? productA.name : productB.name;
        differences.push(`🔧 Architecture: ${newer} has newer architecture`);
      }
    }
  }

  // Cores Difference (For NPUs/CPUs)
  if (!onlyUseFields || onlyUseFields.includes('cores')) {
    const coresA = parseNumberSpec(productA, ['Cores', 'Number of Cores', 'CPU Cores']);
    const coresB = parseNumberSpec(productB, ['Cores', 'Number of Cores', 'CPU Cores']);
    if (coresA !== null && coresB !== null) {
      const coreDiff = Math.abs(coresA - coresB);
      if (coreDiff >= 2) {
        const winner = coresA > coresB ? productA.name : productB.name;
        differences.push(`🧠 CPU Cores: ${winner} has ${Math.max(coresA, coresB)} cores vs ${Math.min(coresA, coresB)}`);
      }
    }
  }

  return differences.slice(0, 5); // Máximo 5 diferencias
}