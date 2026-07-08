export type Category = "gpus" | "laptops" | "npus" | "workstations";

export interface StoreLink {
  name: string;
  url: string;
  price?: number;
  inStock?: boolean;
}

export interface BenchmarkData {
  model: string;
  metric: string;
  value: number;
}

export interface HardwareProduct {
  id: string;
  name: string;
  category: Category;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  amazonUrl: string;
  affiliateLinks?: StoreLink[];
  benchmarks?: BenchmarkData[];
  specs: {
    [key: string]: string;
  };
  keyFeatures: string[];
  pros?: string[];
  cons?: string[];
  tier?: "S" | "A" | "B" | "C";
  aiScore?: number;
  gallery?: string[];
}

export const hardwareData: HardwareProduct[] = [
  // GPUs
  {
    id: "gpu-rtx-4090",
    name: "NVIDIA GeForce RTX 4090 Founders Edition",
    category: "gpus",
    brand: "NVIDIA",
    price: 1599.99,
    originalPrice: 1799.99,
    image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=800",
    amazonUrl: "#",
    specs: {
      "Architecture": "Ada Lovelace",
      "VRAM": "24 GB GDDR6X",
      "CUDA Cores": "16384",
      "Boost Clock": "2.52 GHz",
      "TDP": "450W",
      "AI Performance": "1321 Tensor-FLOPs",
    },
    keyFeatures: ["Ultimate AI Training GPU", "DLSS 3.0", "Dual AV1 Encoders"],
    pros: ["Unbeatable training performance", "24GB VRAM for large models", "Dominant CUDA ecosystem"],
    cons: ["Prohibitive price", "Extremely high power consumption (450W)", "Massive physical footprint"],
    benchmarks: [
      { model: "Llama 3 8B (4-bit)", metric: "Tokens/sec", value: 130 },
      { model: "Llama 3 70B (4-bit)", metric: "Tokens/sec", value: 15 },
      { model: "Stable Diffusion XL", metric: "It/s", value: 12.5 }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1691515512702-86ee2b2ee20c?auto=format&fit=crop&q=80&w=800"
    ]
  },
  {
    id: "gpu-rtx-4080-super",
    name: "ASUS ROG Strix GeForce RTX 4080 SUPER",
    category: "gpus",
    brand: "ASUS",
    price: 999.99,
    image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=800",
    amazonUrl: "#",
    specs: {
      "Architecture": "Ada Lovelace",
      "VRAM": "16 GB GDDR6X",
      "CUDA Cores": "10240",
      "Boost Clock": "2.55 GHz",
      "TDP": "320W",
      "AI Performance": "836 Tensor-FLOPs",
    },
    keyFeatures: ["Great for LLM Inference", "Advanced Cooling", "Aura Sync RGB"],
    pros: ["Excellent power efficiency vs 4090", "Top-tier inference performance", "Full CUDA compatibility"],
    cons: ["16GB VRAM limits very large models", "High cost for not being the flagship"],
    benchmarks: [
      { model: "Llama 3 8B (4-bit)", metric: "Tokens/sec", value: 95 },
      { model: "Stable Diffusion XL", metric: "It/s", value: 8.2 }
    ],
  },
  {
    id: "gpu-rx-7900-xtx",
    name: "AMD Radeon RX 7900 XTX",
    category: "gpus",
    brand: "AMD",
    price: 949.99,
    originalPrice: 999.99,
    image: "https://images.unsplash.com/photo-1691515512702-86ee2b2ee20c?auto=format&fit=crop&q=80&w=800",
    amazonUrl: "#",
    specs: {
      "Architecture": "RDNA 3",
      "VRAM": "24 GB GDDR6",
      "Compute Units": "96",
      "Boost Clock": "2.50 GHz",
      "TDP": "355W",
      "AI Performance": "123 Tensor-FLOPs",
    },
    keyFeatures: ["Massive 24GB VRAM", "ROCm Support", "Great Value"],
    pros: ["24GB VRAM under $1000", "Excellent raw performance", "Great value for raw hardware"],
    cons: ["Software support (ROCm) still lags behind CUDA", "AI performance trails Nvidia"],
  },
  {
    id: "gpu-rtx-4070-ti-super",
    name: "MSI GeForce RTX 4070 Ti SUPER",
    category: "gpus",
    brand: "NVIDIA",
    price: 799.99,
    image: "https://images.unsplash.com/photo-1624699564887-a06f332ebbc5?auto=format&fit=crop&q=80&w=800",
    amazonUrl: "#",
    specs: {
      "Architecture": "Ada Lovelace",
      "VRAM": "16 GB GDDR6X",
      "CUDA Cores": "8448",
      "Boost Clock": "2.61 GHz",
      "TDP": "285W",
      "AI Performance": "706 Tensor-FLOPs",
    },
    keyFeatures: ["16GB VRAM Sweet Spot", "Efficient 285W TDP", "Perfect for Stable Diffusion"],
    pros: ["Sweet spot VRAM (16GB) for mid-level development", "Great power efficiency", "More accessible high-end price"],
    cons: ["Limited memory bus compared to 80/90 series", "Still relatively expensive"],
  },
  {
    id: "gpu-rtx-4060-ti-16gb",
    name: "GIGABYTE GeForce RTX 4060 Ti 16GB",
    category: "gpus",
    brand: "NVIDIA",
    price: 499.99,
    image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=800",
    amazonUrl: "#",
    specs: {
      "Architecture": "Ada Lovelace",
      "VRAM": "16 GB GDDR6",
      "CUDA Cores": "4352",
      "Boost Clock": "2.54 GHz",
      "TDP": "165W",
      "AI Performance": "353 Tensor-FLOPs",
    },
    keyFeatures: ["Budget 16GB VRAM", "Low Power Consumption", "Good for Beginners"],
    pros: ["Entry-level price for 16GB VRAM", "Very low power consumption", "Excellent starting point for generative AI"],
    cons: ["Weak compute performance", "128-bit memory bus reduces bandwidth"],
  },

  // Laptops
  {
    id: "laptop-macbook-m3-max",
    name: "Apple MacBook Pro 16\" (M3 Max)",
    category: "laptops",
    brand: "Apple",
    price: 3499.00,
    originalPrice: 3999.00,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800",
    amazonUrl: "#",
    specs: {
      "Processor": "M3 Max (16-core CPU)",
      "GPU": "40-core GPU",
      "Unified Memory": "128 GB",
      "Storage": "4TB NVMe SSD",
      "Display": "16.2\" Liquid Retina XDR",
      "Weight": "4.8 lbs",
    },
    keyFeatures: ["Run local LLMs efficiently", "Hardware-accelerated ray tracing", "Up to 22 hrs battery"],
    pros: ["Massive unified memory (128GB) ideal for giant models", "Best-in-class laptop power efficiency", "Highly optimized Apple Silicon ecosystem (MLX)"],
    cons: ["Extremely high price", "No CUDA support", "Non-upgradable memory"],
  },
  {
    id: "laptop-razer-blade-16",
    name: "Razer Blade 16 (2024)",
    category: "laptops",
    brand: "Razer",
    price: 2999.99,
    image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&q=80&w=800",
    amazonUrl: "#",
    specs: {
      "Processor": "Intel Core i9-14900HX",
      "GPU": "NVIDIA RTX 4090 (175W TGP)",
      "Memory": "32 GB DDR5-5600",
      "Storage": "2TB PCIe 4.0 SSD",
      "Display": "16\" Dual Mode Mini-LED",
      "Weight": "5.4 lbs",
    },
    keyFeatures: ["Desktop-grade AI power", "Vapor Chamber Cooling", "Anodized Aluminum CNC"],
    pros: ["Premium CNC aluminum build", "Desktop-grade GPU performance (RTX 4090)", "Excellent cooling for its size"],
    cons: ["Short battery life", "Very expensive", "Can run hot under sustained AI workloads"],
  },
  {
    id: "laptop-dell-xps-16",
    name: "Dell XPS 16 (2024)",
    category: "laptops",
    brand: "Dell",
    price: 2499.00,
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=800",
    amazonUrl: "#",
    specs: {
      "Processor": "Intel Core Ultra 9 185H",
      "GPU": "NVIDIA RTX 4070",
      "Memory": "64 GB LPDDR5x",
      "Storage": "1TB PCIe 4.0 SSD",
      "Display": "16.3\" OLED Touch",
      "Weight": "4.7 lbs",
    },
    keyFeatures: ["Intel NPU + NVIDIA GPU", "64GB RAM for large models", "Minimalist Design"],
    pros: ["Ultra-minimalist and elegant design", "Good NPU + GPU combination", "64GB RAM perfect for AI workloads"],
    cons: ["Zero-lattice keyboard can be polarizing", "Limited ports", "Lower TGP GPU limits raw power"],
  },
  {
    id: "laptop-lenovo-t14s",
    name: "Lenovo ThinkPad T14s Gen 6",
    category: "laptops",
    brand: "Lenovo",
    price: 1899.00,
    image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=80&w=800",
    amazonUrl: "#",
    specs: {
      "Processor": "Snapdragon X Elite",
      "GPU": "Adreno GPU",
      "Memory": "32 GB LPDDR5x",
      "Storage": "1TB PCIe 4.0 SSD",
      "Display": "14\" WUXGA Low Power",
      "Weight": "2.72 lbs",
    },
    keyFeatures: ["Copilot+ PC", "Multi-day battery", "Ultra-portable"],
    pros: ["Multi-day battery life", "Extremely lightweight and portable", "Excellent NPU for AI office tasks"],
    cons: ["No dedicated GPU", "Unsuitable for model training", "ARM architecture still faces Windows compatibility issues"],
  },
  {
    id: "laptop-asus-zephyrus-g14",
    name: "ASUS ROG Zephyrus G14 (2024)",
    category: "laptops",
    brand: "ASUS",
    price: 1999.99,
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=800",
    amazonUrl: "#",
    specs: {
      "Processor": "AMD Ryzen 9 8945HS",
      "GPU": "NVIDIA RTX 4070",
      "Memory": "32 GB LPDDR5X",
      "Storage": "1TB PCIe 4.0 SSD",
      "Display": "14\" 3K OLED 120Hz",
      "Weight": "3.31 lbs",
    },
    keyFeatures: ["Built-in Ryzen AI", "OLED Display", "Ultra-lightweight"],
    pros: ["Top-tier OLED display", "Excellent portability-to-power ratio", "Good price point for an RTX 4070"],
    cons: ["Soldered, non-upgradable memory", "Wattage-limited RTX 4070", "Loud fan noise under load"],
  },
  {
    id: "laptop-msi-titan-18",
    name: "MSI Titan 18 HX",
    category: "laptops",
    brand: "MSI",
    price: 4999.00,
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=800",
    amazonUrl: "#",
    specs: {
      "Processor": "Intel Core i9-14900HX",
      "GPU": "NVIDIA RTX 4090 (175W)",
      "Memory": "128 GB DDR5",
      "Storage": "4TB PCIe 4.0 SSD",
      "Display": "18\" 4K Mini-LED 120Hz",
      "Weight": "7.93 lbs",
    },
    keyFeatures: ["Desktop Replacement", "Massive 128GB RAM", "Peak AI Performance"],
    pros: ["128GB RAM in a laptop form factor", "Desktop-equivalent performance", "Spectacular Mini-LED display"],
    cons: ["Heavy and barely portable (almost 8 lbs)", "Requires a massive power supply", "Exorbitant price"],
  },

  // NPUs / Processors
  {
    id: "npu-snapdragon-x-elite",
    name: "Qualcomm Snapdragon X Elite",
    category: "npus",
    brand: "Qualcomm",
    price: 0, // Usually integrated
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800",
    amazonUrl: "#",
    specs: {
      "Architecture": "Oryon CPU + Hexagon NPU",
      "Cores": "12 Cores up to 3.8 GHz",
      "AI Performance": "45 TOPS (NPU alone)",
      "Total AI TOPS": "75 TOPS (CPU+GPU+NPU)",
      "Memory Bandwidth": "135 GB/s",
      "Process Node": "4nm",
    },
    keyFeatures: ["Generative AI on-device", "Exceptional efficiency", "Windows 11 AI+ Ready"],
    pros: ["Efficiency revolution for Windows", "Very powerful NPU (45 TOPS)", "Excellent for thin and light laptops"],
    cons: ["ARM architecture may face legacy x86 compatibility issues", "Weak integrated graphics for gaming"],
  },
  {
    id: "npu-amd-ryzen-8040",
    name: "AMD Ryzen 9 8945HS",
    category: "npus",
    brand: "AMD",
    price: 0,
    image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&q=80&w=800",
    amazonUrl: "#",
    specs: {
      "Architecture": "Zen 4 + XDNA NPU",
      "Cores": "8 Cores / 16 Threads",
      "AI Performance": "16 TOPS (NPU alone)",
      "Total AI TOPS": "39 TOPS",
      "Base Clock": "4.0 GHz",
      "Process Node": "4nm",
    },
    keyFeatures: ["Ryzen AI built-in", "Radeon 780M Graphics", "Power efficient"],
    pros: ["Excellent integrated graphics (780M)", "Solid and compatible x86 architecture", "Great multi-core performance"],
    cons: ["NPU (16 TOPS) falls short of Copilot+ requirements", "Consumes more power than ARM chips"],
  },
  {
    id: "npu-intel-core-ultra-9",
    name: "Intel Core Ultra 9 185H",
    category: "npus",
    brand: "Intel",
    price: 0,
    image: "https://images.unsplash.com/photo-1628126235206-5260b9ea6441?auto=format&fit=crop&q=80&w=800",
    amazonUrl: "#",
    specs: {
      "Architecture": "Meteor Lake (CPU+GPU+NPU)",
      "Cores": "16 Cores / 22 Threads",
      "AI Performance": "11 TOPS (NPU)",
      "Total AI TOPS": "34 TOPS (CPU+GPU+NPU)",
      "Max Turbo": "5.1 GHz",
      "Process Node": "Intel 4",
    },
    keyFeatures: ["First Intel NPU", "Arc Graphics", "AI PC Era"],
    pros: ["New Arc integrated graphics far superior to Iris Xe", "Guaranteed x86 compatibility", "Good thermal management"],
    cons: ["First-gen NPU is relatively weak (11 TOPS)", "Inconsistent baseline performance across some laptops"],
  },
  {
    id: "npu-apple-m4",
    name: "Apple M4",
    category: "npus",
    brand: "Apple",
    price: 0,
    image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=800",
    amazonUrl: "#",
    specs: {
      "Architecture": "ARM v9",
      "Cores": "10-core CPU",
      "AI Performance": "38 TOPS (Neural Engine)",
      "Total AI TOPS": "38 TOPS",
      "Memory Bandwidth": "120 GB/s",
      "Process Node": "3nm",
    },
    keyFeatures: ["Fastest Neural Engine", "Incredible Efficiency", "Second-gen 3nm"],
    pros: ["The king of thermal efficiency (3nm)", "38 TOPS Neural Engine (NPU), ready for Apple Intelligence", "Extremely high memory bandwidth (120 GB/s)"],
    cons: ["Closed Apple ecosystem", "Hardware upgrades are impossible"],
  },
  {
    id: "npu-intel-core-ultra-7",
    name: "Intel Core Ultra 7 155H",
    category: "npus",
    brand: "Intel",
    price: 0,
    image: "https://images.unsplash.com/photo-1628126235206-5260b9ea6441?auto=format&fit=crop&q=80&w=800",
    amazonUrl: "#",
    specs: {
      "Architecture": "Meteor Lake",
      "Cores": "16 Cores / 22 Threads",
      "AI Performance": "11 TOPS (NPU)",
      "Total AI TOPS": "34 TOPS (CPU+GPU+NPU)",
      "Max Turbo": "4.8 GHz",
      "Process Node": "Intel 4",
    },
    keyFeatures: ["Mainstream AI PC", "High Efficiency", "Integrated Arc GPU"],
    pros: ["Excellent overall balance", "Good integrated GPU for accelerating graphical AI", "Improved power consumption"],
    cons: ["Same NPU limitations as the Ultra 9 version", "AI leans more on the GPU than the NPU"],
  },

  // Workstations
  {
    id: "ws-lenovo-thinkstation-p620",
    name: "Lenovo ThinkStation P620",
    category: "workstations",
    brand: "Lenovo",
    price: 3499.00,
    image: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&q=80&w=800",
    amazonUrl: "#",
    specs: {
      "Processor": "AMD Ryzen Threadripper PRO 5945WX",
      "GPU": "NVIDIA RTX A4000 16GB",
      "Memory": "64GB DDR4 ECC",
      "Storage": "1TB PCIe 4.0 NVMe",
      "Power Supply": "1000W 92%",
    },
    keyFeatures: ["Threadripper PRO", "ECC Memory", "Enterprise Reliability"],
    pros: ["Incredible multi-core performance", "ECC memory for error-free training runs", "Easy to upgrade with more GPUs"],
    cons: ["Very large and heavy", "Expensive for entry-level"],
  },
  {
    id: "ws-hp-z8-g4",
    name: "HP Z8 G4 Workstation",
    category: "workstations",
    brand: "HP",
    price: 4999.00,
    image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=800",
    amazonUrl: "#",
    specs: {
      "Processor": "Dual Intel Xeon Silver 4214",
      "GPU": "NVIDIA RTX A5000 24GB",
      "Memory": "128GB DDR4 ECC",
      "Storage": "2TB PCIe NVMe SSD",
      "Power Supply": "1125W",
    },
    keyFeatures: ["Dual Xeon Processors", "24GB VRAM GPU", "Tool-less chassis"],
    pros: ["Dual CPUs handle massive datasets effortlessly", "RTX A5000 is perfect for heavy AI inference/training", "Extremely expandable"],
    cons: ["High power consumption", "Enterprise pricing"],
  },
];
