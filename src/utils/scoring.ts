import { Product } from "@/types/product";

export const TIERS = ["S", "A", "B", "C"] as const;
export type Tier = typeof TIERS[number];

export const tierStyles: Record<Tier, { text: string; border: string; bg: string; shadow: string }> = {
  S: { text: "text-primary",    border: "border-primary",    bg: "bg-primary",    shadow: "shadow-[0_0_30px_rgba(0,229,255,0.4)]" },
  A: { text: "text-blue-400",   border: "border-blue-400",   bg: "bg-blue-400",   shadow: "shadow-[0_0_30px_rgba(96,165,250,0.4)]" },
  B: { text: "text-amber-400",  border: "border-amber-400",  bg: "bg-amber-400",  shadow: "shadow-[0_0_30px_rgba(251,191,36,0.4)]" },
  C: { text: "text-red-400",    border: "border-red-400",    bg: "bg-red-400",    shadow: "shadow-[0_0_30px_rgba(248,113,113,0.4)]" },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// SHARED HELPERS
// ─────────────────────────────────────────────────────────────────────────────

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

  for (const [k, v] of entries) {
    if (lowerKeys.includes(k.toLowerCase().trim()))
      return typeof v === "object" ? JSON.stringify(v) : String(v);
  }
  for (const [k, v] of entries) {
    const ck = k.toLowerCase().trim();
    for (const sk of lowerKeys) {
      if (sk.length >= 6 && ck.includes(sk))
        return typeof v === "object" ? JSON.stringify(v) : String(v);
    }
  }
  return "";
}

/** Joins all spec values into one searchable string (lowercase). */
function getAllSpecText(specs: Record<string, unknown>): string {
  return Object.values(specs)
    .map((v) => (typeof v === "object" ? JSON.stringify(v) : String(v)))
    .join(" ")
    .toLowerCase();
}

/**
 * Extracts storage in GB from a spec string.
 * Handles "2 TB" -> 2000, "512 GB" -> 512, etc.
 */
function extractStorageGB(raw: string): number {
  if (!raw) return 0;
  const tbMatch = raw.match(/(\d+(?:\.\d+)?)\s*tb/i);
  if (tbMatch) return parseFloat(tbMatch[1]) * 1000;
  const gbMatch = raw.match(/(\d+(?:\.\d+)?)\s*gb/i);
  if (gbMatch) return parseFloat(gbMatch[1]);
  return extractNumber(raw);
}

// ─────────────────────────────────────────────────────────────────────────────
// GPU COMPUTE SCORE  (name-based, max 30 pts)
// This is used for dedicated GPU categories where Amazon does not publish
// CUDA core counts. The product name is the only available source for this info.
// VRAM (from the DB) is the primary signal (70%). This is only 30%.
// ─────────────────────────────────────────────────────────────────────────────
function getGPUComputeScore(name: string): number {
  const ln = name.toLowerCase();

  // NVIDIA Professional / Blackwell
  if (ln.match(/rtx\s*pro\s*6000\s*blackwell/))       return 30;
  // NVIDIA RTX 50 series (Blackwell consumer)
  if (ln.match(/\b5090\b/))                            return 30;
  if (ln.match(/\b5080\b/))                            return 26;
  if (ln.match(/\b5070\s*ti\b/))                       return 23;
  if (ln.match(/\b5070\b/))                            return 21;
  if (ln.match(/\b5060\s*ti\b/))                       return 18;
  if (ln.match(/\b5060\b/))                            return 15;
  // NVIDIA RTX 40 series (Ada Lovelace)
  if (ln.match(/\b4090\b/))                            return 27;
  if (ln.match(/\b4080\s*super\b/))                    return 24;
  if (ln.match(/\b4080\b/))                            return 23;
  if (ln.match(/\b4070\s*ti\s*super\b/))              return 22;
  if (ln.match(/\b4070\s*ti\b/))                       return 21;
  if (ln.match(/\b4070\s*super\b/))                    return 20;
  if (ln.match(/\b4070\b/))                            return 18;
  if (ln.match(/\b4060\s*ti\b/))                       return 15;
  if (ln.match(/\b4060\b/))                            return 12;
  // NVIDIA RTX 30 series (Ampere)
  if (ln.match(/\b3090\s*ti\b/))                       return 22;
  if (ln.match(/\b3090\b/))                            return 21;
  if (ln.match(/\b3080\s*ti\b/))                       return 19;
  if (ln.match(/\b3080\b/))                            return 17;
  if (ln.match(/\b3070\s*ti\b/))                       return 15;
  if (ln.match(/\b3070\b/))                            return 14;
  if (ln.match(/\b3060\s*ti\b/))                       return 13;
  if (ln.match(/\b3060\b/))                            return 11;
  if (ln.match(/\b3050\b/))                            return 8;
  // NVIDIA Professional (Ada)
  if (ln.match(/rtx\s*6000\s*ada/))                   return 29;
  if (ln.match(/rtx\s*5000\s*ada/))                   return 25;
  if (ln.match(/rtx\s*4000\s*ada/))                   return 21;
  if (ln.match(/rtx\s*3000\s*ada/))                   return 17;
  if (ln.match(/rtx\s*2000\s*ada/))                   return 14;
  // AMD RDNA 4 (RX 9000)
  if (ln.match(/\b9070\s*xt\b/))                       return 23;
  if (ln.match(/\b9070\b/))                            return 20;
  if (ln.match(/\b9060\s*xt\b/))                       return 16;
  if (ln.match(/\b9060\b/))                            return 13;
  // AMD RDNA 3 (RX 7000)
  if (ln.match(/\b7900\s*xtx\b/))                      return 22;
  if (ln.match(/\b7900\s*xt\b/))                       return 19;
  if (ln.match(/\b7900\s*gre\b/))                      return 17;
  if (ln.match(/\b7800\s*xt\b/))                       return 15;
  if (ln.match(/\b7700\s*xt\b/))                       return 12;
  if (ln.match(/\b7600\b/))                            return 10;
  // Unknown but recognized as a GPU
  return 5;
}

// ─────────────────────────────────────────────────────────────────────────────
// GPU SCORING  (max 100)
//   VRAM     0-70 pts  — from DB field, log scale (primary signal, 100% available)
//   Compute  0-30 pts  — from product name (only available source; Amazon doesn't
//                         publish CUDA/Stream core counts in any spec field)
// ─────────────────────────────────────────────────────────────────────────────
function scoreGPU(specs: Record<string, unknown>, name: string): number {
  // VRAM — primary signal (70% of score)
  let vram = extractNumber(
    getSpec(specs, ["vram", "graphics card ram", "graphics card ram size", "video memory", "gpu memory", "graphics memory"])
  );
  if (!vram) {
    // Last-resort fallback: first "N GB" in name (some products encode it there)
    const m = name.match(/(\d+)\s*GB/i);
    if (m) vram = parseFloat(m[1]);
  }
  // log2 scale: 4GB=28, 8GB=42, 12GB=49, 16GB=56, 24GB=64, 32GB=70, 48GB→70 (capped)
  const vramScore = Math.min(70, Math.round(Math.log2(Math.max(vram, 1)) * 14));

  // Compute — name-based (30% of score)
  const computeScore = getGPUComputeScore(name);

  return Math.min(100, Math.max(0, vramScore + computeScore));
}

// ─────────────────────────────────────────────────────────────────────────────
// LAPTOP SCORING  (max 100)
//   RAM       0-35 pts  — from DB "RAM Memory Installed" / "Unified Memory" (log scale)
//   CPU       0-30 pts  — CPU Core Count + Processor Speed (spec-driven)
//   GPU       0-25 pts  — Discrete VRAM (spec) > Unified memory × 0.5 > Integrated cores
//   Storage   0-10 pts  — from DB "Hard-Drive Size" (numeric GB/TB)
// ─────────────────────────────────────────────────────────────────────────────
function scoreLaptop(specs: Record<string, unknown>, name: string): number {
  const allText = getAllSpecText(specs) + " " + name.toLowerCase();

  // === RAM / Unified Memory (max 35 pts) ===
  let ram = extractNumber(
    getSpec(specs, ["ram memory installed", "unified memory", "memory", "ram memory installed size", "system memory", "installed ram"])
  );
  if (!ram) {
    const m = name.match(/(\d+)\s*GB\s*(?:DDR|LPDDR|Unified|RAM|Memory)/i);
    if (m) ram = parseInt(m[1], 10);
  }
  // log2 scale: 8GB=15, 16GB=20, 32GB=25, 64GB=30, 128GB=35
  const ramScore = Math.min(35, Math.round(Math.log2(Math.max(ram, 1)) * 5));

  // === CPU (max 30 pts) ===
  // Core count from spec
  let cores = extractNumber(
    getSpec(specs, ["processor core count", "number of cpu cores"])
  );
  if (!cores || cores <= 1) {
    const procCount = extractNumber(getSpec(specs, ["processor count"]));
    if (procCount > 1) cores = procCount;
  }
  // Fallback: "XX-core CPU" pattern in any spec text (works for Apple "Other Special Features")
  if (!cores || cores <= 1) {
    const m = allText.match(/(\d+)\s*-?\s*core\s+cpu/i);
    if (m) cores = parseInt(m[1], 10);
  }
  // GHz from spec
  let ghz = extractNumber(
    getSpec(specs, ["processor speed", "maximum clockspeed", "cpu model speed maximum"])
  );
  // Apple M-series chips do not publish GHz in Amazon specs.
  // Use a conservative 3.5 GHz equivalent so they still get a CPU score.
  if (!ghz && cores > 0) ghz = 3.5;

  // Core score: log2 scale (max 18 pts) — 4c=8, 8c=12, 12c=14.5, 16c=16, 18c=16.7, 24c=18.5→18
  const coreScore = Math.min(18, Math.round(Math.log2(Math.max(cores, 1)) * 4));
  // GHz score: linear scale (max 12 pts) — 3.2GHz=7, 4.0GHz=8.7, 5.0GHz=10.9, 5.5GHz=12
  const ghzScore  = Math.min(12, Math.round((ghz / 5.5) * 12));
  const cpuScore  = Math.min(30, coreScore + ghzScore);

  // === GPU (max 25 pts) ===
  // Priority 1: Discrete VRAM (gaming laptops with NVIDIA/AMD GPU)
  let vram = extractNumber(
    getSpec(specs, ["vram", "graphics card ram", "graphics card ram size", "video memory", "gpu memory"])
  );

  let gpuScore = 0;
  if (vram > 0) {
    // Discrete GPU — score on VRAM: 4GB=8, 6GB=10, 8GB=12, 12GB=14, 16GB=16 pts
    gpuScore = Math.min(25, Math.round(Math.log2(Math.max(vram, 1)) * 4));
  } else {
    // Priority 2: Unified Memory (Apple M-series)
    // Unified memory is accessible to both CPU and GPU, applying a 50% efficiency discount
    // vs dedicated VRAM. This is generous for Apple but reflects their real AI inference advantage.
    // Example: 128GB unified → 64GB effective → score=24. Much better than 16GB VRAM laptop=16.
    if (ram > 0) {
      const effectiveVRAM = ram * 0.5;
      gpuScore = Math.min(25, Math.round(Math.log2(Math.max(effectiveVRAM, 1)) * 4));
    } else {
      // Priority 3: Extract integrated GPU core count from spec text
      // (e.g. "Apple M5 Max 40-Core GPU" → 40 cores)
      const gpuText =
        getSpec(specs, ["graphics coprocessor", "graphics description", "other special features of the product"]) +
        " " + allText;
      const coresMatch = gpuText.match(/(\d+)\s*-?\s*core\s+gpu/i);
      if (coresMatch) {
        const gpuCores = parseInt(coresMatch[1], 10);
        // Integrated GPU core scale: 8-core=8, 16-core=10, 32-core=13, 40-core=14, 128-core=18 pts max
        gpuScore = Math.min(18, Math.round(Math.log2(Math.max(gpuCores, 1)) * 2.5));
      }
    }
  }

  // === Storage (max 10 pts) ===
  const storeRaw =
    getSpec(specs, ["hard-drive size", "hard disk", "hard disk description", "storage", "ssd"]) +
    " " + allText;
  const storageGB = extractStorageGB(storeRaw);
  let storageBonus = 0;
  if      (storageGB >= 2000) storageBonus = 10;  // 2TB+
  else if (storageGB >= 1000) storageBonus = 7;   // 1TB
  else if (storageGB >= 512)  storageBonus = 4;   // 512GB
  else if (storageGB >= 256)  storageBonus = 2;   // 256GB

  return Math.min(100, Math.max(0, ramScore + cpuScore + gpuScore + storageBonus));
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKSTATION SCORING  (max 100)
//   WITH dedicated GPU:  RAM (35) + GPU VRAM (40) + CPU (25)
//   WITHOUT dedicated GPU (mini PC / integrated): RAM (55) + CPU (45)
//   Detection: if no VRAM in specs → integrated mode
// ─────────────────────────────────────────────────────────────────────────────
function scoreWorkstation(specs: Record<string, unknown>, name: string): number {
  const allText = getAllSpecText(specs) + " " + name.toLowerCase();

  // RAM — from DB field (workstations use "RAM Memory Installed")
  let ram = extractNumber(
    getSpec(specs, ["ram memory installed", "ram memory installed size", "memory", "ram", "installed memory", "system memory"])
  );
  if (!ram) {
    const m = name.match(/(\d+)\s*GB\s*(?:DDR|RAM|SDRAM|ECC)?/i);
    if (m) ram = parseInt(m[1], 10);
  }

  // CPU — core count + GHz
  let cores = extractNumber(
    getSpec(specs, ["processor core count", "number of cpu cores", "processor count"])
  );
  if (!cores) {
    const m = allText.match(/(\d+)\s*-?\s*core\s+cpu/i);
    if (m) cores = parseInt(m[1], 10);
  }
  let ghz = extractNumber(
    getSpec(specs, ["processor speed", "cpu model speed maximum", "maximum clockspeed"])
  );
  if (!ghz && cores > 0) ghz = 3.5; // Conservative default if not published

  // GPU VRAM — dedicated GPU detection
  let vram = extractNumber(
    getSpec(specs, ["vram", "graphics card ram", "graphics card ram size", "video memory", "gpu memory", "graphics memory"])
  );

  if (vram > 0) {
    // ── WORKSTATION WITH DEDICATED GPU ──────────────────────────────────────
    // RAM (max 35): 32GB=28, 64GB=33, 128GB=38 → capped at 35
    const ramScore = Math.min(35, Math.round(Math.log2(Math.max(ram, 1)) * 5.5));
    // GPU VRAM (max 40): 8GB=28, 12GB=32, 16GB=36, 24GB=40, 32GB→40 (capped)
    const gpuScore = Math.min(40, Math.round(Math.log2(Math.max(vram, 1)) * 10));
    // CPU (max 25): cores+GHz
    const coreScore = Math.min(15, Math.round(Math.log2(Math.max(cores, 1)) * 3.5));
    const ghzScore  = Math.min(10, Math.round((ghz / 5.5) * 10));
    const cpuScore  = Math.min(25, coreScore + ghzScore);

    return Math.min(100, Math.max(0, ramScore + gpuScore + cpuScore));
  } else {
    // ── WORKSTATION WITHOUT DEDICATED GPU (mini PC / integrated) ─────────
    // RAM (max 55): weighted more since there's no GPU
    const ramScore = Math.min(55, Math.round(Math.log2(Math.max(ram, 1)) * 8));
    // CPU (max 45): cores + GHz with higher ceiling
    const coreScore = Math.min(25, Math.round(Math.log2(Math.max(cores, 1)) * 6));
    const ghzScore  = Math.min(20, Math.round((ghz / 5.5) * 20));
    const cpuScore  = Math.min(45, coreScore + ghzScore);

    return Math.min(100, Math.max(0, ramScore + cpuScore));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// NPU / CPU DESKTOP SCORING  (max 100)
// Amazon does not publish AI TOPS for desktop CPUs.
// All four spec fields below are 100% available in the DB for this category.
//   Core Count   0-35 pts  — log scale
//   GHz Boost    0-25 pts  — linear against 5.7 GHz reference (fastest in DB)
//   Cache MB     0-25 pts  — log scale (L2+L3 total; includes 3D V-Cache where applicable)
//   TDP (Watts)  0-15 pts  — linear against 200W reference
// ─────────────────────────────────────────────────────────────────────────────
function scoreNPU(specs: Record<string, unknown>, name: string): number {
  // Core count — available at 100% in DB
  const cores = extractNumber(
    getSpec(specs, ["processor core count", "processor count", "number of cpu cores"])
  );

  // GHz boost — available at 100% in DB
  const ghz = extractNumber(
    getSpec(specs, ["processor speed", "maximum clockspeed"])
  );

  // Cache — "Cache Memory Installed Size" covers L2+L3 total; available at 100%
  const cacheMB = extractNumber(
    getSpec(specs, ["cache memory installed size", "secondary cache"])
  );

  // TDP — "Wattage" available at 100% in DB
  const tdp = extractNumber(
    getSpec(specs, ["wattage"])
  );

  // Core score: 4c=14, 6c=17, 8c=21, 12c=26, 16c=30, 20c=33, 24c=35
  const coreScore  = Math.min(35, Math.round(Math.log2(Math.max(cores, 1)) * 8));
  // GHz score: 3.5GHz=15, 4.5GHz=20, 5.0GHz=22, 5.5GHz=24, 5.7GHz=25
  const ghzScore   = Math.min(25, Math.round((ghz / 5.7) * 25));
  // Cache score: 16MB=18, 32MB=22, 64MB=27→25, 80MB=29→25, 96MB=30→25
  const cacheScore = Math.min(25, Math.round(Math.log2(Math.max(cacheMB, 1)) * 4.5));
  // TDP score: 65W=5, 105W=8, 125W=9, 170W=13, 200W=15
  const tdpScore   = Math.min(15, Math.round((tdp / 200) * 15));

  return Math.min(100, Math.max(0, coreScore + ghzScore + cacheScore + tdpScore));
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
  const name = product.name || product.clean_name || product.title || "";

  if (category === "gpu"          || category === "gpus")         return scoreGPU(specs, name);
  if (category === "laptop"       || category === "laptops")      return scoreLaptop(specs, name);
  if (category === "workstation"  || category === "workstations") return scoreWorkstation(specs, name);
  if (category === "npu"          || category === "npus")         return scoreNPU(specs, name);

  return 0;
}

/** Assigns a Tier label based on AI score. */
export function assignTier(score: number): Tier {
  if (score >= 80) return "S";
  if (score >= 65) return "A";
  if (score >= 45) return "B";
  return "C";
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
  const name = product.name || product.clean_name || product.title || "";

  const breakdown: ScoreBreakdown = { total: 0, tier: "C", components: {} };

  // ── GPU ──────────────────────────────────────────────────────────────────
  if (category === "gpu" || category === "gpus") {
    let vram = extractNumber(
      getSpec(specs, ["vram", "graphics card ram", "graphics card ram size", "video memory", "gpu memory", "graphics memory"])
    );
    if (!vram) { const m = name.match(/(\d+)\s*GB/i); if (m) vram = parseFloat(m[1]); }
    const vramScore    = Math.min(70, Math.round(Math.log2(Math.max(vram, 1)) * 14));
    const computeScore = getGPUComputeScore(name);

    breakdown.total = Math.min(100, Math.max(0, vramScore + computeScore));
    breakdown.components = {
      "VRAM":              { score: vramScore,    max: 70, percentage: Math.round((vramScore    / 70) * 100) },
      "Compute (Model)":   { score: computeScore, max: 30, percentage: Math.round((computeScore / 30) * 100) },
    };
  }

  // ── LAPTOP ───────────────────────────────────────────────────────────────
  else if (category === "laptop" || category === "laptops") {
    const allText = getAllSpecText(specs) + " " + name.toLowerCase();

    let ram = extractNumber(getSpec(specs, ["ram memory installed", "unified memory", "memory", "ram memory installed size", "system memory", "installed ram"]));
    if (!ram) { const m = name.match(/(\d+)\s*GB\s*(?:DDR|LPDDR|Unified|RAM|Memory)/i); if (m) ram = parseInt(m[1], 10); }
    const ramScore = Math.min(35, Math.round(Math.log2(Math.max(ram, 1)) * 5));

    let cores = extractNumber(getSpec(specs, ["processor core count", "number of cpu cores"]));
    if (!cores || cores <= 1) {
      const procCount = extractNumber(getSpec(specs, ["processor count"]));
      if (procCount > 1) cores = procCount;
    }
    if (!cores || cores <= 1) { const m = allText.match(/(\d+)\s*-?\s*core\s+cpu/i); if (m) cores = parseInt(m[1], 10); }
    let ghz = extractNumber(getSpec(specs, ["processor speed", "maximum clockspeed", "cpu model speed maximum"]));
    if (!ghz && cores > 0) ghz = 3.5;
    const coreScore = Math.min(18, Math.round(Math.log2(Math.max(cores, 1)) * 4));
    const ghzScore  = Math.min(12, Math.round((ghz / 5.5) * 12));
    const cpuScore  = Math.min(30, coreScore + ghzScore);

    let vram = extractNumber(getSpec(specs, ["vram", "graphics card ram", "graphics card ram size", "video memory", "gpu memory"]));
    let gpuScore = 0;
    let gpuLabel = "";
    if (vram > 0) {
      gpuScore = Math.min(25, Math.round(Math.log2(Math.max(vram, 1)) * 4));
      gpuLabel = `Discrete VRAM (${vram} GB)`;
    } else if (ram > 0) {
      const effectiveVRAM = ram * 0.5;
      gpuScore = Math.min(25, Math.round(Math.log2(Math.max(effectiveVRAM, 1)) * 4));
      gpuLabel = `Unified Memory ×0.5 (${effectiveVRAM} GB effective)`;
    } else {
      const gpuText = getSpec(specs, ["graphics coprocessor", "graphics description", "other special features of the product"]) + " " + allText;
      const coresMatch = gpuText.match(/(\d+)\s*-?\s*core\s+gpu/i);
      if (coresMatch) {
        const gpuCores = parseInt(coresMatch[1], 10);
        gpuScore = Math.min(18, Math.round(Math.log2(Math.max(gpuCores, 1)) * 2.5));
        gpuLabel = `Integrated (${gpuCores}-core GPU)`;
      } else {
        gpuLabel = "Integrated GPU (no data)";
      }
    }

    const storeRaw = getSpec(specs, ["hard-drive size", "hard disk", "hard disk description", "storage", "ssd"]) + " " + allText;
    const storageGB = extractStorageGB(storeRaw);
    let storageBonus = 0;
    if      (storageGB >= 2000) storageBonus = 10;
    else if (storageGB >= 1000) storageBonus = 7;
    else if (storageGB >= 512)  storageBonus = 4;
    else if (storageGB >= 256)  storageBonus = 2;

    breakdown.total = Math.min(100, Math.max(0, ramScore + cpuScore + gpuScore + storageBonus));
    breakdown.components = {
      "RAM":      { score: ramScore,     max: 35, percentage: Math.round((ramScore     / 35) * 100) },
      "CPU":      { score: cpuScore,     max: 30, percentage: Math.round((cpuScore     / 30) * 100) },
      [gpuLabel]: { score: gpuScore,     max: 25, percentage: Math.round((gpuScore     / 25) * 100) },
      "Storage":  { score: storageBonus, max: 10, percentage: Math.round((storageBonus / 10) * 100) },
    };
  }

  // ── WORKSTATION ───────────────────────────────────────────────────────────
  else if (category === "workstation" || category === "workstations") {
    const allText = getAllSpecText(specs) + " " + name.toLowerCase();

    let ram = extractNumber(getSpec(specs, ["ram memory installed", "ram memory installed size", "memory", "ram", "installed memory", "system memory"]));
    if (!ram) { const m = name.match(/(\d+)\s*GB\s*(?:DDR|RAM|SDRAM|ECC)?/i); if (m) ram = parseInt(m[1], 10); }

    let cores = extractNumber(getSpec(specs, ["processor core count", "number of cpu cores", "processor count"]));
    if (!cores) { const m = allText.match(/(\d+)\s*-?\s*core\s+cpu/i); if (m) cores = parseInt(m[1], 10); }
    let ghz = extractNumber(getSpec(specs, ["processor speed", "cpu model speed maximum", "maximum clockspeed"]));
    if (!ghz && cores > 0) ghz = 3.5;

    let vram = extractNumber(getSpec(specs, ["vram", "graphics card ram", "graphics card ram size", "video memory", "gpu memory", "graphics memory"]));

    if (vram > 0) {
      const ramScore  = Math.min(35, Math.round(Math.log2(Math.max(ram, 1)) * 5.5));
      const gpuScore  = Math.min(40, Math.round(Math.log2(Math.max(vram, 1)) * 10));
      const coreScore = Math.min(15, Math.round(Math.log2(Math.max(cores, 1)) * 3.5));
      const ghzScore  = Math.min(10, Math.round((ghz / 5.5) * 10));
      const cpuScore  = Math.min(25, coreScore + ghzScore);
      breakdown.total = Math.min(100, Math.max(0, ramScore + gpuScore + cpuScore));
      breakdown.components = {
        "RAM":        { score: ramScore, max: 35, percentage: Math.round((ramScore / 35) * 100) },
        "GPU VRAM":   { score: gpuScore, max: 40, percentage: Math.round((gpuScore / 40) * 100) },
        "CPU":        { score: cpuScore, max: 25, percentage: Math.round((cpuScore / 25) * 100) },
      };
    } else {
      const ramScore  = Math.min(55, Math.round(Math.log2(Math.max(ram, 1)) * 8));
      const coreScore = Math.min(25, Math.round(Math.log2(Math.max(cores, 1)) * 6));
      const ghzScore  = Math.min(20, Math.round((ghz / 5.5) * 20));
      const cpuScore  = Math.min(45, coreScore + ghzScore);
      breakdown.total = Math.min(100, Math.max(0, ramScore + cpuScore));
      breakdown.components = {
        "RAM":                   { score: ramScore, max: 55, percentage: Math.round((ramScore / 55) * 100) },
        "CPU (no dedicated GPU)": { score: cpuScore, max: 45, percentage: Math.round((cpuScore / 45) * 100) },
      };
    }
  }

  // ── NPU / CPU Desktop ─────────────────────────────────────────────────────
  else if (category === "npu" || category === "npus") {
    const cores    = extractNumber(getSpec(specs, ["processor core count", "processor count", "number of cpu cores"]));
    const ghz      = extractNumber(getSpec(specs, ["processor speed", "maximum clockspeed"]));
    const cacheMB  = extractNumber(getSpec(specs, ["cache memory installed size", "secondary cache"]));
    const tdp      = extractNumber(getSpec(specs, ["wattage"]));

    const coreScore  = Math.min(35, Math.round(Math.log2(Math.max(cores, 1)) * 8));
    const ghzScore   = Math.min(25, Math.round((ghz / 5.7) * 25));
    const cacheScore = Math.min(25, Math.round(Math.log2(Math.max(cacheMB, 1)) * 4.5));
    const tdpScore   = Math.min(15, Math.round((tdp / 200) * 15));

    breakdown.total = Math.min(100, Math.max(0, coreScore + ghzScore + cacheScore + tdpScore));
    breakdown.components = {
      "CPU Core Count":  { score: coreScore,  max: 35, percentage: Math.round((coreScore  / 35) * 100) },
      "Clock Speed":     { score: ghzScore,   max: 25, percentage: Math.round((ghzScore   / 25) * 100) },
      "Cache Size":      { score: cacheScore, max: 25, percentage: Math.round((cacheScore / 25) * 100) },
      "TDP (Wattage)":   { score: tdpScore,   max: 15, percentage: Math.round((tdpScore   / 15) * 100) },
    };
  }

  breakdown.tier = assignTier(breakdown.total);
  return breakdown;
}
