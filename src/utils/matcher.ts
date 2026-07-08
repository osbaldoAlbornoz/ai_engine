import { HardwareProduct, hardwareData } from "@/data/hardware";

export type UseCase = "training" | "inference" | "learning" | "gaming";
export type Budget = "budget" | "mid" | "high";
export type FormFactor = "desktop" | "laptop" | "workstation" | "any";

export interface MatcherAnswers {
  useCase: UseCase;
  budget: Budget;
  formFactor: FormFactor;
}

export interface MatchResult {
  product: HardwareProduct;
  matchPercentage: number;
  matchReasons: string[];
}

/**
 * Extracts a numeric VRAM/RAM value from various Supabase and static spec field formats.
 * Handles: "24 GB GDDR6X", "16GB", "128 GB", "24", etc.
 */
function extractVRAM(product: HardwareProduct): number {
  // Keys used in Supabase GPU/workstation products
  const supabaseKeys = [
    "Graphics Card Ram",
    "Unified Memory",
    "VRAM",
    "RAM",
    "Memory",
    "Video Memory",
  ];

  // Also check static data keys
  const staticKeys = [
    "VRAM",
    "Unified Memory",
    "Memory",
  ];

  const allKeys = [...new Set([...supabaseKeys, ...staticKeys])];

  for (const key of allKeys) {
    const val = product.specs[key];
    if (val) {
      const match = val.match(/(\d+(?:\.\d+)?)/);
      if (match) return parseFloat(match[1]);
    }
  }
  return 0;
}

/**
 * Checks if a product's GPU name / coprocessor contains a known high-end GPU keyword.
 */
function isHighEndGPU(product: HardwareProduct): boolean {
  const gpuField = [
    product.name,
    product.specs["Video Processor"] || "",
    product.specs["Graphics Coprocessor"] || "",
    product.specs["GPU"] || "",
  ].join(" ").toLowerCase();

  return (
    gpuField.includes("4090") ||
    gpuField.includes("5090") ||
    gpuField.includes("4080") ||
    gpuField.includes("5080") ||
    gpuField.includes("4070 ti") ||
    gpuField.includes("5070")
  );
}

/**
 * Checks if a product is NVIDIA (for CUDA scoring).
 */
function isNvidia(product: HardwareProduct): boolean {
  const text = [
    product.brand,
    product.name,
    product.specs["Video Processor"] || "",
    product.specs["Graphics Coprocessor"] || "",
  ].join(" ").toLowerCase();
  return text.includes("nvidia") || text.includes("geforce") || text.includes("rtx") || text.includes("quadro");
}

/**
 * Returns the best match products for a given set of user answers.
 * Uses the passed `products` array (from Supabase) or falls back to static hardwareData.
 */
export function getTopMatches(
  answers: MatcherAnswers,
  products: HardwareProduct[] = hardwareData,
  limit = 2
): MatchResult[] {

  const scoredProducts = products.map(product => {
    let score = 0;
    const reasons: string[] = [];

    // ── STEP 1: EXCLUDE categories that are never "purchasable" hardware ──
    // NPUs in Supabase are standalone CPUs/processors — not something the matcher recommends.
    if (product.category === "npus") {
      return { product, score: -1, reasons };
    }

    // ── STEP 2: BUDGET HARD FILTER ──
    // Since Amazon prices fluctuate, we allow a +8% tolerance above the target
    // budget during filtering. This ensures we don't disqualify great options
    // that might have temporarily shifted slightly above the budget mark.
    let maxBudget = Infinity;
    if (answers.budget === "budget") maxBudget = 1100 * 1.08; // Allow up to ~$1,188
    if (answers.budget === "mid") maxBudget = 2600 * 1.05;    // Allow up to ~$2,730

    if (product.price <= 0) {
      return { product, score: -1, reasons };
    }

    if (product.price > maxBudget) {
      return { product, score: -1, reasons }; // Disqualified by budget
    }

    score += 20;
    if (answers.budget === "budget") {
      reasons.push(`Priced close to or under the target $1,100 budget.`);
    } else if (answers.budget === "mid") {
      reasons.push(`Fits well within the estimated $1,100–$2,600 mid-range.`);
    } else {
      reasons.push(`Premium tier — selected for absolute best performance.`);
    }

    // ── STEP 3: FORM FACTOR HARD FILTER ──
    // "desktop" = gpus only (Desktop GPU)
    // "workstation" = workstations only
    // "laptop"  = laptops only
    // "any"     = all categories pass
    if (answers.formFactor === "desktop") {
      if (product.category !== "gpus") {
        return { product, score: -1, reasons };
      }
      score += 20;
      reasons.push(`Desktop GPU for custom builds and maximum upgradeability.`);
    } else if (answers.formFactor === "workstation") {
      if (product.category !== "workstations") {
        return { product, score: -1, reasons };
      }
      score += 20;
      reasons.push(`Pre-built workstation for plug-and-play high performance.`);
    } else if (answers.formFactor === "laptop") {
      if (product.category !== "laptops") {
        return { product, score: -1, reasons };
      }
      score += 20;
      reasons.push(`Portable form factor — power you can take anywhere.`);
    } else {
      // "any" — slight bonus, no hard filter
      score += 10;
    }

    // ── STEP 4: USE CASE SCORING ──
    const vram = extractVRAM(product);
    const isGPU = product.category === "gpus";
    const isLaptop = product.category === "laptops";
    const isWorkstation = product.category === "workstations";

    switch (answers.useCase) {

      case "training":
        // Training needs maximum VRAM (>=24GB ideal) and CUDA ecosystem.
        if (vram >= 24) {
          score += 50;
          reasons.push(`${vram}GB VRAM — ideal for training and fine-tuning large models.`);
        } else if (vram >= 16) {
          score += 30;
          reasons.push(`${vram}GB VRAM — solid capacity for LoRA fine-tuning.`);
        } else if (vram > 0) {
          score += 5;
        }
        if (isNvidia(product)) {
          score += 15;
          reasons.push(`NVIDIA CUDA ecosystem for maximum AI framework compatibility.`);
        }
        if (isWorkstation) {
          score += 10;
          reasons.push(`Workstation-grade reliability for long training runs.`);
        }
        break;

      case "inference":
        // Inference needs good VRAM and fast processing. 16GB is sweet spot.
        if (vram >= 24) {
          score += 50;
          reasons.push(`${vram}GB VRAM — run the largest local LLMs at full precision.`);
        } else if (vram >= 16) {
          score += 40;
          reasons.push(`${vram}GB VRAM — sweet spot for 70B models in 4-bit quantization.`);
        } else if (vram >= 8) {
          score += 20;
          reasons.push(`${vram}GB VRAM — handles smaller local models well.`);
        }
        if (isNvidia(product)) {
          score += 10;
          reasons.push(`NVIDIA CUDA acceleration for faster inference throughput.`);
        }
        break;

      case "learning":
        // Learning favors affordability. Price under $800 gets max bonus.
        if (product.price <= 600) {
          score += 45;
          reasons.push(`Budget-friendly at $${product.price.toFixed(0)} — perfect for experimenting without risk.`);
        } else if (product.price <= 900) {
          score += 35;
          reasons.push(`Affordable at $${product.price.toFixed(0)} while offering solid AI capabilities.`);
        } else if (product.price <= 1100) {
          score += 20;
          reasons.push(`Reasonable entry price with room to grow your skills.`);
        }
        if (vram >= 8) {
          score += 20;
          reasons.push(`${vram}GB VRAM — more than enough to run modern open-source models.`);
        } else if (vram > 0) {
          score += 10;
          reasons.push(`Enough memory to run lightweight AI models and experiments.`);
        }
        break;

      case "gaming":
        // Gaming + AI: prioritize GPUs and high-refresh laptops.
        if (isGPU) {
          score += 30;
          reasons.push(`Dedicated GPU delivers maximum gaming performance.`);
        } else if (isLaptop) {
          score += 15;
        }
        if (isHighEndGPU(product)) {
          score += 25;
          reasons.push(`High-end GPU ensures top FPS in demanding titles.`);
        }
        if (isNvidia(product)) {
          score += 10;
          reasons.push(`NVIDIA DLSS boosts framerates while enabling AI features.`);
        }
        // Bonus for high refresh rate display (laptops)
        const display = (product.specs["Display"] || "").toLowerCase();
        if (display.includes("240hz") || display.includes("165hz") || display.includes("144hz")) {
          score += 15;
          reasons.push(`High refresh rate display for smooth, competitive gameplay.`);
        } else if (display.includes("120hz")) {
          score += 8;
        }
        break;
    }

    return { product, score, reasons };
  });

  // Filter out disqualified products (score = -1)
  const validProducts = scoredProducts.filter(p => p.score > 0);

  // Sort by score descending
  validProducts.sort((a, b) => b.score - a.score);

  // If no valid products after all filters, relax formFactor and retry with same budget
  if (validProducts.length === 0) {
    return [];
  }

  // Map to MatchResult with realistic percentages
  // Top pick base: 94%, second: 83%
  return validProducts.slice(0, limit).map((p, index) => {
    const basePercent = index === 0 ? 94 : 83;
    // Normalize: max realistic score is ~110 pts
    const bonusPercent = Math.min(5, Math.round(p.score / 20));
    const matchPercentage = Math.min(99, basePercent + bonusPercent);

    // Deduplicate reasons, take top 3
    const uniqueReasons = Array.from(new Set(p.reasons)).slice(0, 3);

    return {
      product: p.product,
      matchPercentage,
      matchReasons: uniqueReasons,
    };
  });
}
