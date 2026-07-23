"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ProductDataClient } from "./ProductDataClient";

export function ProductClientLoader({ id }: { id: string }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchProduct() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();

        if (error || !data) {
          console.error("Error fetching product:", error);
          if (isMounted) setError(true);
          return;
        }
        
        if (isMounted) {
          data.name = data.clean_name || data.name;
          setProduct(data);
        }
      } catch (err) {
        console.error("Exception fetching product:", err);
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center gap-4 text-zinc-500 font-heading">
        <div className="w-12 h-12 border-4 border-fuchsia-500/20 border-t-fuchsia-500 rounded-full animate-spin" />
        <p className="animate-pulse">Loading AI analysis & specs...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center gap-4 text-zinc-500 font-heading">
        <p className="text-xl text-zinc-300">Product not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] pt-24 pb-12">
      <ProductDataClient product={product} />
    </div>
  );
}
