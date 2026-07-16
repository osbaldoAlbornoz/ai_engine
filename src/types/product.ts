/**
 * Product type definition for AI Engine
 * This type is used across the application for product data from Supabase
 */
export type Category = 'gpus' | 'laptops' | 'npus' | 'workstations';

export interface BenchmarkData {
  model: string;
  metric: string;
  value: number;
}

export interface Product {
  id?: string;
  amazon_asin?: string;
  name: string;
  description?: string;
  price: number;
  original_price?: number | null;
  imageUrl?: string;
  image_url?: string;
  affiliateUrl?: string;
  amazon_url?: string;
  brand: string;
  category: string;
  specs: {
    vram?: string;
    cudaCores?: number;
    tdp?: string;
    memory?: string;
    storage?: string;
    tops?: number;
    [key: string]: string | number | undefined;
  };
  features?: string[];
  pros?: string[];
  cons?: string[];
  rating?: number;
  reviewsCount?: number;
  isPopular?: boolean;
  status?: string;
  ai_score?: number;
}

export type HardwareProduct = Product;