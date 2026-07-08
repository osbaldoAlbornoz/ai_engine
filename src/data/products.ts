export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  affiliateUrl: string;
  brand: string;
  category: string;
  specs: {
    vram?: string;
    cudaCores?: number;
    tdp?: string;
    memory?: string;
    storage?: string;
    tops?: number;
    [key: string]: any;
  };
  rating?: number;
  reviewsCount?: number;
  isPopular?: boolean;
}

export const sampleProducts: Product[] = [
  // --- HIGH-END GPUs (70%) ---
  {
    id: "B0BHD8GQXD",
    title: "ASUS ROG Strix GeForce RTX 4090 OC Edition",
    description: "The ultimate AI and gaming GPU. Massive performance for deep learning models and 4K gaming.",
    price: 1999.99,
    imageUrl: "/images/GPU_1024.png", 
    affiliateUrl: "https://amazon.com/dp/B0BHD8GQXD?tag=aiengine-20",
    brand: "ASUS",
    category: "GPU",
    specs: {
      vram: "24GB GDDR6X",
      cudaCores: 16384,
      tdp: "450W",
    },
    rating: 4.8,
    reviewsCount: 1245,
    isPopular: true,
  },
  {
    id: "B0CSG8JXXS",
    title: "MSI GeForce RTX 4080 SUPER 16GB SUPRIM X",
    description: "Exceptional efficiency and AI rendering capabilities. Perfect for high-end workstations.",
    price: 1099.99,
    imageUrl: "/images/GPU_1024.png",
    affiliateUrl: "https://amazon.com/dp/B0CSG8JXXS?tag=aiengine-20",
    brand: "MSI",
    category: "GPU",
    specs: {
      vram: "16GB GDDR6X",
      cudaCores: 10240,
      tdp: "320W",
    },
    rating: 4.7,
    reviewsCount: 856,
  },
  {
    id: "B0CQPZJ6N5",
    title: "GIGABYTE GeForce RTX 4070 Ti SUPER AERO OC",
    description: "Great value for AI enthusiasts and creators. Sleek white design for modern builds.",
    price: 799.99,
    imageUrl: "/images/GPU_1024.png",
    affiliateUrl: "https://amazon.com/dp/B0CQPZJ6N5?tag=aiengine-20",
    brand: "GIGABYTE",
    category: "GPU",
    specs: {
      vram: "16GB GDDR6X",
      cudaCores: 8448,
      tdp: "285W",
    },
    rating: 4.6,
    reviewsCount: 412,
  },
  // --- ENTRY-LEVEL AI GPU (30% Volume Seller) ---
  {
    id: "B0C8ZMH6D3",
    title: "ASUS Dual GeForce RTX 4060 Ti 16GB Advanced Edition",
    description: "The most affordable way to get 16GB of VRAM for local LLMs and Stable Diffusion.",
    price: 499.99,
    imageUrl: "/images/GPU_1024.png",
    affiliateUrl: "https://amazon.com/dp/B0C8ZMH6D3?tag=aiengine-20",
    brand: "ASUS",
    category: "GPU",
    specs: {
      vram: "16GB GDDR6",
      cudaCores: 4352,
      tdp: "165W",
    },
    rating: 4.5,
    reviewsCount: 2150,
    isPopular: true,
  },

  // --- HIGH-END LAPTOPS (70%) ---
  {
    id: "B0CHX69389",
    title: "Apple MacBook Pro 16-inch (M3 Max)",
    description: "Incredible AI performance on the go with massive unified memory.",
    price: 3999.00,
    imageUrl: "/images/GPU_1024.png", 
    affiliateUrl: "https://amazon.com/dp/B0CHX69389?tag=aiengine-20",
    brand: "Apple",
    category: "Laptop",
    specs: {
      memory: "128GB Unified",
      storage: "4TB SSD",
      tops: 18,
    },
    rating: 4.9,
    reviewsCount: 320,
    isPopular: true,
  },
  {
    id: "B0CSX7R5P7",
    title: "Razer Blade 16 Gaming Laptop",
    description: "Desktop-grade AI power packed into a premium, CNC-milled aluminum chassis.",
    price: 4299.99,
    imageUrl: "/images/GPU_1024.png", 
    affiliateUrl: "https://amazon.com/dp/B0CSX7R5P7?tag=aiengine-20",
    brand: "Razer",
    category: "Laptop",
    specs: {
      vram: "16GB RTX 4090",
      memory: "64GB DDR5",
      storage: "2TB SSD",
    },
    rating: 4.4,
    reviewsCount: 112,
  },
  // --- ENTRY-LEVEL AI LAPTOP (30% Volume Seller) ---
  {
    id: "B0CVNLZCPF",
    title: "Acer Nitro V Gaming Laptop",
    description: "Amazon's best-selling budget gaming laptop, perfect for entry-level AI tasks.",
    price: 779.00,
    imageUrl: "/images/GPU_1024.png", 
    affiliateUrl: "https://amazon.com/dp/B0CVNLZCPF?tag=aiengine-20",
    brand: "Acer",
    category: "Laptop",
    specs: {
      vram: "8GB RTX 4060",
      memory: "16GB DDR5",
      storage: "512GB SSD",
    },
    rating: 4.6,
    reviewsCount: 4500,
    isPopular: true,
  },

  // --- NPUs & COPILOT+ PCs ---
  {
    id: "B0D1W7Y94B",
    title: "Microsoft Surface Laptop 7 (Snapdragon X Elite)",
    description: "The ultimate Copilot+ PC with a powerful NPU for real-time local AI processing.",
    price: 1499.00,
    imageUrl: "/images/GPU_1024.png",
    affiliateUrl: "https://amazon.com/dp/B0D1W7Y94B?tag=aiengine-20",
    brand: "Microsoft",
    category: "NPU",
    specs: {
      tops: 45,
      memory: "16GB LPDDR5x",
      storage: "512GB SSD"
    },
    rating: 4.5,
    reviewsCount: 85,
  },
  {
    id: "B0D18M7R3P",
    title: "ASUS Vivobook S 15 OLED",
    description: "Slim, light, and AI-ready with the latest Snapdragon X Elite processor.",
    price: 1299.00,
    imageUrl: "/images/GPU_1024.png",
    affiliateUrl: "https://amazon.com/dp/B0D18M7R3P?tag=aiengine-20",
    brand: "ASUS",
    category: "NPU",
    specs: {
      tops: 45,
      memory: "32GB LPDDR5x",
      storage: "1TB SSD"
    },
    rating: 4.4,
    reviewsCount: 156,
  },
  
  // --- WORKSTATION ---
  {
    id: "B0CJXK3LXB",
    title: "Apple Mac Studio (M2 Ultra)",
    description: "A compact powerhouse that developers use to run 70B parameter LLMs locally.",
    price: 3999.00,
    imageUrl: "/images/GPU_1024.png",
    affiliateUrl: "https://amazon.com/dp/B0CJXK3LXB?tag=aiengine-20",
    brand: "Apple",
    category: "Workstation", // New Category!
    specs: {
      memory: "64GB Unified",
      storage: "1TB SSD",
      tops: 31.6
    },
    rating: 4.8,
    reviewsCount: 230,
    isPopular: true,
  }
];
