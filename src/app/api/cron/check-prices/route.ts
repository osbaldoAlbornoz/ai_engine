import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";
import { ApifyClient } from "apify-client";

interface ApifyItem {
  asin?: string;
  url?: string;
  price?: { value?: number | string } | number | string;
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
  try {
    // 1. Verify authorization (optional, but good for Vercel Cron)
    const authHeader = request.headers.get("authorization");
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch alerts that haven't been notified yet (usamos supabaseAdmin para bypass RLS)
    const { data: alerts, error: fetchError } = await supabaseAdmin
      .from("price_alerts")
      .select("*")
      .eq("notified", false);

    if (fetchError) {
      console.error("Error fetching alerts:", fetchError);
      return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
    }

    if (!alerts || alerts.length === 0) {
      return NextResponse.json({ message: "No active alerts to check." });
    }

    const APIFY_TOKEN = process.env.APIFY_TOKEN;
    if (!APIFY_TOKEN) {
      console.error("Missing APIFY_TOKEN in environment");
      return NextResponse.json({ error: "Apify integration not configured" }, { status: 500 });
    }

    // 3. Prepare ASINs for Apify
    const uniqueAsins = [...new Set(alerts.map((a) => a.product_id).filter(Boolean))];
    if (uniqueAsins.length === 0) {
      return NextResponse.json({ message: "No valid ASINs found in alerts." });
    }

    console.log(`Starting Apify run for ASINs: ${uniqueAsins.join(", ")}`);
    
    const apifyClient = new ApifyClient({ token: APIFY_TOKEN });
    
    // Call the Amazon Product Scraper actor
    const run = await apifyClient.actor("junglee/amazon-crawler").call({
      categoryOrProductUrls: uniqueAsins.map((asin) => ({ url: `https://www.amazon.com/dp/${asin}` })),
      maxItemsPerStartUrl: 1,
      scrapeProductVariantPrices: false,
      scrapeCustomerReviews: false,
      scrapeProductDetails: true,
      proxy: {
        useApifyProxy: true,
        apifyProxyGroups: ["RESIDENTIAL"]
      }
    });

    console.log(`Apify run finished. Dataset ID: ${run.defaultDatasetId}`);
    
    // Fetch the results
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
    
    // Map results by ASIN for easy lookup
    const scrapedPrices = new Map<string, number>();
    for (const item of items) {
      const itemTyped = item as ApifyItem;
      // The actor returns price object or string depending on the item
      let priceVal: number | string = 0;
      if (typeof itemTyped.price === 'object' && itemTyped.price !== null) {
        priceVal = (itemTyped.price as { value?: number | string }).value || 0;
      } else if (itemTyped.price !== undefined) {
        priceVal = itemTyped.price;
      }
      const parsedPrice = typeof priceVal === 'string' ? parseFloat(priceVal.replace(/[^0-9.]/g, '')) : Number(priceVal);
      
      const itemAsin = (itemTyped.asin || "").toString();
      
      if (itemAsin && !isNaN(parsedPrice) && parsedPrice > 0) {
         scrapedPrices.set(itemAsin, parsedPrice);
      } else {
         // Fallback if actor doesn't expose clean ASIN: extract from URL
         const urlMatch = (itemTyped.url || "").match(/dp\/([A-Z0-9]{10})/i);
         if (urlMatch && !isNaN(parsedPrice) && parsedPrice > 0) {
            scrapedPrices.set(urlMatch[1], parsedPrice);
         }
      }
    }

    const notificationsSent = [];

    // 4. Process alerts with the scraped data
    for (const alert of alerts) {
      const targetPrice = alert.baseline_price || 0;
      const currentRealPrice = scrapedPrices.get(alert.product_id) || targetPrice;
      
      console.log(`Checking ${alert.product_id}: Target $${targetPrice}, Scraped $${currentRealPrice}`);

      // If price dropped below baseline
      if (currentRealPrice < targetPrice) {
        // 5. Send email via Resend
        try {
          await resend.emails.send({
            from: 'AiEngine Alerts <onboarding@resend.dev>',
            to: alert.email,
            subject: `🚨 Price Drop Alert: ${alert.product_name}`,
            html: `
              <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; background-color: #050505; color: #fff; padding: 20px; border: 1px solid #00e5ff;">
                <h2 style="color: #00e5ff; text-transform: uppercase;">Price Drop Detected!</h2>
                <p style="color: #ccc;">Great news! The hardware you were tracking has dropped in price.</p>
                
                <div style="background-color: #111; padding: 15px; margin: 20px 0; border-left: 4px solid #00e5ff;">
                  <h3 style="margin: 0 0 10px 0; color: #fff;">${alert.product_name}</h3>
                  <p style="margin: 0; color: #aaa;">Target Price: <span style="text-decoration: line-through;">$${targetPrice}</span></p>
                  <p style="margin: 5px 0 0 0; color: #00e5ff; font-size: 24px; font-weight: bold;">New Price: $${currentRealPrice}</p>
                </div>
                
                <a href="https://amazon.com/dp/${alert.product_id}?tag=tu-tag-de-afiliado" style="display: inline-block; background-color: #00e5ff; color: #050505; padding: 12px 24px; text-decoration: none; font-weight: bold; text-transform: uppercase; margin-top: 10px;">
                  Buy on Amazon Now
                </a>
              </div>
            `
          });
          
          console.log(`Email sent successfully to ${alert.email}`);
          
          // 6. Mark as notified in Supabase (usamos supabaseAdmin para bypass RLS)
          const { error: updateError } = await supabaseAdmin
            .from("price_alerts")
            .update({ notified: true })
            .eq("id", alert.id);

          if (updateError) {
            console.error(`Failed to update alert ${alert.id}:`, updateError);
          } else {
            notificationsSent.push({
              email: alert.email,
              product: alert.product_name,
              newPrice: currentRealPrice
            });
          }
        } catch (emailError) {
          console.error("Failed to send email to", alert.email, emailError);
        }
      }
    }

    return NextResponse.json(
      { message: "Cron job executed successfully", notificationsSent },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
