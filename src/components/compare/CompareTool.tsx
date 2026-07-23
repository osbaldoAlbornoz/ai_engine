"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/types/product";
import { ShoppingCart, ChevronDown, Plus, X, Trophy, Check, Search, Sparkles, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

type Category = "gpus" | "laptops" | "npus" | "workstations";

interface CompareProduct extends Product {
  image_url: string;
  amazon_url: string;
  original_price?: number;
  features: string[];
  pros?: string[];
  cons?: string[];
}
import Link from "next/link";
import { calculateAIScore, assignTier, tierStyles, calculateValueRating } from "@/utils/scoring";
import { supabase } from "@/lib/supabase";

// Helper to decode HTML entities in product names like &#x2011; or &amp;
const decodeHtml = (html: string) => {
  if (typeof window === 'undefined') return html.replace(/&#x2011;/g, '-').replace(/&amp;/g, '&');
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};
import {
  USE_CASES,
  UseCaseId,
  calculateUseCaseScore,
  getBestUseCase,
  getKeyDifferences,
  getPresentFields
} from "@/utils/use-cases";
// We need to import the parsers if we want to use them, but wait, they are not exported from use-cases.ts.
// Let's just do it directly inside CompareTool by creating local helper or we can export them.
// Since we can't easily export them in one step, let's just parse the specs locally in CompareTool.
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const categories: { id: Category; label: string }[] = [
  { id: "gpus", label: "Graphic Cards (GPUs)" },
  { id: "laptops", label: "AI Laptops" },
  { id: "npus", label: "Processors (NPUs)" },
  { id: "workstations", label: "Workstations" },
];

// CustomSelect con búsqueda
function CustomSelect({
  value,
  options,
  onChange,
  placeholder = "Select Product",
}: {
  value: string;
  options: { id: string; name: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const selectedOption = options.find((opt) => opt.id === value);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter(opt =>
      opt.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  return (
    <div className="relative flex-grow min-w-0" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="font-heading w-full bg-[#050505] border-2 border-primary/60 hover:border-primary shadow-[0_0_15px_rgba(0,229,255,0.15)] transition-all text-white pl-4 pr-10 py-2.5 rounded-none focus:outline-none focus:ring-1 focus:ring-primary font-semibold cursor-pointer text-sm truncate flex items-center justify-between"
      >
        <span className="truncate">{selectedOption?.name || placeholder}</span>
        <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-1 bg-[#050505] border border-primary/40 shadow-[0_5px_20px_rgba(0,229,255,0.2)] max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent"
          >
            {/* Search Input */}
            <div className="sticky top-0 bg-[#050505] border-b border-zinc-800 p-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-zinc-900 border border-zinc-700 text-white pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:border-primary rounded-none"
                />
              </div>
            </div>

            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-zinc-500 text-sm">
                No products found
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`font-heading px-4 py-2.5 text-sm cursor-pointer transition-colors ${opt.id === value
                      ? "bg-primary/20 text-primary border-l-2 border-primary font-bold"
                      : "text-zinc-300 hover:bg-zinc-800 hover:text-primary border-l-2 border-transparent"
                    }`}
                >
                  {opt.name}
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// UseCase Selector
function UseCaseSelector({
  value,
  onChange,
}: {
  value: UseCaseId;
  onChange: (value: UseCaseId) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedUseCase = USE_CASES[value];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-gradient-to-r from-fuchsia-900/30 to-purple-900/30 border border-fuchsia-500/30 hover:border-fuchsia-400 px-4 py-2 rounded-none transition-all"
      >
        <span className="text-xl">{selectedUseCase.icon}</span>
        <div className="text-left">
          <div className="text-xs text-fuchsia-400 font-heading uppercase tracking-wider">Use Case</div>
          <div className="text-sm font-bold text-white font-heading">{selectedUseCase.name}</div>
        </div>
        <ChevronDown className={`h-4 w-4 text-fuchsia-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 mt-2 bg-[#050505] border border-fuchsia-500/30 shadow-[0_5px_20px_rgba(192,38,211,0.2)] max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-fuchsia-500/30 scrollbar-track-transparent w-72"
          >
            <div className="p-3 border-b border-zinc-800">
              <span className="text-xs text-zinc-400 font-heading">Select your primary use case:</span>
            </div>
            {(Object.keys(USE_CASES) as UseCaseId[]).map((useCaseId) => {
              const uc = USE_CASES[useCaseId];
              return (
                <button
                  key={useCaseId}
                  onClick={() => {
                    onChange(useCaseId);
                    setIsOpen(false);
                  }}
                  className={`w-full p-3 flex items-start gap-3 transition-colors ${value === useCaseId
                      ? "bg-fuchsia-500/10 border-l-2 border-fuchsia-500"
                      : "hover:bg-zinc-800/50 border-l-2 border-transparent"
                    }`}
                >
                  <span className="text-2xl">{uc.icon}</span>
                  <div className="text-left flex-1">
                    <div className={`font-heading text-sm font-bold ${value === useCaseId ? 'text-fuchsia-400' : 'text-white'}`}>
                      {uc.name}
                    </div>
                    <div className="text-xs text-zinc-500">{uc.description}</div>
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Función para mapear datos de Supabase a CompareProduct
function mapDbToCompareProduct(dbProd: any): CompareProduct {
  return {
    id: dbProd.id,
    amazon_asin: dbProd.amazon_asin,
    name: dbProd.clean_name || dbProd.name,
    clean_name: dbProd.clean_name,
    slug: dbProd.slug,
    description: (dbProd.features && dbProd.features.length > 0) ? dbProd.features[0] : "High-performance AI hardware",
    category: (dbProd.category || "gpus") as Category,
    brand: dbProd.brand || "Unknown",
    price: dbProd.price || 0,
    original_price: dbProd.original_price,
    image_url: dbProd.image_url || "",
    amazon_url: dbProd.amazon_url || "#",
    specs: dbProd.specs || {},
    features: dbProd.features || [],
    pros: dbProd.pros || [],
    cons: dbProd.cons || [],
    rating: dbProd.rating,
    reviewsCount: dbProd.reviews_count,
    isPopular: dbProd.is_popular,
    status: dbProd.status,
    ai_score: dbProd.ai_score,
  };
}

export function CompareTool({ slugString }: { slugString?: string }) {
  const [activeCategory, setActiveCategory] = useState<Category>("gpus");
  const [useCase, setUseCase] = useState<UseCaseId>("stable-diffusion");

  // Usar React Query para cachear datos compartidos con una key única para CompareTool
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['compare-products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').eq('status', 'active');
      if (error) throw error;
      return data.map(mapDbToCompareProduct);
    },
    staleTime: 5 * 60 * 1000,  // 5 minutes - prevents constant refetching in Firefox
    gcTime: 10 * 60 * 1000,    // 10 minutes cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const categoryProducts = useMemo(() => {
    return products.filter((p) => p.category === activeCategory);
  }, [activeCategory, products]);

  const [selectedProdIds, setSelectedProdIds] = useState<string[]>(["", ""]);

  // Set initial selected products from slugString once products are loaded
  useEffect(() => {
    if (products.length === 0) return;
    
    if (slugString && slugString.includes("-vs-")) {
      const [slug1, slug2] = slugString.split("-vs-");
      const p1 = products.find(p => p.slug === slug1);
      const p2 = products.find(p => p.slug === slug2);
      
      if (p1 && p2) {
        if (p1.category === p2.category && p1.category !== activeCategory) {
          setActiveCategory(p1.category);
        }
        
        // Check if we need to update to prevent infinite loops if they're already selected
        if (selectedProdIds[0] !== p1.id || selectedProdIds[1] !== p2.id) {
          setSelectedProdIds([p1.id, p2.id]);
        }
      }
    } else if (slugString === undefined) {
      if (selectedProdIds[0] !== "" || selectedProdIds[1] !== "") {
        setSelectedProdIds(["", ""]);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugString, products]);

  useEffect(() => {
    const prods = products.filter((p) => p.category === activeCategory);
    if (prods.length === 0) return;

    const newIds = selectedProdIds.map(id => {
      if (id === "") return "";
      if (!prods.find(p => p.id === id)) return "";
      return id;
    });

    // Only update if something actually changed - prevents re-render loops
    if (JSON.stringify(newIds) !== JSON.stringify(selectedProdIds)) {
      setSelectedProdIds(newIds);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, activeCategory]);

  // Sync selected products to URL silently (only after initial mount to avoid hydration loops)
  const hasMounted = useRef(false);
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return; // Skip first render - slugString already reflects URL
    }
    if (products.length === 0) return;

    const validSelected = selectedProdIds
      .map(id => products.find(p => p.id === id))
      .filter(Boolean);

    if (validSelected.length === 2 && selectedProdIds.length === 2) {
      const newUrl = `/compare/${validSelected[0]!.slug}-vs-${validSelected[1]!.slug}`;
      if (window.location.pathname !== newUrl) {
        window.history.replaceState(null, '', newUrl);
      }
    } else {
      if (window.location.pathname !== '/compare' && window.location.pathname.includes('/compare/')) {
        window.history.replaceState(null, '', '/compare');
      }
    }
  }, [selectedProdIds, products]);

  const handleCategoryChange = (cat: Category) => {
    setActiveCategory(cat);
    setSelectedProdIds(["", ""]);
  };

  const updateProduct = (index: number, newId: string) => {
    const newSelected = [...selectedProdIds];
    newSelected[index] = newId;
    setSelectedProdIds(newSelected);
  };

  const addProduct = () => {
    if (selectedProdIds.length < 4) {
      setSelectedProdIds([...selectedProdIds, ""]);
    }
  };

  const removeProduct = (index: number) => {
    if (selectedProdIds.length > 2) {
      const newSelected = [...selectedProdIds];
      newSelected.splice(index, 1);
      setSelectedProdIds(newSelected);
    }
  };

  const selectedProducts = useMemo(() => {
    return selectedProdIds.map(id => categoryProducts.find(p => p.id === id));
  }, [selectedProdIds, categoryProducts]);

  const validProducts = useMemo(() => {
    return selectedProducts.filter((p): p is CompareProduct => !!p);
  }, [selectedProducts]);

  const isReadyToCompare = validProducts.length >= 2;

  // Determine common fields across all valid products for fair comparison
  const commonFields = useMemo(() => {
    if (validProducts.length === 0) return undefined;
    let common = getPresentFields(validProducts[0]);
    for (let i = 1; i < validProducts.length; i++) {
      const fields = getPresentFields(validProducts[i]);
      common = common.filter(f => fields.includes(f));
    }
    return common;
  }, [validProducts]);

  // Scores por caso de uso
  const { useCaseScores, maxScore, winnerIndex } = useMemo(() => {
    const scores = validProducts.map(p => calculateUseCaseScore(p, useCase, commonFields));
    const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
    const winnerIndex = scores.indexOf(maxScore);
    return { useCaseScores: scores, maxScore, winnerIndex };
  }, [validProducts, useCase, commonFields]);

  // Diferencias clave (automático)
  const keyDifferences = useMemo(() => {
    if (validProducts.length < 2) return [];
    return getKeyDifferences(validProducts[0], validProducts[1], useCase, commonFields);
  }, [validProducts, useCase, commonFields]);

  // Campos que NO son specs técnicas (enfoque: excluir solo lo confirmado como basura)
  const EXCLUDED_KEYS = [
    // Identificadores y metadata de Amazon
    'asin', 'upc', 'ean', 'isbn', 'sku',
    'brand', 'manufacturer',
    'category', 'id', 'price', 'amazon url', 'url',

    // Nombres de modelo y series (nombres comerciales, no specs técnicas)
    'model name', 'model number', 'model year', 'model',
    'gpu series', 'series', 'product series', 'family',
    'part number', 'manufacturer part number', 'mpn',
    'mfr part number', 'item model number', 'item number', 'item', 'item name',
    'unit count',

    // Campos de empaque / contenido de caja (basura de Amazon)
    'built-in media', 'built-in', 'media',
    'package', 'package quantity', 'package dimensions',
    'box', 'contents', 'in the box', 'built-in media',

    // Reviews y rankings (basura de Amazon)
    'customer reviews', 'reviews', 'rating', 'ratings', 'review count',
    'best sellers rank', 'sales rank', 'rank',

    // Garantía y origen
    'warranty', 'warranty description',
    'country of origin', 'origin',
    'global trade identification number', 'trade identification',

    // Campos de uso/escenario (valores inconsistentes - basura de Amazon)
    'antenna location', 'antenna', 'location',
    'indoor/outdoor', 'environment', 'use', 'usage',
    'compatible devices', 'compatibility',

    // Dimensiones y peso del producto (no son specs técnicas del hardware)
    'item weight', 'weight', 'item dimensions',

    // Fechas
    'date first available', 'available date', 'release date', 'date',

    // Información de producto
    'product information', 'information',
    'product description', 'description',
    'special features', 'features',
    'included components', 'components',
    'specification metadata', 'metadata',
  ];

  // Detecta si un valor es metadata/inválido en lugar de una spec técnica
  function isValidSpecValue(value: string): boolean {
    if (!value || value === "N/A" || value === "n/a" || value === "") return false;

    // Patrones que indican metadata o categorías en lugar de specs técnicas
    const invalidPatterns = [
      /^(gaming|office|professional|home|outdoor|indoor|commercial|industrial)\s*,?\s*(gaming|office|professional|home|outdoor|indoor|commercial|industrial)?/i,
      /^(n\/a|na|not applicable|unknown|not available)$/i,
      /^(for |compatible with |designed for |works with)/i,
      /^(multi|all|universal|general)$/i,
      /^(indoor|outdoor|indoor\/outdoor)$/i,
      /^\d+\.\d+\s*out of\s*\d+\s*stars?/i, // "4.8 out of 5 stars"
      /^#\d+\s*in\s*/i, // "#82 in Computer Graphics Cards"
      /^item$/i, // Solo "Item" como valor
    ];

    return !invalidPatterns.some(pattern => pattern.test(value.trim()));
  }

  // Specs unificadas y ordenadas (enfoque flexible: permitir todo excepto lo excluido)
  const allSpecKeys = useMemo(() => {
    // Recopilar todas las keys disponibles en los productos
    const availableKeys = new Set<string>();
    validProducts.forEach(p => {
      Object.keys(p.specs).forEach(k => availableKeys.add(k.toLowerCase()));
    });

    // Filtrar specs: excluir las que están en EXCLUDED_KEYS o tienen valores inválidos
    const result: { key: string; label: string }[] = [];

    // Orden preferido para mostrar las specs técnicas más importantes primero
    const priorityOrder = [
      // GPU specs
      'graphics coprocessor', 'gpu', 'graphics', 'graphics description',
      'graphics card ram', 'vram', 'video memory', 'memory',
      'graphics ram type', 'memory type', 'ram type',
      'cuda cores', 'stream processors', 'compute units', 'tensor cores', 'ai cores',
      'gpu clock speed', 'gpu clock', 'graphics clock', 'boost clock', 'core clock', 'base clock', 'clock speed',
      'memory clock speed', 'memory clock', 'clock',
      'memory bandwidth', 'bandwidth', 'memory bus',
      'tdp', 'power consumption', 'power', 'thermal',
      'process node', 'transistors', 'die size',
      'architecture', 'gpu architecture',
      'number of fans', 'fans', 'cooling',
      'display maximum resolution', 'display resolution maximum', 'max resolution', 'resolution',
      'video output interface', 'video outputs', 'outputs', 'ports',
      'graphics card interface', 'interface', 'pci',
      // Laptop specs
      'processor', 'cpu', 'chipset',
      'storage', 'ssd', 'hard drive', 'hdd',
      'display', 'screen', 'refresh rate',
      'battery', 'battery life',
      'operating system', 'os',
      'connectivity', 'ports',
      // NPU specs
      'ai performance', 'tops', 'npu', 'neural engine',
      'cores', 'threads',
      'cache',
      // Workstation specs
      'power supply', 'psu',
      'expansion slots',
      'form factor', 'chassis',
    ];

    // Primero agregar las specs en orden de prioridad
    for (const priorityKey of priorityOrder) {
      if (availableKeys.has(priorityKey)) {
        // Encontrar la key original (con case correcto)
        const originalKey = validProducts.flatMap(p => Object.keys(p.specs))
          .find(k => k.toLowerCase() === priorityKey);

        if (originalKey && !result.find(r => r.key.toLowerCase() === originalKey.toLowerCase())) {
          // Verificar exclusiones
          if (EXCLUDED_KEYS.some(excluded => originalKey.toLowerCase().includes(excluded))) continue;

          // Verificar que al menos un producto tenga un valor válido
          const hasValidValue = validProducts.some(p => {
            const value = p.specs[originalKey];
            return value && isValidSpecValue(String(value));
          });

          if (hasValidValue) {
            // Convertir a título legible
            const label = originalKey.split(/(?=[A-Z])/).join(' ').replace(/_/g, ' ');
            result.push({ key: originalKey, label: label.trim() });
          }
        }
      }
    }

    // Luego agregar el resto de specs que no están excluidas
    for (const key of availableKeys) {
      // Verificar exclusiones
      if (EXCLUDED_KEYS.some(excluded => key.includes(excluded))) continue;

      // Verificar si ya fue agregado
      if (result.find(r => r.key.toLowerCase() === key)) continue;

      // Encontrar la key original
      const originalKey = validProducts.flatMap(p => Object.keys(p.specs))
        .find(k => k.toLowerCase() === key);

      if (originalKey) {
        // Verificar que al menos un producto tenga un valor técnico válido
        const hasValidValue = validProducts.some(p => {
          const value = p.specs[originalKey];
          return value && isValidSpecValue(String(value));
        });

        if (hasValidValue) {
          const label = originalKey.split(/(?=[A-Z])/).join(' ').replace(/_/g, ' ');
          result.push({ key: originalKey, label: label.trim() });
        }
      }
    }

    return result;
  }, [validProducts]);

  // Veredicto final
  const verdict = useMemo(() => {
    if (validProducts.length < 2 || winnerIndex === undefined) return null;
    const winner = validProducts[winnerIndex];
    const loser = validProducts.find((_, i) => i !== winnerIndex);
    if (!winner || !loser) return null;

    const winnerScore = useCaseScores[winnerIndex];
    const loserScore = useCaseScores.find((_, i) => i !== winnerIndex) || 0;
    const diffPercent = Math.round(((winnerScore - loserScore) / Math.max(loserScore, 1)) * 100);

    return {
      winner,
      winnerScore,
      diffPercent,
      reasons: keyDifferences.slice(0, 3),
    };
  }, [validProducts, useCaseScores, winnerIndex, keyDifferences]);

  // Datos para gráfico de barras de specs principales (normalizados a porcentajes)
  const specChartData = useMemo(() => {
    if (validProducts.length < 2) return [];

    // Helpers internos para extraer los números
    const getNum = (p: any, keys: string[]) => {
      for (const k of keys) {
        const val = p.specs[k];
        if (val) {
          const num = parseFloat(String(val).replace(/[^0-9.]/g, ''));
          if (!isNaN(num)) return num;
        }
      }
      return 0;
    };

    const getVram = (p: any) => {
      const num = getNum(p, ['Graphics Card Ram', 'VRAM', 'Video Memory', 'Memory', 'vram', 'video memory', 'memoria']);
      if (num > 0) return num;
      const nameMatch = (p.name || '').match(/(\d+)\s*(?:gb|tb)\s*(?:gddr|memory|vram|hbm)/i) || (p.name || '').match(/(\d+)\s*gb/i);
      return nameMatch ? parseFloat(nameMatch[1]) : 0;
    };

    const metrics = [
      { key: 'vram', label: 'VRAM (GB)', getVal: getVram },
      { key: 'cuda', label: 'CUDA Cores', getVal: (p: any) => getNum(p, ['CUDA Cores', 'Cuda Cores', 'cuda cores', 'Stream Processors']) },
      { key: 'tensor', label: 'Tensor Cores', getVal: (p: any) => getNum(p, ['Tensor Cores', 'tensor cores', 'AI Cores']) },
      { key: 'tops', label: 'TOPS (AI)', getVal: (p: any) => getNum(p, ['TOPS', 'AI Performance', 'Neural Engine']) },
      { key: 'bandwidth', label: 'Bandwidth (GB/s)', getVal: (p: any) => getNum(p, ['Memory Bandwidth', 'Ancho de banda', 'Bandwidth', 'Memory Bus']) },
      { key: 'clock', label: 'Clock Speed', getVal: (p: any) => getNum(p, ['Boost Clock', 'Base Clock', 'Clock Speed', 'GPU Clock']) },
      { key: 'cores', label: 'CPU Cores', getVal: (p: any) => getNum(p, ['Cores', 'Number of Cores', 'CPU Cores']) },
      { key: 'threads', label: 'Threads', getVal: (p: any) => getNum(p, ['Threads', 'Number of Threads']) },
    ];

    const chartData: any[] = [];

    metrics.forEach(metric => {
      const vals = validProducts.map(p => metric.getVal(p));
      const hasValidValues = vals.some(v => v > 0);

      if (hasValidValues) {
        // Encontrar el máximo para normalizar a 100%
        const maxVal = Math.max(...vals);

        const dataPoint: any = { name: metric.label };
        validProducts.forEach((product, idx) => {
          const val = vals[idx] || 0;
          // Guardamos el valor relativo (0-100) para la gráfica, y el crudo para el tooltip
          dataPoint[`p${idx}`] = maxVal > 0 ? (val / maxVal) * 100 : 0;
          dataPoint[`p${idx}_raw`] = val;
        });
        chartData.push(dataPoint);
      }
    });

    return chartData;
  }, [validProducts]);

  // Datos para radar chart de casos de uso
  const radarChartData = useMemo(() => {
    if (validProducts.length < 2) return [];

    const useCaseKeys = Object.keys(USE_CASES) as UseCaseId[];

    return useCaseKeys.map(useCaseKey => {
      const dataPoint: any = {
        useCase: USE_CASES[useCaseKey].name,
        fullMark: 100,
      };

      validProducts.forEach((product, idx) => {
        const score = calculateUseCaseScore(product, useCaseKey);
        dataPoint[`p${idx}`] = score;
      });

      return dataPoint;
    });
  }, [validProducts]);

  // Colores para los gráficos (colores distintos por producto)
  const chartColors = ['#00e5ff', '#c026d3', '#10b981', '#f59e0b']; // Cyan, Fuchsia, Emerald, Amber
  const radarColors = ['rgba(0, 229, 255, 0.6)', 'rgba(192, 38, 211, 0.6)', 'rgba(16, 185, 129, 0.6)', 'rgba(245, 158, 11, 0.6)'];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-4 relative">
      <div className="bg-[#050505] border border-white/10 rounded-none shadow-2xl relative">

        {/* Unified Sticky Header */}
        <div className="sticky top-16 z-40 bg-[#050505] border-b border-white/10 pt-5 pb-5 px-4 sm:px-6 lg:px-8 rounded-none shadow-xl flex flex-col gap-5">

          {/* Title & Category + Use Case */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-zinc-800/50 pb-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-7 h-7 text-primary" />
                Hardware Matchup
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <UseCaseSelector value={useCase} onChange={setUseCase} />

              <div className="flex flex-wrap gap-2 flex-1 lg:flex-initial">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`font-heading px-3 py-1.5 rounded-none font-semibold text-xs sm:text-sm transition-all duration-300 ${activeCategory === cat.id
                      ? "bg-primary text-[#050505] shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                      : "bg-zinc-900/80 text-zinc-400 hover:text-primary hover:bg-zinc-800/80 border border-white/10"
                      }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {selectedProdIds.length < 4 && (
                <button
                  onClick={addProduct}
                  className="font-heading px-3 py-1.5 rounded-none font-semibold text-xs sm:text-sm transition-all duration-300 bg-zinc-900/80 text-primary hover:bg-primary/20 border border-primary/50 flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" /> Add
                </button>
              )}
            </div>
          </div>



          {/* Product Selectors Row */}
          <div className={`grid grid-cols-1 ${selectedProdIds.length === 4 ? 'lg:grid-cols-4 md:grid-cols-2' : selectedProdIds.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6 md:gap-0 md:divide-x divide-zinc-800/80`}>
            {selectedProdIds.map((prodId, idx) => {
              const product = selectedProducts[idx];
              return (
                <div key={`selector-${idx}`} className={`flex flex-col gap-3 ${idx === 0 ? 'md:pr-6' : idx === selectedProdIds.length - 1 ? 'md:pl-6' : 'md:px-6'}`}>
                  <div className="flex items-center gap-2">
                    <CustomSelect
                      value={prodId}
                      options={categoryProducts
                        .filter(p => p.id === prodId || !selectedProdIds.includes(p.id || ""))
                        .map(p => ({ id: p.id || "", name: p.name }))}
                      onChange={(val) => updateProduct(idx, val)}
                      placeholder="Select Product"
                    />
                    {selectedProdIds.length > 2 && (
                      <button onClick={() => removeProduct(idx)} className="p-2 border-2 border-red-500/50 hover:border-red-500 text-red-500 hover:bg-red-500/10 transition-colors h-[44px]">
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  {product && (
                    <div className="flex justify-between items-center bg-[#050505] p-2 rounded-none border border-white/10">
                      <div className="flex flex-col">
                        <span className="text-sm text-zinc-300 line-clamp-2">{decodeHtml(product.name)}</span>
                      </div>
                      <Link
                        href={product.amazon_url || "#"}
                        target="_blank"
                        className="font-heading inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-[#050505] py-1.5 px-4 rounded-none font-semibold transition-all shadow-[0_0_10px_rgba(0,229,255,0.3)] text-xs sm:text-sm"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span className="hidden xl:inline">Amazon</span>
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Placeholder Waiting State */}
        {!isReadyToCompare && (
          <div className="flex flex-col items-center justify-center py-24 text-center px-4">
             <div className="w-20 h-20 rounded-full bg-zinc-900/50 border border-white/5 flex items-center justify-center mb-6">
                <Search className="w-10 h-10 text-zinc-600 animate-pulse" />
             </div>
             <h3 className="text-2xl font-heading font-bold text-zinc-300 mb-3">
                Comparison Pending
             </h3>
             <p className="text-zinc-500 text-sm max-w-md mx-auto">
                Please select at least 2 products to unlock the detailed technical comparison, performance charts, and AI verdict.
             </p>
          </div>
        )}

        {isReadyToCompare && (
          <>
            {/* Veredicto Final */}
            {verdict && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-primary/30 p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <Trophy className="w-8 h-8 text-primary" />
              <div>
                <h2 className="text-xl font-bold font-heading text-white">
                  {verdict.diffPercent > 0 ? (
                    <>Verdict: <span className="text-primary">{decodeHtml(verdict.winner.name)}</span> is superior for {USE_CASES[useCase].name}</>
                  ) : (
                    <>Verdict: Tie for {USE_CASES[useCase].name}</>
                  )}
                </h2>
                <p className="text-sm text-zinc-400">
                  {verdict.diffPercent > 0 ? `The winner leads by ${verdict.diffPercent}% in performance metrics for this use case.` : 'Both products offer equivalent performance for your selected use case.'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {verdict.reasons.map((reason, i) => (
                <span key={i} className="text-xs bg-primary/10 border border-primary/30 text-primary px-3 py-1 rounded-full">
                  {reason}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Charts Section */}
        {validProducts.length >= 2 && specChartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-b border-white/10 p-6 lg:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold font-heading text-white">Performance Comparison</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart - Specs Principales */}
              <div className="bg-[#0a0a0a] border border-white/10 rounded-none p-4">
                <h3 className="text-sm font-heading text-zinc-400 uppercase tracking-wider mb-4">Key Specifications</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={specChartData} layout="vertical" margin={{ top: 0, right: 40, left: 120, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis type="number" domain={[0, 100]} hide stroke="#71717a" fontSize={11} tick={{ fill: '#71717a' }} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        stroke="#71717a"
                        fontSize={11}
                        width={110}
                        tick={{ fill: '#a1a1aa', fontSize: '11px' }}
                        interval={0}
                      />
                      <Tooltip
                        formatter={(value: any, name: any, props: any) => {
                          const dataKey = props.dataKey;
                          const rawValue = props.payload[`${dataKey}_raw`];
                          return [rawValue, name];
                        }}
                        contentStyle={{
                          backgroundColor: '#050505',
                          border: '1px solid #27272a',
                          borderRadius: '0',
                          fontSize: '12px',
                        }}
                        labelStyle={{ color: '#00e5ff', fontWeight: 'bold' }}
                      />
                      <Legend
                        content={() => {
                          return (
                            <ul className="flex flex-col gap-1.5 pt-4">
                              {validProducts.map((product, idx) => (
                                <li key={`legend-${idx}`} className="flex items-center gap-2 text-[11px] text-[#a1a1aa] font-medium">
                                  <span className="w-3 h-3 inline-block shrink-0" style={{ backgroundColor: chartColors[idx % chartColors.length] }}></span>
                                  <span className="truncate max-w-[280px]">
                                    {decodeHtml(product.name)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          );
                        }}
                      />
                      {validProducts.map((product, idx) => (
                        <Bar
                          key={`bar-${idx}`}
                          dataKey={`p${idx}`}
                          name={decodeHtml(product.name).length > 35 ? decodeHtml(product.name).substring(0, 35) + '...' : decodeHtml(product.name)}
                          fill={chartColors[idx % chartColors.length]}
                          radius={[0, 4, 4, 0]}
                          barSize={20}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Radar Chart - Use Cases */}
              <div className="bg-[#0a0a0a] border border-white/10 rounded-none p-4">
                <h3 className="text-sm font-heading text-zinc-400 uppercase tracking-wider mb-4">Use Case Performance</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="50%" data={radarChartData}>
                      <PolarGrid stroke="#27272a" />
                      <PolarAngleAxis
                        dataKey="useCase"
                        tick={{ fill: '#a1a1aa', fontSize: 9 }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{ fill: '#71717a', fontSize: 8 }}
                        axisLine={{ stroke: '#27272a' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#050505',
                          border: '1px solid #27272a',
                          borderRadius: '0',
                          fontSize: '11px',
                        }}
                        labelStyle={{ color: '#00e5ff', fontWeight: 'bold' }}
                      />
                      <Legend
                        content={() => {
                          return (
                            <ul className="flex flex-col gap-1.5 pt-4">
                              {validProducts.map((product, idx) => (
                                <li key={`legend-${idx}`} className="flex items-center gap-2 text-[11px] text-[#a1a1aa] font-medium">
                                  <span className="w-3 h-3 inline-block shrink-0" style={{ backgroundColor: chartColors[idx % chartColors.length] }}></span>
                                  <span className="truncate max-w-[280px]">
                                    {decodeHtml(product.name)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          );
                        }}
                      />
                      {validProducts.map((product, idx) => (
                        <Radar
                          key={`radar-${idx}`}
                          name={decodeHtml(product.name).length > 35 ? decodeHtml(product.name).substring(0, 35) + '...' : decodeHtml(product.name)}
                          dataKey={`p${idx}`}
                          stroke={chartColors[idx % chartColors.length]}
                          fill={radarColors[idx % radarColors.length]}
                          fillOpacity={0.5}
                          strokeWidth={2}
                        />
                      ))}
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Scrollable Content Area - Restructured for Perfect Alignment */}
        <div className="relative z-10">
          {/* Header Row: Image, Score, Tier for each product */}
          <div className={`grid grid-cols-1 ${selectedProdIds.length === 4 ? 'lg:grid-cols-4 md:grid-cols-2' : selectedProdIds.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} divide-y md:divide-y-0 md:divide-x divide-zinc-800/80`}>
            {selectedProdIds.map((prodId, idx) => {
              const product = selectedProducts[idx];
              const score = useCaseScores[idx];
              const tier = score ? assignTier(score) : "C";
              const tStyle = tierStyles[tier];
              const isWinner = idx === winnerIndex;

              return (
                <div key={`header-${idx}`} className="p-4 sm:p-6 lg:p-8 flex flex-col relative bg-transparent rounded-none">
                  <AnimatePresence mode="wait">
                    {product && (
                      <motion.div
                        key={product.id + "-header"}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col"
                      >
                        <div className={`aspect-[16/9] relative rounded-none overflow-hidden mb-4 bg-[#050505] border ${isWinner ? 'border-primary shadow-[0_0_20px_rgba(0,229,255,0.2)]' : 'border-white/10'} group transition-all duration-500`}>
                          <img src={product.image_url || "/images/GPU_1024.png"} alt={product.name} className="object-contain p-4 w-full h-full opacity-80 group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>

                          {isWinner && (
                            <div className="absolute top-3 left-3 bg-primary/20 border border-primary text-primary px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 font-heading backdrop-blur-sm z-10 shadow-[0_0_10px_rgba(0,229,255,0.3)]">
                              <Trophy className="w-3.5 h-3.5" /> Top Choice
                            </div>
                          )}

                          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end z-10">
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-heading mb-0.5">{USE_CASES[useCase].icon} Score</span>
                              <span className="text-2xl font-bold font-heading text-white leading-none">{score}</span>
                            </div>
                            <div className={`w-10 h-10 flex items-center justify-center rounded-none bg-[#050505]/80 backdrop-blur-sm border ${tStyle.border} ${tStyle.shadow}`}>
                              <span className={`text-xl font-bold font-heading ${tStyle.text}`}>{tier}</span>
                            </div>
                          </div>
                        </div>

                        <h3 className="font-heading font-bold text-lg mb-4 text-white line-clamp-2 min-h-[56px] flex items-center">{decodeHtml(product.name)}</h3>

                        <div className="mb-4 flex justify-between items-center">
                          {(() => {
                            const valueRating = calculateValueRating(score, product.price || 0);
                            return (
                              <div className={`inline-flex items-center px-3 py-1 rounded-none border ${valueRating.border} ${valueRating.bg}`}>
                                <span className={`font-heading text-xs uppercase tracking-wider font-semibold ${valueRating.color}`}>
                                  {valueRating.label}
                                </span>
                              </div>
                            )
                          })()}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Specs Rows - Each row spans all columns for perfect alignment */}
          <div className={`grid grid-cols-1 ${selectedProdIds.length === 4 ? 'lg:grid-cols-4 md:grid-cols-2' : selectedProdIds.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} divide-y md:divide-y-0 md:divide-x divide-zinc-800/80`}>
            {allSpecKeys.map((spec) => (
              // Render each spec row for all products side by side
              selectedProdIds.map((prodId, idx) => {
                const product = selectedProducts[idx];
                const isWinner = idx === winnerIndex;

                if (!product) {
                  return (
                    <div key={`${spec.key}-${idx}`} className="p-4 sm:p-6 lg:p-8 flex flex-col relative bg-transparent rounded-none">
                      {/* Empty cell to maintain grid layout */}
                    </div>
                  );
                }

                // Buscar el valor real en el producto
                let specValue: string = "N/A";
                const foundKey = Object.keys(product.specs).find(k => k.toLowerCase() === spec.key.toLowerCase());
                if (foundKey) {
                  const rawValue = product.specs[foundKey];
                  specValue = typeof rawValue === "string" ? rawValue : String(rawValue);
                }

                // Highlight best value for numeric specs
                const isBest = (() => {
                  if (specValue === "N/A") return false;
                  const numVal = parseFloat(String(specValue).replace(/[^0-9.]/g, ''));
                  if (isNaN(numVal)) return false;

                  // Buscar valores de otros productos para la misma spec
                  const otherValues = selectedProducts
                    .filter((_, i) => i !== idx)
                    .map(p => {
                      if (!p) return 0;
                      const vKey = Object.keys(p.specs).find(k => k.toLowerCase() === spec.key.toLowerCase());
                      const v = vKey ? p.specs[vKey] : undefined;
                      if (!v) return 0;
                      return parseFloat(String(v).replace(/[^0-9.]/g, '')) || 0;
                    });

                  const isLowerBetter = spec.key.toLowerCase().includes('power') || spec.key.toLowerCase().includes('watt') || spec.key.toLowerCase().includes('tdp');

                  if (isLowerBetter) {
                    const validOtherValues = otherValues.filter(v => v > 0);
                    return validOtherValues.length === 0 || numVal <= Math.min(...validOtherValues);
                  }

                  return otherValues.length === 0 || numVal >= Math.max(...otherValues);
                })();

                return (
                  <div key={`${spec.key}-${idx}`} className={`p-4 sm:p-6 lg:p-8 flex flex-col relative bg-transparent rounded-none`}>
                    <div className={`grid grid-cols-[120px_1fr] gap-3 items-start ${isBest ? 'bg-emerald-500/5 -mx-2 px-2 rounded border border-emerald-500/20' : ''}`}>
                      <span className="font-heading text-xs text-zinc-500 uppercase tracking-wider font-semibold pt-0.5">{spec.label}</span>
                      <div className={`text-sm font-medium bg-[#050505] px-3 py-2 rounded-none border ${isBest ? 'border-emerald-500/50 text-emerald-400' : 'border-white/10 text-zinc-200'} min-h-[40px] flex items-center`}>
                        {specValue === "N/A" ? (
                          <span className="text-zinc-600 italic font-normal">—</span>
                        ) : (
                          <>
                            {specValue}
                            {isBest && <Check className="inline w-3 h-3 ml-2 text-emerald-400" />}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ))}
          </div>

          {/* Pros, Cons, and CTA - Back to per-product layout */}
          <div className={`grid grid-cols-1 ${selectedProdIds.length === 4 ? 'lg:grid-cols-4 md:grid-cols-2' : selectedProdIds.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} divide-y md:divide-y-0 md:divide-x divide-zinc-800/80`}>
            {selectedProdIds.map((prodId, idx) => {
              const product = selectedProducts[idx];

              return (
                <div key={`footer-${idx}`} className="p-4 sm:p-6 lg:p-8 flex flex-col relative bg-transparent rounded-none">
                  <AnimatePresence mode="wait">
                    {product && (
                      <motion.div
                        key={product.id + "-footer"}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col h-full"
                      >
                        {/* Pros and Cons */}
                        <div className="flex flex-col gap-4 mb-6 border-t border-white/10 pt-4">
                          {product.pros && product.pros.length > 0 && (
                            <div>
                              <span className="font-heading text-xs text-emerald-400 uppercase tracking-wider font-semibold mb-2 block">Pros</span>
                              <ul className="space-y-2">
                                {product.pros.map((pro: string) => (
                                  <li key={pro} className="flex items-start gap-2 text-sm text-zinc-300">
                                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                    <span>{pro}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {product.cons && product.cons.length > 0 && (
                            <div>
                              <span className="font-heading text-xs text-red-400 uppercase tracking-wider font-semibold mb-2 block">Cons</span>
                              <ul className="space-y-2">
                                {product.cons.map((con: string) => (
                                  <li key={con} className="flex items-start gap-2 text-sm text-zinc-400">
                                    <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                    <span>{con}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        <div className="mt-auto">
                          <Link
                            href={`/product/${product.id}`}
                            className="font-heading block w-full text-center border-2 border-primary/50 hover:border-primary text-primary hover:bg-primary/10 py-3 font-semibold transition-all duration-300 text-sm uppercase tracking-wider"
                          >
                            View Full Details
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Price Disclaimer Footnote */}
        <div className="w-full px-4 sm:px-6 lg:px-8 pb-8 pt-4">
          <p className="text-[11px] text-zinc-500 text-center leading-relaxed max-w-4xl mx-auto">
            * Note: ROI calculations and comparisons use an estimated MSRP as a baseline. Actual Amazon prices fluctuate frequently. Check Amazon for the current exact price.
          </p>
        </div>
          </>
        )}
      </div>
    </div>
  );
}