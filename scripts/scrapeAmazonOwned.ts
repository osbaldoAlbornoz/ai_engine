/**
 * Scraper directo de Amazon sin dependencias externas (Apify)
 * 
 * Usa Puppeteer para renderizar JavaScript y obtener precios exactos.
 * Incluye manejo de proxies, reintentos, y logging detallado.
 * 
 * Uso:
 *   npx tsx --env-file=.env.local scripts/scrapeAmazonOwned.ts <categoria>
 * 
 * Categorías válidas: gpus, laptops, npus, workstations
 */

import puppeteer, { Page, Browser } from 'puppeteer';
import { createClient } from '@supabase/supabase-js';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN
// ─────────────────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const AFFILIATE_TAG = process.env.AMAZON_AFFILIATE_TAG || 'theaienginela-20';

// User agents reales de Chrome
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];

// Configuración de Puppeteer - NO headless para evitar detección
const PUPPETEER_OPTIONS = {
  headless: false,  // Visible browser es menos sospechoso
  args: [
    '--disable-blink-features=AutomationControlled',
    '--disable-features=IsolateOrigins,site-per-process',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--window-size=1280,800',
  ],
};

// Tiempo de espera entre requests para evitar bloqueos (ms)
const REQUEST_DELAY_MS = 8000;

// Timeout para navegación (ms)
const NAVIGATION_TIMEOUT_MS = 120000;

// Random delay helper
const randomDelay = (min: number, max: number) => 
  Math.floor(Math.random() * (max - min + 1)) + min;

// Reintentos máximos por página
const MAX_RETRIES = 2;

// ─────────────────────────────────────────────────────────────────────────────
// SELECTORES DE AMAZON (pueden cambiar, actualizar según sea necesario)
// ─────────────────────────────────────────────────────────────────────────────

const PRICE_SELECTORS = [
  '#priceblock_ourprice',           // Precio principal
  '#priceblock_dealprice',          // Precio de oferta
  '.a-price .a-offscreen',          // Nuevo diseño de precio
  '#corePriceDisplay_desktop_feature_div .a-price .a-offscreen',
  '#tp_price_block_primary_price',
  '[data-asin-price]',
  '.a-price-whole',                 // Precio entero (nuevo diseño)
];

const TITLE_SELECTORS = [
  '#productTitle',
  '#title',
  '.product-title',
];

const IMAGE_SELECTORS = [
  '#imgTagWrapperId img',
  '#landingImage',
  '.a-dynamic-image',
  '#imageBlock_feature_div img',
];

const FEATURES_SELECTORS = [
  '#feature-bullets ul li',
  '.a-unordered-list.a-vertical li',
  '#productDescription',
];

const SPECS_SELECTORS = [
  '#productDetails_detailBullets_sections_id li',
  '#technicalSpecifications tr',
  '.a-table tr',
];

// ─────────────────────────────────────────────────────────────────────────────
// INICIALIZACIÓN
// ─────────────────────────────────────────────────────────────────────────────

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
  
  // NIVEL 1: Palabras clave PRIMARIAS en el título (máxima prioridad)
  const gpuKeywords = [
    "graphics card", "video card", "graphics adapter", "gpu card",
    "graphics board", "video board", "display adapter"
  ];
  
  const laptopKeywords = [
    "laptop", "notebook", "macbook", "ultrabook", "chromebook"
  ];
  
  const workstationKeywords = [
    "workstation", "desktop computer", "tower pc", "mini pc", 
    "all-in-one", "all in one", "desktop pc", "computer system",
    "gaming pc", "office computer", "business computer"
  ];
  
  const npuKeywords = [
    "processor", "cpu", "chipset"
  ];
  
  // 1. Detectar si es LAPTOP
  if (laptopKeywords.some(kw => {
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    return regex.test(title);
  })) {
    if (intendedCategory !== "laptops") {
      console.warn(`[AUTO-RECLASSIFY] Title indicates laptop → "${title.substring(0, 70)}" → laptops`);
    }
    return "laptops";
  }
  
  // 2. Detectar si es GPU
  if (gpuKeywords.some(kw => {
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    return regex.test(title);
  })) {
    if (intendedCategory !== "gpus") {
      console.warn(`[AUTO-RECLASSIFY] Title indicates graphics card → "${title.substring(0, 70)}" → gpus`);
    }
    return "gpus";
  }
  
  // 3. Detectar si es WORKSTATION
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
  const isNPU = npuKeywords.some(kw => {
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    return regex.test(title);
  });
  
  const isSystemWithProcessor = workstationKeywords.some(kw => t.includes(kw));
  
  if (isNPU && !isSystemWithProcessor) {
    if (intendedCategory !== "npus") {
      console.warn(`[AUTO-RECLASSIFY] Title indicates processor/CPU → "${title.substring(0, 70)}" → npus`);
    }
    return "npus";
  }
  
  // NIVEL 2: Fallback a specs
  const builtIn = (specs["Built-In Media"] || "").toLowerCase();
  const pcDesignType = (specs["Personal Computer Design Type"] || "").toLowerCase();
  const processorCount = specs["Processor Count"] ? parseInt(specs["Processor Count"]) : null;
  
  const bareProcessorKeywords = [
    "oem", "tray", "bulk", "without cooler", "box processor",
    "mpk", "multi-pack", "standalone", "component only"
  ];
  
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

  console.log(`[CATEGORY] "${title.substring(0, 50)}..." → keeping as "${intendedCategory}"`);
  return intendedCategory;
}

// ─────────────────────────────────────────────────────────────────────────────
// MULTI-LAYER FILTERING PIPELINE
// ─────────────────────────────────────────────────────────────────────────────

interface FilterResult {
  valid: boolean;
  score: number;
  reason: string;
}

const BASIC_BLACKLIST = [
  'book', 'kindle', 'paperback', 'hardcover', 'audiobook', 'dvd', 'blu-ray', 'cd-rom',
  'monitor', 'display', 'screen', 'projector', 'beamer',
  'cable', 'adapter', 'converter', 'extender', 'bracket', 'mount', 'stand',
  'case', 'chassis', 'enclosure', 'housing', 'shell',
  'cooling', 'heatsink', 'thermal paste', 'cpu cooler', 'liquid cooling',
  'power supply', 'psu', 'ups', 'inverter',
  'keyboard', 'mouse', 'headset', 'webcam', 'microphone', 'controller', 'gamepad',
  'printer', 'scanner', 'copier',
  'software', 'license', 'subscription', 'download', 'digital',
  'case for', 'cover for', 'skin for', 'protector', 'sleeve', 'bag for',
];

const USED_KEYWORDS = [
  'renewed', 'renewed premium', 'refurbished', 'used', 'pre-owned', 'pre owned',
  'open box', 'seller refurbished', 'certified refurbished',
];

const GPU_FAMILIES = [
  'rtx', 'gtx', 'rtx a', 'rtx pro', 'quadro', 'tesla', 'geforce',
  'radeon rx', 'radeon pro', 'intel arc', 'amd radeon',
];

const VRAM_INDICATORS = [
  'gddr5', 'gddr6', 'gddr6x', 'gddr7', 'hbm', 'hbm2', 'hbm3',
  'video memory', 'graphics memory', 'vram',
];

const LAPTOP_KEYWORDS = ['laptop', 'notebook', 'ultrabook', 'mobile workstation', 'macbook'];
const WORKstation_BRANDS = ['dell precision', 'hp z', 'lenovo thinkstation', 'lenovo thinkpad p', 'hp zbook', 'supermicro', 'asus proart'];
const WORKSTATION_KEYWORDS = ['workstation', 'mobile workstation', 'ai workstation', 'professional workstation'];

const NPU_KEYWORDS = [
  'ryzen ai', 'core ultra', 'snapdragon x elite', 'snapdragon x plus',
  'npu', 'neural engine', 'ai engine', 'copilot+',
];

const CPU_AI_KEYWORDS = [
  'threadripper', 'xeon w', 'xeon gold', 'xeon platinum', 'epyc',
  'ryzen 9', 'core i9', 'ryzen 7', 'core i7',
];

const APPLE_SILICON = ['m1', 'm2', 'm3', 'm4', 'apple silicon'];

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

const RAM_SCORES = [
  { keyword: '128gb', points: 20 },
  { keyword: '64gb', points: 15 },
  { keyword: '48gb', points: 12 },
  { keyword: '32gb', points: 10 },
  { keyword: '24gb', points: 8 },
  { keyword: '16gb', points: 5 },
];

const VRAM_SCORES = [
  { keyword: '48gb', points: 25 },
  { keyword: '24gb', points: 20 },
  { keyword: '16gb', points: 15 },
  { keyword: '12gb', points: 10 },
  { keyword: '10gb', points: 8 },
  { keyword: '8gb', points: 5 },
];

const MIN_PRICES: Record<string, number> = {
  gpus: 150,
  laptops: 400,
  workstations: 800,
  npus: 100,
};

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
    if (new RegExp(`^${term}|\\s${term}\\s|\\s${term}$`, 'i').test(titleLower)) {
      const isPartOfSystem = 
        titleLower.includes('laptop') || titleLower.includes('workstation') || 
        titleLower.includes('desktop') || titleLower.includes('notebook') ||
        titleLower.includes('pc ') || titleLower.includes('computer');
      
      if (!isPartOfSystem) {
        return { valid: false, score: 0, reason: `Blacklist match: ${term}` };
      }
    }
  }

  // CAPA 2: Filtro de condición
  for (const term of USED_KEYWORDS) {
    if (titleLower.includes(term)) {
      return { valid: false, score: 0, reason: `Used condition: ${term}` };
    }
  }
  
  const condition = (specs["Condition"] || specs["ItemCondition"] || specs["Item Condition"] || "").toLowerCase();
  if (condition.includes('refurbished') || condition.includes('used') || condition.includes('renewed')) {
    return { valid: false, score: 0, reason: `Spec condition: ${condition}` };
  }

  // CAPA 3: Precio mínimo
  const minPrice = MIN_PRICES[category] || 100;
  if (price > 0 && price < minPrice) {
    return { valid: false, score: 0, reason: `Price $${price} < $${minPrice} minimum for ${category}` };
  }

  // CAPA 4: Validación específica por categoría
  let score = 0;

  if (category === 'gpus') {
    const hasGPUFamily = GPU_FAMILIES.some(fam => fullText.includes(fam));
    if (!hasGPUFamily) {
      return { valid: false, score: 0, reason: 'No valid GPU family found' };
    }

    const hasVRAM = VRAM_INDICATORS.some(ind => fullText.includes(ind));
    if (!hasVRAM) {
      return { valid: false, score: 0, reason: 'No VRAM indicator (GDDR/HBM) found' };
    }

    if (fullText.includes('chip only') || fullText.includes('gpu chip') || fullText.includes(' die ') || fullText.includes('bga')) {
      return { valid: false, score: 0, reason: 'GPU chip only, not complete card' };
    }

    for (const { keyword, points } of GPU_SCORE_KEYWORDS) {
      if (fullText.includes(keyword)) score += points;
    }
    for (const { keyword, points } of VRAM_SCORES) {
      if (fullText.includes(keyword)) score += points;
    }
    if (fullText.includes('cuda')) score += 10;
    if (fullText.includes('tensor core')) score += 10;

  } else if (category === 'laptops') {
    const isLaptop = LAPTOP_KEYWORDS.some(kw => titleLower.includes(kw));
    if (!isLaptop) {
      return { valid: false, score: 0, reason: 'Not a laptop/notebook' };
    }

    if (titleLower.includes('case for') || titleLower.includes('cover for') || titleLower.includes('skin for')) {
      return { valid: false, score: 0, reason: 'Laptop accessory, not laptop' };
    }

    const hasDedicatedGPU = GPU_FAMILIES.some(fam => fullText.includes(fam));
    const hasNPU = NPU_KEYWORDS.some(kw => fullText.includes(kw));
    const hasAppleSilicon = APPLE_SILICON.some(kw => fullText.includes(kw));
    
    const hasRealAI = hasDedicatedGPU || hasNPU || hasAppleSilicon;
    if (!hasRealAI) {
      return { valid: false, score: 0, reason: 'No dedicated GPU, NPU, or Apple Silicon' };
    }

    if (hasDedicatedGPU) score += 30;
    if (hasNPU) score += 15;
    if (hasAppleSilicon) score += 25;
    for (const { keyword, points } of RAM_SCORES) {
      if (fullText.includes(keyword)) score += points;
    }

  } else if (category === 'workstations') {
    const isSystem = WORKSTATION_KEYWORDS.some(kw => fullText.includes(kw)) ||
                     WORKstation_BRANDS.some(brand => titleLower.includes(brand));
    
    if (!isSystem) {
      return { valid: false, score: 0, reason: 'Not a workstation system' };
    }

    if (titleLower.includes('processor') && !titleLower.includes('workstation') && !titleLower.includes('system')) {
      return { valid: false, score: 0, reason: 'CPU processor only, not complete system' };
    }

    const hasProGPU = GPU_FAMILIES.some(fam => fullText.includes(fam));
    const hasProCPU = CPU_AI_KEYWORDS.some(kw => fullText.includes(kw));
    
    if (!hasProGPU && !hasProCPU) {
      return { valid: false, score: 0, reason: 'No professional GPU or CPU' };
    }

    if (hasProGPU) score += 30;
    if (hasProCPU) score += 20;
    for (const { keyword, points } of RAM_SCORES) {
      if (fullText.includes(keyword)) score += points;
    }
    if (WORKstation_BRANDS.some(brand => titleLower.includes(brand))) score += 15;

  } else if (category === 'npus') {
    const isNPU = NPU_KEYWORDS.some(kw => fullText.includes(kw));
    const isCPU_AI = CPU_AI_KEYWORDS.some(kw => fullText.includes(kw));
    
    if (!isNPU && !isCPU_AI) {
      return { valid: false, score: 0, reason: 'Not an NPU or AI-grade CPU' };
    }

    if (isNPU) score += 30;
    if (isCPU_AI) score += 20;
    if (fullText.includes('threadripper')) score += 15;
    if (fullText.includes('xeon')) score += 10;
  }

  if (score < 40) {
    return { valid: false, score, reason: `Score ${score} < 40 threshold` };
  }

  return { valid: true, score: Math.min(score, 100), reason: 'Passed all filters' };
}

// ─────────────────────────────────────────────────────────────────────────────
// SCRAPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

interface ScrapedProduct {
  asin: string;
  title: string;
  price: number;
  imageUrl: string;
  features: string[];
  specs: Record<string, string>;
  brand: string;
  found: boolean;
}

async function scrapeProductPage(page: Page, url: string): Promise<ScrapedProduct | null> {
  try {
    console.log(`  📄 Scraping: ${url}`);
    
    await page.goto(url, { 
      waitUntil: 'networkidle2', 
      timeout: NAVIGATION_TIMEOUT_MS 
    });
    
    // Esperar a que el contenido cargue
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Extraer ASIN de la URL
    const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/);
    const asin = asinMatch ? asinMatch[1] : '';
    
    if (!asin) {
      console.log(`  ⚠️ No ASIN found in URL`);
      return null;
    }
    
    // Extraer título
    let title = '';
    for (const selector of TITLE_SELECTORS) {
      try {
        const titleElement = await page.$eval(selector, el => el.textContent?.trim());
        if (titleElement) {
          title = titleElement;
          break;
        }
      } catch {
        continue;
      }
    }
    
    if (!title) {
      console.log(`  ⚠️ No title found, possible block`);
      return null;
    }
    
    // Extraer precio
    let price = 0;
    let priceStr = '';
    for (const selector of PRICE_SELECTORS) {
      try {
        const priceElement = await page.$eval(selector, el => el.textContent?.trim());
        if (priceElement) {
          priceStr = priceElement;
          // Parsear precio: "$169.50" -> 169.50
          const parsed = parseFloat(priceElement.replace(/[^0-9.]/g, ''));
          if (!isNaN(parsed)) {
            price = parsed;
            break;
          }
        }
      } catch {
        continue;
      }
    }
    
    // Extraer imagen
    let imageUrl = '';
    for (const selector of IMAGE_SELECTORS) {
      try {
        const imgElement = await page.$eval(selector, el => {
          const src = el.getAttribute('src') || el.getAttribute('data-src');
          return src || '';
        });
        if (imgElement && imgElement.startsWith('http')) {
          imageUrl = imgElement;
          break;
        }
      } catch {
        continue;
      }
    }
    
    // Extraer features
    const features: string[] = [];
    try {
      const featureElements = await page.$$(FEATURES_SELECTORS[0]);
      for (const el of featureElements) {
        const text = await el.evaluate(e => e.textContent?.trim());
        if (text && text.length > 10) {
          features.push(text);
        }
      }
    } catch {
      // No critical
    }
    
    // Extraer especificaciones
    const specs: Record<string, string> = {};
    try {
      const specRows = await page.$$(SPECS_SELECTORS[0]);
      for (const row of specRows) {
        const key = await row.$eval('.a-span-bold, td:first-child', el => el.textContent?.trim()).catch(() => '');
        const value = await row.$eval('.a-span-last, td:last-child', el => el.textContent?.trim()).catch(() => '');
        if (key && value) {
          specs[key] = value;
        }
      }
    } catch {
      // No critical
    }
    
    // Extraer marca
    let brand = 'Unknown';
    try {
      brand = await page.$eval('#bylineInfo, .a-section .a-size-base', el => el.textContent?.trim()).catch(() => 'Unknown');
      brand = brand.replace('Visit the ', '').replace(' Store', '').trim();
    } catch {
      // Keep default
    }
    
    console.log(`  ✓ ${title.substring(0, 50)}... | Price: $${price || 'N/A'}`);
    
    return {
      asin,
      title,
      price,
      imageUrl,
      features,
      specs,
      brand,
      found: true,
    };
    
  } catch (error: any) {
    console.log(`  ❌ Error scraping ${url}: ${error.message}`);
    return null;
  }
}

async function scrapeSearchResults(page: Page, searchUrl: string, maxItems: number): Promise<ScrapedProduct[]> {
  const products: ScrapedProduct[] = [];
  
  try {
    console.log(`\n🔍 Searching: ${searchUrl}`);
    
    await page.goto(searchUrl, { 
      waitUntil: 'networkidle2', 
      timeout: NAVIGATION_TIMEOUT_MS 
    });
    
    await page.waitForSelector('[data-component-type="s-search-result"]', { timeout: 10000 });
    
    // Obtener URLs de productos de los resultados
    const productUrls = await page.evaluate(() => {
      const results = document.querySelectorAll('[data-component-type="s-search-result"]');
      const urls: string[] = [];
      
      results.forEach(result => {
        const link = result.querySelector('h2 a[href*="/dp/"]');
        if (link && link.getAttribute('href')) {
          const fullUrl = link.getAttribute('href');
          if (fullUrl && !urls.includes(fullUrl)) {
            urls.push(fullUrl);
          }
        }
      });
      
      return urls;
    });
    
    console.log(`  Found ${productUrls.length} products in search results`);
    
    // Scrapear cada página de producto
    for (let i = 0; i < Math.min(productUrls.length, maxItems); i++) {
      const url = productUrls[i];
      const fullUrl = url.startsWith('http') ? url : `https://www.amazon.com${url}`;
      
      const product = await scrapeProductPage(page, fullUrl);
      if (product) {
        products.push(product);
      }
      
      // Delay entre requests
      if (i < productUrls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY_MS));
      }
    }
    
  } catch (error: any) {
    console.log(`  ❌ Error in search: ${error.message}`);
  }
  
  return products;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

async function scrapeAmazonOwned({ category, maxItemsPerSearch = 6 }: { category: string; maxItemsPerSearch?: number }) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 Amazon Direct Scraper - Category: ${category}`);
  console.log(`${'='.repeat(60)}\n`);
  
  const searchUrls = SEARCH_CONFIGS[category] || [];
  
  if (searchUrls.length === 0) {
    console.error(`❌ No search URLs found for category: ${category}`);
    return;
  }
  
  console.log(`📋 Search URLs: ${searchUrls.length}`);
  console.log(`📦 Max items per search: ${maxItemsPerSearch}\n`);
  
  // Launch browser
  console.log('🌐 Launching Puppeteer...');
  const browser = await puppeteer.launch(PUPPETEER_OPTIONS);
  
  try {
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Set random user agent
    const randomUA = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    await page.setUserAgent(randomUA);
    
    // Extra headers para parecer más real
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Upgrade-Insecure-Requests': '1',
    });
    
    // Injectar script para evitar detección
    await page.evaluateOnNewDocument(() => {
      // @ts-ignore
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      // @ts-ignore
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
      // @ts-ignore
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    });
    
    const allProducts: ScrapedProduct[] = [];
    
    // Scrape each search URL
    for (const searchUrl of searchUrls) {
      const products = await scrapeSearchResults(page, searchUrl, maxItemsPerSearch);
      allProducts.push(...products);
      
      console.log(`\n⏳ Waiting ${REQUEST_DELAY_MS / 1000}s before next search...`);
      await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY_MS));
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 Scraping complete! Found ${allProducts.length} products`);
    console.log(`${'='.repeat(60)}\n`);
    
    // Process and save to database
    let savedCount = 0;
    let rejectedCount = 0;
    
    for (const product of allProducts) {
      // Infer category from title
      const finalCategory = inferCategory(category, product.title, product.specs);
      
      // Filter through AI hardware pipeline
      const filterResult = filterAIHardware(finalCategory, product.title, product.specs, product.price);
      
      if (!filterResult.valid) {
        console.log(`  ❌ REJECTED: ${filterResult.reason} - "${product.title.substring(0, 50)}..."`);
        rejectedCount++;
        continue;
      }
      
      console.log(`  ✅ ACCEPTED: Score ${filterResult.score}/100 - "${product.title.substring(0, 50)}..."`);
      
      // Add affiliate tag to URL
      const amazonUrl = `https://www.amazon.com/dp/${product.asin}?tag=${AFFILIATE_TAG}`;
      
      // Prepare product for database
      const dbProduct = {
        amazon_asin: product.asin,
        name: product.title,
        category: finalCategory,
        brand: product.brand,
        price: product.price > 0 ? product.price : 0,
        original_price: null,
        amazon_url: amazonUrl,
        image_url: product.imageUrl,
        features: product.features,
        specs: product.specs,
        status: 'active' as const,
        ai_score: filterResult.score,
        updated_at: new Date().toISOString(),
      };
      
      // Upsert to database
      const { error } = await supabase
        .from('products')
        .upsert(dbProduct, { onConflict: 'amazon_asin' });
        
      if (error) {
        console.error(`    ❌ Error saving ${product.asin}: ${error.message}`);
      } else {
        console.log(`    ✓ Saved ${product.asin}`);
        savedCount++;
      }
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`💾 Database Summary`);
    console.log(`${'='.repeat(60)}`);
    console.log(`   Products saved: ${savedCount}`);
    console.log(`   Products rejected: ${rejectedCount}`);
    console.log(`${'='.repeat(60)}\n`);
    
  } finally {
    await browser.close();
    console.log('🔒 Browser closed');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ENTRY POINT
// ─────────────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const category = args[0];

if (!category) {
  console.log("Usage: npx tsx --env-file=.env.local scripts/scrapeAmazonOwned.ts <category>");
  console.log("Valid categories: gpus, laptops, npus, workstations");
  process.exit(1);
}

if (!SEARCH_CONFIGS[category]) {
  console.error(`❌ Unknown category: ${category}`);
  console.error(`Valid options: ${Object.keys(SEARCH_CONFIGS).join(', ')}`);
  process.exit(1);
}

scrapeAmazonOwned({
  category: category,
  maxItemsPerSearch: 6
});
