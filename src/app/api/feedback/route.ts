import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase, supabaseAdmin } from "@/lib/supabase";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { category, name, email, message } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const cleanCategory = category || "General Suggestion";
    const cleanName = name?.trim() || "Anonymous User";
    const cleanEmail = email?.trim() || "No email provided";
    const cleanMessage = message.trim();

    // 1. Send Email via Resend
    let emailSent = false;
    if (process.env.RESEND_API_KEY) {
      try {
        const destinationEmail = process.env.ALERT_EMAIL || "osbaldo.albornoz@gmail.com";
        await resend.emails.send({
          from: "The AI Engine Lab <onboarding@resend.dev>",
          to: destinationEmail,
          subject: `[User Feedback - ${cleanCategory}] from ${cleanName}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0b0f19; color: #ffffff; border-radius: 8px;">
              <h2 style="color: #00ffff; margin-top: 0;">New User Feedback Submitted</h2>
              <p><strong>Category:</strong> <span style="color: #ff00ff;">${cleanCategory}</span></p>
              <p><strong>Name:</strong> ${cleanName}</p>
              <p><strong>Email:</strong> ${cleanEmail}</p>
              <hr style="border: 1px solid #1f293d; margin: 20px 0;" />
              <p><strong>Message:</strong></p>
              <div style="background-color: #161e2e; padding: 15px; border-radius: 6px; border-left: 4px solid #00ffff; white-space: pre-wrap;">${cleanMessage}</div>
              <p style="font-size: 12px; color: #888; margin-top: 20px;">Sent from The AI Engine Lab website widget.</p>
            </div>
          `,
        });
        emailSent = true;
      } catch (emailErr) {
        console.error("Resend email failed:", emailErr);
      }
    }

    // 2. Save Feedback to Supabase (using service role to bypass RLS)
    const { error: dbError } = await supabaseAdmin.from("feedback").insert([
      {
        category: cleanCategory,
        name: cleanName,
        email: cleanEmail,
        message: cleanMessage,
        created_at: new Date().toISOString(),
      },
    ]);
    if (dbError) {
      console.error("Supabase insert error:", dbError.message, dbError.details);
    }

    return NextResponse.json({
      success: true,
      message: "Feedback submitted successfully",
      emailSent,
    });
  } catch (error: any) {
    console.error("Error handling feedback POST:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
