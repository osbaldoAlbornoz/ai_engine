import { Product } from "@/types/product";

export const TIERS = ["S", "A", "B", "C"] as const;
export type Tier = typeof TIERS[number];

export const tierStyles: Record<Tier, { text: string; border: string; bg: string; shadow: string }> = {
  S: { text: "text-primary",    border: "border-primary",    bg: "bg-primary",    shadow: "shadow-[0_0_30px_rgba(0,229,255,0.4)]" },
  A: { text: "text-blue-400",   border: "border-blue-400",   bg: "bg-blue-400",   shadow: "shadow-[0_0_30px_rgba(96,165,250,0.4)]" },
  B: { text: "text-amber-400",  border: "border-amber-400",  bg: "bg-amber-400",  shadow: "shadow-[0_0_30px_rgba(251,191,36,0.4)]" },
  C: { text: "text-red-400",    border: "border-red-400",    bg: "bg-red-400",    shadow: "shadow-[0_0_30px_rgba(248,113,113,0.4)]" },
} as const;

/** Extracts the first number from a string. "24 GB GDDR6X" -> 24 */
function extractNumber(str: string): number {
  if (!str) return 0;
  const m = String(str).replace(/,/g, "").match(/(\d+(\.\d+)?)/);
  return m ? parseFloat(m[1]) : 0;
}

/**
 * Searches product.specs by a priority list of keys.
 * Pass 1: exact case-insensitive match.
 * Pass 2: safe partial match (only keys >= 6 chars to avoid "ram"/"gpu" being too broad).
 */
function getSpec(specs: Record<string, unknown>, keys: string[]): string {
  const lowerKeys = keys.map((k) => k.toLowerCase().trim());
  const entries = Object.entries(specs);

  // Exact match
  for (const [k, v] of entries) {
    if (lowerKeys.includes(k.toLowerCase().trim()))
      return typeof v === "object" ? JSON.stringify(v) : String(v);
  }
  // Safe partial match (long keys only)
  for (const [k, v] of entries) {
    const ck = k.toLowerCase().trim();
    for (const sk of lowerKeys) {
      if (sk.length >= 6 && ck.includes(sk))
        return typeof v === "object" ? JSON.stringify(v) : String(v);
    }
  }
  return "";
}

// ─────────────────────────────────────────────────────────────────────────────
// GPU SCORING  (max 100)
//   VRAM        0-40 pts   (8GB=13, 16GB=26, 24GB=40) - Reduced from 55%
//   Cores/TOPS  0-50 pts   (4060=22, 4080=37, 4090=37, 5090=50) - Increased from 35%
//   Arch bonus  0-10 pts   (Blackwell=10, Ada high=6, Ada mid=3)
// ─────────────────────────────────────────────────────────────────────────────
function scoreGPU(specs: Record<string, unknown>, name: string): number {
  const ln = name.toLowerCase();

  let vram = extractNumber(
    getSpec(specs, ["vram", "graphics card ram", "graphics card ram size", "video memory", "gpu memory", "graphics memory"])
  );
  if (!vram) {
    const m = name.match(/(\d+)\s*GB/i);
    if (m) vram = parseFloat(m[1]);
  }
  const vramScore = Math.min(40, Math.round(vram * 1.67)); // Reduced: 24GB=40, 16GB=27, 12GB=20, 8GB=13

  let coresScore = 0;
  const aiPerf = extractNumber(getSpec(specs, ["ai performance", "total ai tops", "ai tops", "tops"]));
  if (aiPerf) {
    coresScore = Math.min(35, Math.round(aiPerf * 0.175));
  } else {
    let cores = extractNumber(getSpec(specs, ["cuda cores", "cudacores", "stream processors", "shader processors", "compute units"]));
    if (!cores) {
      if      (ln.includes("5090"))     cores = 21760;
      else if (ln.includes("5080"))     cores = 10752;
      else if (ln.includes("5070 ti"))  cores = 9728;
      else if (ln.includes("5070"))     cores = 8192;
      else if (ln.includes("4090"))     cores = 16384;
      else if (ln.includes("4080"))     cores = 9728;
      else if (ln.includes("4070 ti"))  cores = 7680;
      else if (ln.includes("4070"))     cores = 5888;
      else if (ln.includes("4060 ti"))  cores = 4352;
      else if (ln.includes("4060"))     cores = 3072;
      else if (ln.includes("3090"))     cores = 10496;
      else if (ln.includes("7900 xtx")) cores = 6144;
      else if (ln.includes("7900 xt"))  cores = 5376;
      else if (ln.includes("rx 9060") || ln.includes("9060")) cores = 4000;
      else cores = 2000;
    }
    coresScore = Math.min(50, Math.round(cores / 328)); // Increased max to 50, better distribution
  }

  let arch = 0;
  if      (ln.match(/5090|5080|5070/))  arch = 10;
  else if (ln.match(/4090|4080|4070/))  arch = 6;
  else if (ln.match(/4060|3090/))       arch = 3;
  else if (ln.match(/7900|rx 9060/))    arch = 4;

  return Math.min(100, Math.max(0, vramScore + coresScore + arch));
}

// ─────────────────────────────────────────────────────────────────────────────
// LAPTOP SCORING  (max 100)
//   RAM         0-35 pts   log scale: 8GB=10, 16GB=17, 32GB=22, 64GB=29, 128GB=35
//   CPU tier    0-30 pts
//   GPU tier    0-25 pts
//   Storage     0-10 pts
// ─────────────────────────────────────────────────────────────────────────────
function scoreLaptop(specs: Record<string, unknown>, name: string): number {
  const ln = name.toLowerCase();

  let ram = extractNumber(getSpec(specs, ["unified memory", "memory", "ram", "system memory", "installed ram"]));
  if (!ram) {
    const m = name.match(/(\d+)\s*GB\s*(?:DDR|LPDDR|Unified|RAM|Memory)/i);
    if (m) ram = parseInt(m[1], 10);
  }
  const ramScore = Math.min(35, Math.round(Math.log2(Math.max(ram, 1)) * 5));

  const cpuRaw = (getSpec(specs, ["processor", "cpu", "processor type"]) + " " + ln).toLowerCase();
  let cpuScore = 0;
  if      (cpuRaw.match(/m4 ultra|m3 ultra/))          cpuScore = 30;
  else if (cpuRaw.match(/m4 max|m3 max/))              cpuScore = 26;
  else if (cpuRaw.match(/m4 pro|m3 pro/))              cpuScore = 22;
  else if (cpuRaw.match(/m4|m3/))                      cpuScore = 18;
  else if (cpuRaw.match(/m2 ultra/))                   cpuScore = 24;
  else if (cpuRaw.match(/m2 max/))                     cpuScore = 21;
  else if (cpuRaw.match(/m2 pro/))                     cpuScore = 18;
  else if (cpuRaw.match(/m2/))                         cpuScore = 15;
  else if (cpuRaw.match(/m1 ultra/))                   cpuScore = 20;
  else if (cpuRaw.match(/core ultra 9|i9-1[3-9]/))     cpuScore = 20;
  else if (cpuRaw.match(/core ultra 7|i7-1[3-9]/))     cpuScore = 16;
  else if (cpuRaw.match(/ryzen 9/))                    cpuScore = 18;
  else if (cpuRaw.match(/ryzen 7/))                    cpuScore = 14;
  else if (cpuRaw.match(/i5-1[3-9]|core ultra 5/))     cpuScore = 10;
  else                                                  cpuScore = 8;

  const gpuRaw = (getSpec(specs, ["gpu", "graphics", "graphics card", "discrete graphics"]) + " " + ln).toLowerCase();
  let gpuScore = 0;
  if      (gpuRaw.match(/5090|5080/))          gpuScore = 25;
  else if (gpuRaw.match(/5070|4090/))          gpuScore = 22;
  else if (gpuRaw.match(/4080|4070 ti/))       gpuScore = 18;
  else if (gpuRaw.match(/4070/))               gpuScore = 14;
  else if (gpuRaw.match(/4060|3080/))          gpuScore = 10;
  else if (gpuRaw.match(/4050|3070/))          gpuScore = 8;
  else if (gpuRaw.match(/integrated|iris|radeon graphics/)) gpuScore = 2;
  else                                          gpuScore = 5;

  const storeRaw = (getSpec(specs, ["storage", "ssd", "hard drive", "hard disk"]) + " " + ln).toLowerCase();
  let storageBonus = 0;
  if      (storeRaw.match(/[24]\s*tb/))    storageBonus = 10;
  else if (storeRaw.match(/1\s*tb/))       storageBonus = 7;
  else if (storeRaw.match(/512\s*gb/))     storageBonus = 4;
  else if (storeRaw.match(/256\s*gb/))     storageBonus = 2;

  return Math.min(100, Math.max(0, ramScore + cpuScore + gpuScore + storageBonus));
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKSTATION SCORING  (max 100)
// Uses actual Amazon-scraped DB keys:
//   RAM:  "RAM Memory Installed"       0-40 pts (log scale)
//   GPU:  "Graphics Coprocessor"       0-35 pts
//   CPU:  "Processor Series" / name    0-25 pts
// ─────────────────────────────────────────────────────────────────────────────
function scoreWorkstation(specs: Record<string, unknown>, name: string): number {
  const ln = name.toLowerCase();

  // RAM — actual Amazon key is "RAM Memory Installed"
  let ram = extractNumber(getSpec(specs, [
    "ram memory installed", "ram memory installed size",
    "memory", "ram", "installed memory", "system memory",
  ]));
  if (!ram) {
    const m = name.match(/(\d+)\s*GB\s*(?:DDR|RAM|SDRAM|ECC)?/i);
    if (m) ram = parseInt(m[1], 10);
  }
  // 32GB=28, 64GB=33, 128GB=38, 256GB=40
  const ramScore = Math.min(40, Math.round(Math.log2(Math.max(ram, 1)) * 5.5));

  // GPU — Amazon uses "Graphics Coprocessor" for the GPU model name
  const gpuRaw = (
    getSpec(specs, ["graphics coprocessor", "graphics card", "video processor", "gpu", "graphics"]) +
    " " + ln
  ).toLowerCase();
  let gpuScore = 0;
  if      (gpuRaw.match(/rtx 6000 ada|rtx 5090/))        gpuScore = 35;
  else if (gpuRaw.match(/rtx 5000|rtx 5080/))            gpuScore = 30;
  else if (gpuRaw.match(/rtx 4000 ada|rtx 4090|a6000/))  gpuScore = 26;
  else if (gpuRaw.match(/rtx 4080|rtx 3000 ada|a5000/))  gpuScore = 22;
  else if (gpuRaw.match(/rtx 4070|rtx 2000 ada|a4000/))  gpuScore = 18;
  else if (gpuRaw.match(/rtx 4060|t1000|t600|a2000/))    gpuScore = 13;
  else if (gpuRaw.match(/t400|p1000|p620|quadro p/))     gpuScore = 8;
  else if (gpuRaw.match(/integrated|iris|onboard/))      gpuScore = 3;
  else                                                     gpuScore = 8;

  // CPU — "Processor Series" has the full model (e.g. "Ryzen Threadripper PRO 7955WX")
  const cpuRaw = (
    getSpec(specs, ["processor series", "processor", "cpu", "processor type"]) +
    " " + ln
  ).toLowerCase();
  let cpuScore = 0;
  if      (cpuRaw.match(/threadripper pro 7[0-9]{3}|threadripper pro 59[0-9]{2}/)) cpuScore = 25;
  else if (cpuRaw.match(/threadripper pro 3[0-9]{3}|xeon w9/))                    cpuScore = 22;
  else if (cpuRaw.match(/threadripper [0-9]+|xeon w7/))                            cpuScore = 20;
  else if (cpuRaw.match(/i9-1[3-9]|core ultra 9|ryzen 9 [79]/))                   cpuScore = 18;
  else if (cpuRaw.match(/i7-1[3-9]|core ultra 7|ryzen 9 [35]/))                   cpuScore = 14;
  else if (cpuRaw.match(/ryzen 7|i7-1[0-2]/))                                      cpuScore = 10;
  else                                                                               cpuScore = 7;

  return Math.min(100, Math.max(0, ramScore + gpuScore + cpuScore));
}

// ─────────────────────────────────────────────────────────────────────────────
// NPU / CPU SCORING  (max 100)
// The 'npus' category in the DB contains desktop CPUs (Ryzen, Xeon, etc.)
// Scores TOPS if available, otherwise falls back to CPU specs.
//   Model tier   0-30 pts  (X3D / flagship bonus)
//   Core count   0-30 pts
//   Clock speed  0-20 pts
//   Cache size   0-20 pts
// ─────────────────────────────────────────────────────────────────────────────
function scoreNPU(specs: Record<string, unknown>, name: string): number {
  const ln = name.toLowerCase();

  // Primary: try TOPS (real NPU chips)
  let tops = extractNumber(
    getSpec(specs, ["total ai tops", "ai performance", "ai tops", "tops", "nnops", "neural processing"])
  );
  if (!tops) {
    const m = name.match(/(\d+)\s*tops/i);
    if (m) tops = parseFloat(m[1]);
  }
  if (tops > 0) {
    let arch = 0;
    if      (ln.match(/gaudi ?3|trainium ?2/))        arch = 25;
    else if (ln.match(/gaudi ?2|trainium/))            arch = 20;
    else if (ln.match(/neural engine|apple m[34]/))    arch = 18;
    else if (ln.match(/snapdragon x elite/))           arch = 15;
    else if (ln.match(/snapdragon x plus/))            arch = 12;
    else if (ln.match(/intel core ultra|meteor lake/)) arch = 10;
    else if (ln.match(/ryzen ai/))                     arch = 10;
    else                                                arch = 5;
    return Math.min(100, Math.max(0,
      Math.min(75, Math.round((Math.log(tops + 1) / Math.log(700)) * 75)) + arch
    ));
  }

  // Fallback: score as CPU using actual specs from DB
  const cores   = extractNumber(getSpec(specs, ["processor core count", "processor count"]));
  const threads = extractNumber(getSpec(specs, ["processor number of concurrent threads"]));
  const ghz     = extractNumber(getSpec(specs, ["processor speed"]));
  const cacheMb = extractNumber(getSpec(specs, ["cache memory installed size", "secondary cache"]));

  // Core score: 4c=15, 8c=22, 16c=27, 24c=30
  const effectiveCores = cores || Math.max(threads / 2, 1);
  const coreScore  = Math.min(30, Math.round(Math.log2(Math.max(effectiveCores, 1)) * 7));
  // Clock score: 3.5GHz=13, 4.7GHz=17, 5.5GHz=20
  const clockScore = Math.min(20, Math.round((ghz / 5.5) * 20));
  // Cache score: 32MB=10, 64MB=15, 104MB=20 (9800X3D has 104MB!)
  const cacheScore = Math.min(20, Math.round(Math.log2(Math.max(cacheMb || 8, 1)) * 3.3));

  // Model tier bonus (0-30)
  let tierBonus = 0;
  if      (ln.match(/x3d/))                                    tierBonus = 30;
  else if (ln.match(/ryzen 9 9\d{3}|ryzen 9 7\d{3}/))         tierBonus = 22;
  else if (ln.match(/ryzen 9 5\d{3}|ryzen 9 3\d{3}/))         tierBonus = 18;
  else if (ln.match(/core ultra 9|i9-1[3-9]|xeon w9/))        tierBonus = 24;
  else if (ln.match(/core ultra 7|i7-1[3-9]|xeon w7/))        tierBonus = 18;
  else if (ln.match(/ryzen 7 [79]\d{3}/))                      tierBonus = 16;
  else if (ln.match(/ryzen 7 5\d{3}/))                         tierBonus = 12;
  else if (ln.match(/ryzen 5|i5-1[3-9]|core ultra 5/))        tierBonus = 8;
  else                                                          tierBonus = 5;

  return Math.min(100, Math.max(0, tierBonus + coreScore + clockScore + cacheScore));
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

/** Calculates an AI performance score (0-100) based on category and specs. */
export function calculateAIScore(product: Product | any): number {
  const specs: Record<string, unknown> =
    typeof product.specs === "object" && product.specs !== null
      ? (product.specs as Record<string, unknown>)
      : {};
  const category = (product.category || "").toLowerCase();
  const name = product.name || product.title || "";

  if (category === "gpu"  || category === "gpus")         return scoreGPU(specs, name);
  if (category === "laptop"    || category === "laptops")      return scoreLaptop(specs, name);
  if (category === "workstation" || category === "workstations") return scoreWorkstation(specs, name);
  if (category === "npu"  || category === "npus")         return scoreNPU(specs, name);

  return 0;
}

/** Assigns a Tier label based on AI score. */
export function assignTier(score: number): Tier {
  if (score >= 80) return "S";  // Top tier: 80+ (was 90)
  if (score >= 65) return "A";  // High tier: 65-79 (was 75)
  if (score >= 45) return "B";  // Mid tier: 45-64 (was 55)
  return "C";                   // Entry tier: <45 (was <55)
}

/** Calculates a value-for-money rating based on AI score and price. */
export function calculateValueRating(
  score: number,
  price: number
): { label: string; color: string; border: string; bg: string } {
  if (price <= 0 || score <= 0)
    return { label: "N/A", color: "text-zinc-500", border: "border-zinc-500/30", bg: "bg-zinc-500/10" };

  const ratio = (score / price) * 100; // score points per $100

  if (ratio >= 15) return { label: "Excellent Value", color: "text-emerald-400", border: "border-emerald-400/30", bg: "bg-emerald-400/10" };
  if (ratio >= 10) return { label: "Great Value",     color: "text-blue-400",    border: "border-blue-400/30",    bg: "bg-blue-400/10" };
  if (ratio >= 5)  return { label: "Fair Value",      color: "text-amber-400",   border: "border-amber-400/30",   bg: "bg-amber-400/10" };
  return               { label: "Premium Choice",     color: "text-purple-400",  border: "border-purple-400/30",  bg: "bg-purple-400/10" };
}

/**
 * Returns a breakdown of score components by category.
 * Used for the tooltip/modal showing how the score was calculated.
 */
export interface ScoreBreakdown {
  total: number;
  tier: Tier;
  components: Record<string, { score: number; max: number; percentage: number }>;
}

export function getScoreBreakdown(product: Product | any): ScoreBreakdown {
  const specs: Record<string, unknown> =
    typeof product.specs === "object" && product.specs !== null
      ? (product.specs as Record<string, unknown>)
      : {};
  const category = (product.category || "").toLowerCase();
  const name = product.name || product.title || "";
  const price = product.price || 0;

  const breakdown: ScoreBreakdown = {
    total: 0,
    tier: "C",
    components: {}
  };

  if (category === "gpu" || category === "gpus") {
    const ln = name.toLowerCase();
    const vram = extractNumber(getSpec(specs, ["vram", "graphics card ram", "graphics card ram size", "video memory", "gpu memory", "graphics memory"])) || 
                 (name.match(/(\d+)\s*GB/i) ? parseFloat(name.match(/(\d+)\s*GB/i)![1]) : 0);
    const vramScore = Math.min(40, Math.round(vram * 1.67));
    
    let cores = extractNumber(getSpec(specs, ["cuda cores", "cudacores", "stream processors", "shader processors", "compute units"]));
    if (!cores) {
      if      (ln.includes("5090"))     cores = 21760;
      else if (ln.includes("5080"))     cores = 10752;
      else if (ln.includes("5070 ti"))  cores = 9728;
      else if (ln.includes("5070"))     cores = 8192;
      else if (ln.includes("4090"))     cores = 16384;
      else if (ln.includes("4080"))     cores = 9728;
      else if (ln.includes("4070 ti"))  cores = 7680;
      else if (ln.includes("4070"))     cores = 5888;
      else if (ln.includes("4060 ti"))  cores = 4352;
      else if (ln.includes("4060"))     cores = 3072;
      else if (ln.includes("3090"))     cores = 10496;
      else if (ln.includes("7900 xtx")) cores = 6144;
      else if (ln.includes("7900 xt"))  cores = 5376;
      else if (ln.includes("rx 9060") || ln.includes("9060")) cores = 4000;
      else cores = 2000;
    }
    const coresScore = Math.min(50, Math.round(cores / 328));
    
    let arch = 0;
    if      (ln.match(/5090|5080|5070/))  arch = 10;
    else if (ln.match(/4090|4080|4070/))  arch = 6;
    else if (ln.match(/4060|3090/))       arch = 3;
    else if (ln.match(/7900|rx 9060/))    arch = 4;

    breakdown.total = Math.min(100, Math.max(0, vramScore + coresScore + arch));
    breakdown.components = {
      "VRAM": { score: vramScore, max: 40, percentage: Math.round((vramScore / 40) * 100) },
      "CUDA Cores / Stream Processors": { score: coresScore, max: 50, percentage: Math.round((coresScore / 50) * 100) },
      "Architecture Bonus": { score: arch, max: 10, percentage: Math.round((arch / 10) * 100) }
    };
  } else if (category === "laptop" || category === "laptops") {
    const ln = name.toLowerCase();
    let ram = extractNumber(getSpec(specs, ["unified memory", "memory", "ram", "system memory", "installed ram"])) ||
              (name.match(/(\d+)\s*GB\s*(?:DDR|LPDDR|Unified|RAM|Memory)/i) ? parseInt(name.match(/(\d+)\s*GB\s*(?:DDR|LPDDR|Unified|RAM|Memory)/i)![1], 10) : 0);
    const ramScore = Math.min(35, Math.round(Math.log2(Math.max(ram, 1)) * 5));
    
    const cpuRaw = (getSpec(specs, ["processor", "cpu", "processor type"]) + " " + ln).toLowerCase();
    let cpuScore = 0;
    if      (cpuRaw.match(/m4 ultra|m3 ultra/))          cpuScore = 30;
    else if (cpuRaw.match(/m4 max|m3 max/))              cpuScore = 26;
    else if (cpuRaw.match(/m4 pro|m3 pro/))              cpuScore = 22;
    else if (cpuRaw.match(/m4|m3/))                      cpuScore = 18;
    else if (cpuRaw.match(/m2 ultra/))                   cpuScore = 24;
    else if (cpuRaw.match(/m2 max/))                     cpuScore = 21;
    else if (cpuRaw.match(/m2 pro/))                     cpuScore = 18;
    else if (cpuRaw.match(/m2/))                         cpuScore = 15;
    else if (cpuRaw.match(/m1 ultra/))                   cpuScore = 20;
    else if (cpuRaw.match(/core ultra 9|i9-1[3-9]/))     cpuScore = 20;
    else if (cpuRaw.match(/core ultra 7|i7-1[3-9]/))     cpuScore = 16;
    else if (cpuRaw.match(/ryzen 9/))                    cpuScore = 18;
    else if (cpuRaw.match(/ryzen 7/))                    cpuScore = 14;
    else if (cpuRaw.match(/i5-1[3-9]|core ultra 5/))     cpuScore = 10;
    else                                                  cpuScore = 8;
    
    const gpuRaw = (getSpec(specs, ["gpu", "graphics", "graphics card", "discrete graphics"]) + " " + ln).toLowerCase();
    let gpuScore = 0;
    if      (gpuRaw.match(/5090|5080/))          gpuScore = 25;
    else if (gpuRaw.match(/5070|4090/))          gpuScore = 22;
    else if (gpuRaw.match(/4080|4070 ti/))       gpuScore = 18;
    else if (gpuRaw.match(/4070/))               gpuScore = 14;
    else if (gpuRaw.match(/4060|3080/))          gpuScore = 10;
    else if (gpuRaw.match(/4050|3070/))          gpuScore = 8;
    else if (gpuRaw.match(/integrated|iris|radeon graphics/)) gpuScore = 2;
    else                                          gpuScore = 5;
    
    const storeRaw = (getSpec(specs, ["storage", "ssd", "hard drive", "hard disk"]) + " " + ln).toLowerCase();
    let storageBonus = 0;
    if      (storeRaw.match(/[24]\s*tb/))    storageBonus = 10;
    else if (storeRaw.match(/1\s*tb/))       storageBonus = 7;
    else if (storeRaw.match(/512\s*gb/))     storageBonus = 4;
    else if (storeRaw.match(/256\s*gb/))     storageBonus = 2;

    breakdown.total = Math.min(100, Math.max(0, ramScore + cpuScore + gpuScore + storageBonus));
    breakdown.components = {
      "RAM": { score: ramScore, max: 35, percentage: Math.round((ramScore / 35) * 100) },
      "CPU Tier": { score: cpuScore, max: 30, percentage: Math.round((cpuScore / 30) * 100) },
      "GPU Tier": { score: gpuScore, max: 25, percentage: Math.round((gpuScore / 25) * 100) },
      "Storage": { score: storageBonus, max: 10, percentage: Math.round((storageBonus / 10) * 100) }
    };
  } else if (category === "workstation" || category === "workstations") {
    const ln = name.toLowerCase();
    let ram = extractNumber(getSpec(specs, ["ram memory installed", "ram memory installed size", "memory", "ram", "installed memory", "system memory"])) ||
              (name.match(/(\d+)\s*GB\s*(?:DDR|RAM|SDRAM|ECC)?/i) ? parseInt(name.match(/(\d+)\s*GB\s*(?:DDR|RAM|SDRAM|ECC)?/i)![1], 10) : 0);
    const ramScore = Math.min(40, Math.round(Math.log2(Math.max(ram, 1)) * 5.5));
    
    const gpuRaw = (getSpec(specs, ["graphics coprocessor", "graphics card", "video processor", "gpu", "graphics"]) + " " + ln).toLowerCase();
    let gpuScore = 0;
    if      (gpuRaw.match(/rtx 6000 ada|rtx 5090/))        gpuScore = 35;
    else if (gpuRaw.match(/rtx 5000|rtx 5080/))            gpuScore = 30;
    else if (gpuRaw.match(/rtx 4000 ada|rtx 4090|a6000/))  gpuScore = 26;
    else if (gpuRaw.match(/rtx 4080|rtx 3000 ada|a5000/))  gpuScore = 22;
    else if (gpuRaw.match(/rtx 4070|rtx 2000 ada|a4000/))  gpuScore = 18;
    else if (gpuRaw.match(/rtx 4060|t1000|t600|a2000/))    gpuScore = 13;
    else if (gpuRaw.match(/t400|p1000|p620|quadro p/))     gpuScore = 8;
    else if (gpuRaw.match(/integrated|iris|onboard/))      gpuScore = 3;
    else                                                     gpuScore = 8;
    
    const cpuRaw = (getSpec(specs, ["processor series", "processor", "cpu", "processor type"]) + " " + ln).toLowerCase();
    let cpuScore = 0;
    if      (cpuRaw.match(/threadripper pro 7[0-9]{3}|threadripper pro 59[0-9]{2}/)) cpuScore = 25;
    else if (cpuRaw.match(/threadripper pro 3[0-9]{3}|xeon w9/))                    cpuScore = 22;
    else if (cpuRaw.match(/threadripper [0-9]+|xeon w7/))                            cpuScore = 20;
    else if (cpuRaw.match(/i9-1[3-9]|core ultra 9|ryzen 9 [79]/))                   cpuScore = 18;
    else if (cpuRaw.match(/i7-1[3-9]|core ultra 7|ryzen 9 [35]/))                   cpuScore = 14;
    else if (cpuRaw.match(/ryzen 7|i7-1[0-2]/))                                      cpuScore = 10;
    else                                                                               cpuScore = 7;

    breakdown.total = Math.min(100, Math.max(0, ramScore + gpuScore + cpuScore));
    breakdown.components = {
      "RAM": { score: ramScore, max: 40, percentage: Math.round((ramScore / 40) * 100) },
      "GPU": { score: gpuScore, max: 35, percentage: Math.round((gpuScore / 35) * 100) },
      "CPU": { score: cpuScore, max: 25, percentage: Math.round((cpuScore / 25) * 100) }
    };
  } else if (category === "npu" || category === "npus") {
    const ln = name.toLowerCase();
    let tops = extractNumber(getSpec(specs, ["total ai tops", "ai performance", "ai tops", "tops", "nnops", "neural processing"])) ||
               (name.match(/(\d+)\s*tops/i) ? parseFloat(name.match(/(\d+)\s*tops/i)![1]) : 0);
    
    if (tops > 0) {
      let arch = 0;
      if      (ln.match(/gaudi ?3|trainium ?2/))        arch = 25;
      else if (ln.match(/gaudi ?2|trainium/))            arch = 20;
      else if (ln.match(/neural engine|apple m[34]/))    arch = 18;
      else if (ln.match(/snapdragon x elite/))           arch = 15;
      else if (ln.match(/snapdragon x plus/))            arch = 12;
      else if (ln.match(/intel core ultra|meteor lake/)) arch = 10;
      else if (ln.match(/ryzen ai/))                     arch = 10;
      else                                                arch = 5;
      
      const topsScore = Math.min(75, Math.round((Math.log(tops + 1) / Math.log(700)) * 75));
      breakdown.total = Math.min(100, Math.max(0, topsScore + arch));
      breakdown.components = {
        "AI TOPS": { score: topsScore, max: 75, percentage: Math.round((topsScore / 75) * 100) },
        "Architecture Bonus": { score: arch, max: 25, percentage: Math.round((arch / 25) * 100) }
      };
    } else {
      const cores = extractNumber(getSpec(specs, ["processor core count", "processor count"]));
      const threads = extractNumber(getSpec(specs, ["processor number of concurrent threads"]));
      const ghz = extractNumber(getSpec(specs, ["processor speed"]));
      const cacheMb = extractNumber(getSpec(specs, ["cache memory installed size", "secondary cache"]));
      
      const effectiveCores = cores || Math.max(threads / 2, 1);
      const coreScore = Math.min(30, Math.round(Math.log2(Math.max(effectiveCores, 1)) * 7));
      const clockScore = Math.min(20, Math.round((ghz / 5.5) * 20));
      const cacheScore = Math.min(20, Math.round(Math.log2(Math.max(cacheMb || 8, 1)) * 3.3));
      
      let tierBonus = 0;
      if      (ln.match(/x3d/))                                    tierBonus = 30;
      else if (ln.match(/ryzen 9 9\d{3}|ryzen 9 7\d{3}/))         tierBonus = 22;
      else if (ln.match(/ryzen 9 5\d{3}|ryzen 9 3\d{3}/))         tierBonus = 18;
      else if (ln.match(/core ultra 9|i9-1[3-9]|xeon w9/))        tierBonus = 24;
      else if (ln.match(/core ultra 7|i7-1[3-9]|xeon w7/))        tierBonus = 18;
      else if (ln.match(/ryzen 7 [79]\d{3}/))                      tierBonus = 16;
      else if (ln.match(/ryzen 7 5\d{3}/))                         tierBonus = 12;
      else if (ln.match(/ryzen 5|i5-1[3-9]|core ultra 5/))        tierBonus = 8;
      else                                                          tierBonus = 5;

      breakdown.total = Math.min(100, Math.max(0, tierBonus + coreScore + clockScore + cacheScore));
      breakdown.components = {
        "Model Tier Bonus": { score: tierBonus, max: 30, percentage: Math.round((tierBonus / 30) * 100) },
        "Core Count": { score: coreScore, max: 30, percentage: Math.round((coreScore / 30) * 100) },
        "Clock Speed": { score: clockScore, max: 20, percentage: Math.round((clockScore / 20) * 100) },
        "Cache Size": { score: cacheScore, max: 20, percentage: Math.round((cacheScore / 20) * 100) }
      };
    }
  }

  breakdown.tier = assignTier(breakdown.total);
  return breakdown;
}
