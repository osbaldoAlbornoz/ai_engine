import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { z } from "zod";

// Schema de validación con Zod
const alertSchema = z.object({
  email: z.string().email("Invalid email address"),
  productId: z.string().min(10, "Invalid product ID (ASIN)"),
  productName: z.string().optional(),
  baselinePrice: z.number().positive().optional()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validar datos de entrada con Zod
    const validationResult = alertSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid data",
          details: validationResult.error.issues.map((issue) => ({
            field: String(issue.path.join('.')),
            message: issue.message
          }))
        },
        { status: 400 }
      );
    }
    
    const { email, productId, productName, baselinePrice } = validationResult.data;

    // Insert into Supabase table
    const { data, error } = await supabase
      .from("price_alerts")
      .insert([
        { 
          email, 
          product_id: productId, 
          product_name: productName || "",
          baseline_price: baselinePrice || null
        }
      ]);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to save alert" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Alert saved successfully", data },
      { status: 200 }
    );
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
