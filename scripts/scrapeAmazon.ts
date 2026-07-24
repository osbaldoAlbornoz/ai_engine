import { ApifyClient } from 'apify-client';
import { createClient } from '@supabase/supabase-js';

const APIFY_TOKEN = process.env.APIFY_TOKEN;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const AFFILIATE_TAG = process.env.AMAZON_AFFILIATE_TAG || 'theaienginela-20';

if (!APIFY_TOKEN || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing required environment variables. Please check your .env.local file.");
  console.error("Make sure APIFY_TOKEN, NEXT_PUBLIC_SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY are set.");
  process.exit(1);
}

const apifyClient = new ApifyClient({ token: APIFY_TOKEN });
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface ScrapeOptions {
  category: string;
  searchUrls: string[];
  maxItems?: number;
}

// Timeout for Apify calls (1 hour default)
const APIFY_TIMEOUT_MS = 60 * 60 * 1000;

async function scrapeWithTimeout(actor: any, input: any, timeoutMs: number = APIFY_TIMEOUT_MS) {
  return Promise.race([
    actor.call(input),
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error(`Apify timeout after ${timeoutMs / 1000} seconds`)), timeoutMs)
    )
  ]);
}

async function scrapeAmazon({ category, searchUrls, maxItems = 10 }: ScrapeOptions) {
  console.log(`Starting scrape for category: ${category}`);
  
  const input = {
    categoryOrProductUrls: searchUrls.map(url => ({ url })),
    maxItemsPerStartUrl: maxItems,
    proxyConfiguration: {
      useApifyProxy: true
    }
  };

  try {
    console.log(`Calling Apify Actor (junglee/amazon-crawler) with ${APIFY_TIMEOUT_MS / 1000}s timeout...`);
    const run = await scrapeWithTimeout(apifyClient.actor("junglee/amazon-crawler"), input, APIFY_TIMEOUT_MS);
    
    console.log(`Actor finished. Fetching dataset: ${run.defaultDatasetId}`);
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
    
    console.log(`Found ${items.length} items. Formatting for Supabase...`);
    
    const scrapedAsins: string[] = [];
    
    for (const item of items) {
      if (!item.asin || !item.title) continue;
      scrapedAsins.push(String(item.asin));
      
      // =============================================
      // PRICE PARSING - Enhanced with validation
      // =============================================
      console.log(`\n[PRICE DEBUG] ASIN: ${item.asin}`);
      console.log(`[PRICE DEBUG] Raw item.price:`, JSON.stringify(item.price));
      console.log(`[PRICE DEBUG] Raw item.originalPrice:`, JSON.stringify(item.originalPrice));
      
      // Price range validation by category (to detect obvious errors)
      const PRICE_RANGES: Record<string, { min: number; max: number }> = {
        gpus: { min: 150, max: 3000 },
        laptops: { min: 400, max: 5000 },
        workstations: { min: 800, max: 15000 },
        npus: { min: 100, max: 2000 },
      };
      const expectedRange = PRICE_RANGES[category] || { min: 50, max: 5000 };
      
      let priceVal = 0;
      let priceSource = "unknown";
      let priceWarning = "";
      
      if (typeof item.price === 'object' && item.price !== null && 'value' in item.price) {
        priceVal = Number(item.price.value);
        priceSource = "object.value";
      } else if (typeof item.price === 'string' && item.price) {
        // Handle string prices like "$169.50", "US$169.50", "169.50"
        const priceStr = item.price.replace(/[^0-9.]/g, '');
        priceVal = parseFloat(priceStr);
        priceSource = `string parsed (${item.price} -> ${priceVal})`;
      } else if (item.price === null || item.price === undefined) {
        priceSource = "null/undefined";
      } else {
        const priceStr = String(item.price || '0').replace(/[^0-9.]/g, '');
        priceVal = parseFloat(priceStr);
        priceSource = `fallback string (${priceStr} -> ${priceVal})`;
      }
      
      // Validate price is within expected range
      if (priceVal > 0) {
        if (priceVal < expectedRange.min) {
          priceWarning = `⚠️ SUSPICIOUSLY LOW: $${priceVal} < $${expectedRange.min} (category: ${category})`;
        } else if (priceVal > expectedRange.max) {
          priceWarning = `⚠️ SUSPICIOUSLY HIGH: $${priceVal} > $${expectedRange.max} (category: ${category})`;
        }
      }
      
      console.log(`[PRICE DEBUG] Parsed price: $${priceVal} (source: ${priceSource})`);
      if (priceWarning) {
        console.warn(`[PRICE WARNING] ${priceWarning}`);
        console.warn(`[PRICE WARNING] Title: "${String(item.title).substring(0, 80)}..."`);
      }
      
      let originalPriceVal = null;
      if (typeof item.originalPrice === 'object' && item.originalPrice !== null && 'value' in item.originalPrice) {
        originalPriceVal = Number(item.originalPrice.value);
      } else if (item.originalPrice) {
        const originalPriceStr = String(item.originalPrice).replace(/[^0-9.]/g, '');
        originalPriceVal = parseFloat(originalPriceStr);
      }
      
      const price = priceVal > 0 ? priceVal : 0;
      const originalPrice = originalPriceVal || null;
      
      console.log(`[PRICE DEBUG] Final price: $${price}, originalPrice: ${originalPrice}`);
      
      // Clean up the URL and add affiliate tag
      const amazonUrl = `https://www.amazon.com/dp/${item.asin}?tag=${AFFILIATE_TAG}`;
      
      const features = Array.isArray(item.features) ? item.features : [];
      let specs: Record<string, string> = {};
      if (item.productInformation && typeof item.productInformation === 'object') specs = { ...specs, ...(item.productInformation as Record<string, string>) };
      if (item.specifications && typeof item.specifications === 'object') specs = { ...specs, ...(item.specifications as Record<string, string>) };
      if (Array.isArray(item.attributes)) {
        item.attributes.forEach((attr: any) => {
          if (attr.key && attr.value) {
            specs[attr.key] = attr.value;
          }
        });
      }
      
      const brand = item.brand || 'Unknown';
      const imageUrl = item.highResImage || item.thumbnailImage || item.image || '';

      // Guard against cross-category contamination
      const finalCategory = inferCategory(category, String(item.title), specs);
      
      // MULTI-LAYER FILTERING PIPELINE
      const filterResult = filterAIHardware(finalCategory, String(item.title), specs, price);
      
      if (!filterResult.valid) {
        console.log(`  → REJECTED: ${filterResult.reason} - "${String(item.title).substring(0, 60)}..."`);
        continue;
      }
      
      console.log(`  → ACCEPTED: Score ${filterResult.score}/100 - "${String(item.title).substring(0, 60)}..."`);
      
      const product = {
        amazon_asin: item.asin,
        name: item.title,
        category: finalCategory,
        brand: brand,
        price: price > 0 ? price : 0,
        original_price: originalPrice,
        amazon_url: amazonUrl,
        image_url: imageUrl,
        features: features,
        specs: specs,
        status: 'active',
        ai_score: filterResult.score
      };

      console.log(`    Upserting ${product.amazon_asin}...`);
      
      const { error } = await supabase
        .from('products')
        .upsert(product, { onConflict: 'amazon_asin' });
        
      if (error) {
        console.error(`    Error inserting ${product.amazon_asin}:`, error.message);
      } else {
        console.log(`    ✓ Successfully saved ${product.amazon_asin}`);
      }
    }
    
    console.log("\nScraping and DB insertion complete!");

  } catch (error) {
    console.error("Scraping failed:", error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH CONFIGS
// ─────────────────────────────────────────────────────────────────────────────
const SEARCH_CONFIGS: Record<string, string[]> = {
  gpus: [
    "https://www.amazon.com/s?k=AI+graphics+card+24GB&rh=n%3A284822",
    "https://www.amazon.com/s?k=high+end+GPU+16GB&rh=n%3A284822",
    "https://www.amazon.com/s?k=best+graphics+card+for+AI&rh=n%3A284822",
    "https://www.amazon.com/s?k=RTX+4090+graphics+card&rh=n%3A284822",
    "https://www.amazon.com/s?k=RTX+4080+GPU+graphics+card&rh=n%3A284822",
    "https://www.amazon.com/s?k=RX+7900+XTX&rh=n%3A284822",
  ],
  laptops: [
    "https://www.amazon.com/s?k=new+generation+AI+laptop&rh=n%3A565108",
    "https://www.amazon.com/s?k=Copilot%2B+PC&rh=n%3A565108",
    "https://www.amazon.com/s?k=creator+laptop+32GB+RAM&rh=n%3A565108",
    "https://www.amazon.com/s?k=AI+laptop+RTX+4080&rh=n%3A565108",
    "https://www.amazon.com/s?k=gaming+laptop+RTX+4070&rh=n%3A565108",
  ],
  npus: [
    "https://www.amazon.com/s?k=Ryzen+AI+9+processor+CPU&rh=n%3A229189",
    "https://www.amazon.com/s?k=Intel+Core+Ultra+CPU+processor&rh=n%3A229189",
  ],
  workstations: [
    "https://www.amazon.com/s?k=AI+workstation+desktop+computer&rh=n%3A565088",
    "https://www.amazon.com/s?k=AMD+workstation+desktop+computer&rh=n%3A565088",
    "https://www.amazon.com/s?k=Intel+Xeon+workstation+desktop+PC&rh=n%3A565088",
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY GUARD - Title-based primary classification
// ─────────────────────────────────────────────────────────────────────────────
function inferCategory(
  intendedCategory: string,
  title: string,
  specs: Record<string, string>
): string {
  const t = title.toLowerCase();
  
  // ───────────────────────────────────────────────────────────────────────────
  // NIVEL 1: Palabras clave PRIMARIAS en el título (máxima prioridad)
  // ───────────────────────────────────────────────────────────────────────────
  
  // GPU: Tarjetas gráficas completas
  const gpuKeywords = [
    "graphics card", "video card", "graphics adapter", "gpu card",
    "graphics board", "video board", "display adapter"
  ];
  
  // LAPTOP: Portátiles reales
  const laptopKeywords = [
    "laptop", "notebook", "macbook", "ultrabook", "chromebook"
  ];
  
  // WORKSTATION: Sistemas completos
  const workstationKeywords = [
    "workstation", "desktop computer", "tower pc", "mini pc", 
    "all-in-one", "all in one", "desktop pc", "computer system",
    "gaming pc", "office computer", "business computer"
  ];
  
  // NPU: Procesadores/CPU sueltos (NO sistemas completos)
  const npuKeywords = [
    "processor", "cpu", "chipset"
  ];
  
  // ───────────────────────────────────────────────────────────────────────────
  // Regla de detección: El sustantivo principal determina la categoría
  // ───────────────────────────────────────────────────────────────────────────
  
  // 1. Detectar si es LAPTOP (máxima prioridad - no puede ser otra cosa)
  if (laptopKeywords.some(kw => {
    // Buscar la palabra como sustantivo principal, no como adjetivo
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    return regex.test(title);
  })) {
    if (intendedCategory !== "laptops") {
      console.warn(`[AUTO-RECLASSIFY] Title indicates laptop → "${title.substring(0, 70)}" → laptops`);
    }
    return "laptops";
  }
  
  // 2. Detectar si es GPU (tarjeta gráfica completa)
  if (gpuKeywords.some(kw => {
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    return regex.test(title);
  })) {
    if (intendedCategory !== "gpus") {
      console.warn(`[AUTO-RECLASSIFY] Title indicates graphics card → "${title.substring(0, 70)}" → gpus`);
    }
    return "gpus";
  }
  
  // 3. Detectar si es WORKSTATION (sistema completo)
  if (workstationKeywords.some(kw => {
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    return regex.test(title);
  })) {
    if (intendedCategory !== "workstations") {
      console.warn(`[AUTO-RECLASSIFY] Title indicates workstation/system → "${title.substring(0, 70)}" → workstations`);
    }
    return "workstations";
  }
  
  // 4. Detectar si es NPU (procesador suelto)
  // IMPORTANTE: Solo si NO es parte de un sistema completo
  const isNPU = npuKeywords.some(kw => {
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    return regex.test(title);
  });
  
  // Verificar que no sea un sistema que menciona el procesador como característica
  // Ej: "Workstation with Xeon Processor" → es workstation, no NPU
  const isSystemWithProcessor = workstationKeywords.some(kw => t.includes(kw));
  
  if (isNPU && !isSystemWithProcessor) {
    if (intendedCategory !== "npus") {
      console.warn(`[AUTO-RECLASSIFY] Title indicates processor/CPU → "${title.substring(0, 70)}" → npus`);
    }
    return "npus";
  }
  
  // ───────────────────────────────────────────────────────────────────────────
  // NIVEL 2: Fallback a specs y lógica secundaria
  // ───────────────────────────────────────────────────────────────────────────
  
  const builtIn = (specs["Built-In Media"] || "").toLowerCase();
  const pcDesignType = (specs["Personal Computer Design Type"] || "").toLowerCase();
  const processorCount = specs["Processor Count"] ? parseInt(specs["Processor Count"]) : null;
  
  // Keywords adicionales para bare processors
  const bareProcessorKeywords = [
    "oem", "tray", "bulk", "without cooler", "box processor",
    "mpk", "multi-pack", "standalone", "component only"
  ];
  
  // CPU brand patterns
  const cpuPatterns = [
    /\bryzen\s*\d+\b/,
    /\bthreadripper\b/,
    /\bxeon\b/,
    /\bcore\s*(i[0-9]|ultra)\b/,
  ];
  
  const isBareProcessor =
    builtIn === "item" ||
    t.includes("processor box") ||
    t.includes("oem tray") ||
    t.includes("bulk pack") ||
    bareProcessorKeywords.some(kw => t.includes(kw)) ||
    (cpuPatterns.some(pattern => pattern.test(t)) &&
      pcDesignType === "" &&
      (processorCount === null || processorCount <= 1));

  if (isBareProcessor) {
    if (intendedCategory === "workstations") {
      console.warn(`[AUTO-RECLASSIFY] Bare CPU (specs) from workstations URL → npus: "${title.substring(0, 70)}"`);
      return "npus";
    }
    return "npus";
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Default: mantener categoría original
  // ───────────────────────────────────────────────────────────────────────────
  console.log(`[CATEGORY] "${title.substring(0, 50)}..." → keeping as "${intendedCategory}" (no reclassification needed)`);
  return intendedCategory;
}

// ─────────────────────────────────────────────────────────────────────────────
// MULTI-LAYER FILTERING PIPELINE
// ─────────────────────────────────────────────────────────────────────────────

interface FilterResult {
  valid: boolean;
  score: number;
  reason: string;
  category?: string;
}

// CAPA 1: Blacklist básica (accesorios puros, no componentes)
const BASIC_BLACKLIST = [
  // Libros y medios
  'book', 'kindle', 'paperback', 'hardcover', 'audiobook', 'dvd', 'blu-ray', 'cd-rom',
  // Monitores
  'monitor', 'display', 'screen', 'projector', 'beamer',
  // Cables y adaptadores
  'cable', 'adapter', 'converter', 'extender', 'bracket', 'mount', 'stand',
  // Gabinetes vacíos
  'case', 'chassis', 'enclosure', 'housing', 'shell',
  // Refrigeración
  'cooling', 'heatsink', 'thermal paste', 'cpu cooler', 'liquid cooling',
  // Fuentes de poder
  'power supply', 'psu', 'ups', 'inverter',
  // Periféricos
  'keyboard', 'mouse', 'headset', 'webcam', 'microphone', 'controller', 'gamepad',
  // Impresoras
  'printer', 'scanner', 'copier',
  // Software
  'software', 'license', 'subscription', 'download', 'digital',
  // Accesorios
  'case for', 'cover for', 'skin for', 'protector', 'sleeve', 'bag for',
];

// CAPA 2: Keywords de condición (usado/refurbished)
const USED_KEYWORDS = [
  'renewed', 'renewed premium', 'refurbished', 'used', 'pre-owned', 'pre owned',
  'open box', 'seller refurbished', 'certified refurbished',
];

// CAPA 3: Familias válidas de GPU
const GPU_FAMILIES = [
  'rtx', 'gtx', 'rtx a', 'rtx pro', 'quadro', 'tesla', 'geforce',
  'radeon rx', 'radeon pro', 'intel arc', 'amd radeon',
];

// VRAM indicators (must be paired with GPU family)
const VRAM_INDICATORS = [
  'gddr5', 'gddr6', 'gddr6x', 'gddr7', 'hbm', 'hbm2', 'hbm3',
  'video memory', 'graphics memory', 'vram',
];

// CAPA 4: Keywords por categoría
const LAPTOP_KEYWORDS = ['laptop', 'notebook', 'ultrabook', 'mobile workstation', 'macbook'];
const WORKstation_BRANDS = ['dell precision', 'hp z', 'lenovo thinkstation', 'lenovo thinkpad p', 'hp zbook', 'supermicro', 'asus proart'];
const WORKSTATION_KEYWORDS = ['workstation', 'mobile workstation', 'ai workstation', 'professional workstation'];

// NPU real (AI processors)
const NPU_KEYWORDS = [
  'ryzen ai', 'core ultra', 'snapdragon x elite', 'snapdragon x plus',
  'npu', 'neural engine', 'ai engine', 'copilot+',
];

// CPU AI / Workstation grade
const CPU_AI_KEYWORDS = [
  'threadripper', 'xeon w', 'xeon gold', 'xeon platinum', 'epyc',
  'ryzen 9', 'core i9', 'ryzen 7', 'core i7',
];

// Apple Silicon
const APPLE_SILICON = ['m1', 'm2', 'm3', 'm4', 'apple silicon'];
const APPLE_GPU = ['m1 pro', 'm1 max', 'm1 ultra', 'm2 pro', 'm2 max', 'm2 ultra', 'm3 pro', 'm3 max', 'm4 pro', 'm4 max'];

// GPU keywords para scoring
const GPU_SCORE_KEYWORDS = [
  { keyword: 'rtx 4090', points: 40 },
  { keyword: 'rtx 4080', points: 35 },
  { keyword: 'rtx 4070', points: 30 },
  { keyword: 'rtx 4060', points: 25 },
  { keyword: 'rtx 3090', points: 30 },
  { keyword: 'rtx 3080', points: 25 },
  { keyword: 'rtx a6000', points: 35 },
  { keyword: 'rtx a5000', points: 30 },
  { keyword: 'rtx a4000', points: 25 },
  { keyword: 'quadro', points: 20 },
  { keyword: 'radeon rx 7900', points: 30 },
  { keyword: 'radeon rx 6900', points: 25 },
  { keyword: 'radeon pro', points: 20 },
  { keyword: 'cuda', points: 10 },
  { keyword: 'tensor core', points: 10 },
  { keyword: 'dlss', points: 5 },
];

// RAM scoring
const RAM_SCORES = [
  { keyword: '128gb', points: 20 },
  { keyword: '64gb', points: 15 },
  { keyword: '48gb', points: 12 },
  { keyword: '32gb', points: 10 },
  { keyword: '24gb', points: 8 },
  { keyword: '16gb', points: 5 },
];

// VRAM scoring
const VRAM_SCORES = [
  { keyword: '48gb', points: 25 },
  { keyword: '24gb', points: 20 },
  { keyword: '16gb', points: 15 },
  { keyword: '12gb', points: 10 },
  { keyword: '10gb', points: 8 },
  { keyword: '8gb', points: 5 },
];

// Minimum prices by category
const MIN_PRICES: Record<string, number> = {
  gpus: 150,
  laptops: 400,
  workstations: 800,
  npus: 100,
};

// ─────────────────────────────────────────────────────────────────────────────
// FILTER FUNCTION
// ─────────────────────────────────────────────────────────────────────────────
function filterAIHardware(
  category: string,
  title: string,
  specs: Record<string, string>,
  price: number
): FilterResult {
  const titleLower = title.toLowerCase();
  const specsText = Object.values(specs).join(' ').toLowerCase();
  const fullText = titleLower + ' ' + specsText;

  // CAPA 1: Blacklist básica
  for (const term of BASIC_BLACKLIST) {
    // Solo rechazar si el término aparece como producto principal, no como parte de sistema
    if (new RegExp(`^${term}|\\s${term}\\s|\\s${term}$`, 'i').test(titleLower)) {
      // Excepción: no rechazar si es parte de descripción de sistema completo
      const isPartOfSystem = 
        titleLower.includes('laptop') || titleLower.includes('workstation') || 
        titleLower.includes('desktop') || titleLower.includes('notebook') ||
        titleLower.includes('pc ') || titleLower.includes('computer');
      
      if (!isPartOfSystem) {
        return { valid: false, score: 0, reason: `Blacklist match: ${term}` };
      }
    }
  }

  // CAPA 2: Filtro de condición (solo NEW)
  for (const term of USED_KEYWORDS) {
    if (titleLower.includes(term)) {
      return { valid: false, score: 0, reason: `Used condition: ${term}` };
    }
  }
  
  const condition = (specs["Condition"] || specs["ItemCondition"] || specs["Item Condition"] || "").toLowerCase();
  if (condition.includes('refurbished') || condition.includes('used') || condition.includes('renewed')) {
    return { valid: false, score: 0, reason: `Spec condition: ${condition}` };
  }

  // CAPA 3: Precio mínimo por categoría
  const minPrice = MIN_PRICES[category] || 100;
  if (price > 0 && price < minPrice) {
    return { valid: false, score: 0, reason: `Price $${price} < $${minPrice} minimum for ${category}` };
  }

  // CAPA 4: Validación específica por categoría
  let score = 0;

  if (category === 'gpus') {
    // Debe tener familia GPU válida
    const hasGPUFamily = GPU_FAMILIES.some(fam => fullText.includes(fam));
    if (!hasGPUFamily) {
      return { valid: false, score: 0, reason: 'No valid GPU family found' };
    }

    // Debe tener VRAM real (GDDR, no solo "GB")
    const hasVRAM = VRAM_INDICATORS.some(ind => fullText.includes(ind));
    if (!hasVRAM) {
      return { valid: false, score: 0, reason: 'No VRAM indicator (GDDR/HBM) found' };
    }

    // No debe ser solo chip
    if (fullText.includes('chip only') || fullText.includes('gpu chip') || fullText.includes(' die ') || fullText.includes('bga')) {
      return { valid: false, score: 0, reason: 'GPU chip only, not complete card' };
    }

    // Calcular score
    for (const { keyword, points } of GPU_SCORE_KEYWORDS) {
      if (fullText.includes(keyword)) score += points;
    }
    for (const { keyword, points } of VRAM_SCORES) {
      if (fullText.includes(keyword)) score += points;
    }
    if (fullText.includes('cuda')) score += 10;
    if (fullText.includes('tensor core')) score += 10;

  } else if (category === 'laptops') {
    // Debe ser laptop real
    const isLaptop = LAPTOP_KEYWORDS.some(kw => titleLower.includes(kw));
    if (!isLaptop) {
      return { valid: false, score: 0, reason: 'Not a laptop/notebook' };
    }

    // No debe ser accesorio para laptop
    if (titleLower.includes('case for') || titleLower.includes('cover for') || titleLower.includes('skin for')) {
      return { valid: false, score: 0, reason: 'Laptop accessory, not laptop' };
    }

    // Debe tener GPU dedicada o NPU o Apple Silicon
    const hasDedicatedGPU = GPU_FAMILIES.some(fam => fullText.includes(fam));
    const hasNPU = NPU_KEYWORDS.some(kw => fullText.includes(kw));
    const hasAppleSilicon = APPLE_SILICON.some(kw => fullText.includes(kw));
    
    // Verificar que no sea solo "AI" marketing
    const hasRealAI = hasDedicatedGPU || hasNPU || hasAppleSilicon;
    if (!hasRealAI) {
      return { valid: false, score: 0, reason: 'No dedicated GPU, NPU, or Apple Silicon' };
    }

    // Calcular score
    if (hasDedicatedGPU) score += 30;
    if (hasNPU) score += 15;
    if (hasAppleSilicon) score += 25;
    for (const { keyword, points } of RAM_SCORES) {
      if (fullText.includes(keyword)) score += points;
    }

  } else if (category === 'workstations') {
    // Debe ser sistema completo, no solo CPU
    const isSystem = WORKSTATION_KEYWORDS.some(kw => fullText.includes(kw)) ||
                     WORKstation_BRANDS.some(brand => titleLower.includes(brand));
    
    if (!isSystem) {
      return { valid: false, score: 0, reason: 'Not a workstation system' };
    }

    // No debe ser solo CPU suelto
    if (titleLower.includes('processor') && !titleLower.includes('workstation') && !titleLower.includes('system')) {
      return { valid: false, score: 0, reason: 'CPU processor only, not complete system' };
    }

    // Debe tener hardware profesional
    const hasProGPU = GPU_FAMILIES.some(fam => fullText.includes(fam));
    const hasProCPU = CPU_AI_KEYWORDS.some(kw => fullText.includes(kw));
    
    if (!hasProGPU && !hasProCPU) {
      return { valid: false, score: 0, reason: 'No professional GPU or CPU' };
    }

    // Calcular score
    if (hasProGPU) score += 30;
    if (hasProCPU) score += 20;
    for (const { keyword, points } of RAM_SCORES) {
      if (fullText.includes(keyword)) score += points;
    }
    if (WORKstation_BRANDS.some(brand => titleLower.includes(brand))) score += 15;

  } else if (category === 'npus') {
    // Debe ser NPU real o CPU AI grade
    const isNPU = NPU_KEYWORDS.some(kw => fullText.includes(kw));
    const isCPU_AI = CPU_AI_KEYWORDS.some(kw => fullText.includes(kw));
    
    if (!isNPU && !isCPU_AI) {
      return { valid: false, score: 0, reason: 'Not an NPU or AI-grade CPU' };
    }

    // Calcular score
    if (isNPU) score += 30;
    if (isCPU_AI) score += 20;
    if (fullText.includes('threadripper')) score += 15;
    if (fullText.includes('xeon')) score += 10;
  }

  // Threshold: score >= 40 para aceptar
  if (score < 40) {
    return { valid: false, score, reason: `Score ${score} < 40 threshold` };
  }

  return { valid: true, score: Math.min(score, 100), reason: 'Passed all filters', category };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const category = args[0];

if (!category) {
  console.log("Usage: npx tsx --env-file=.env.local scripts/scrapeAmazon.ts <category>");
  process.exit(1);
}

const urls = SEARCH_CONFIGS[category];
if (!urls) {
  console.error(`Unknown category: ${category}. Valid options: ${Object.keys(SEARCH_CONFIGS).join(', ')}`);
  process.exit(1);
}

scrapeAmazon({
  category: category,
  searchUrls: urls,
  maxItems: 12
});