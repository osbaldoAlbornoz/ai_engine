import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { email, productId, productName, baselinePrice } = await request.json();

    if (!email || !productId) {
      return NextResponse.json(
        { error: "Email and productId are required" },
        { status: 400 }
      );
    }

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
