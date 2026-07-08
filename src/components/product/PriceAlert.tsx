"use client";

import { useState } from "react";
import { Bell, CheckCircle2, Mail, ArrowRight } from "lucide-react";

interface PriceAlertProps {
  productId: string;
  productName: string;
  baselinePrice?: number;
}

export function PriceAlert({ productId, productName, baselinePrice }: PriceAlertProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus("loading");
    
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, productId, productName, baselinePrice }),
      });

      if (!res.ok) throw new Error("Failed to save alert");
      
      setStatus("success");
      setTimeout(() => {
        setIsOpen(false);
        setStatus("idle");
        setEmail("");
      }, 3000);
    } catch (error) {
      console.error(error);
      setStatus("idle");
      alert("Failed to set alert. Please try again.");
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="group flex items-center justify-center gap-2 w-full sm:w-auto bg-[#050505] border border-primary/30 text-primary hover:bg-primary/10 px-6 py-4 font-heading font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-[0_0_15px_rgba(0,229,255,0.1)] hover:shadow-[0_0_25px_rgba(0,229,255,0.3)]"
      >
        <Bell className="w-5 h-5 group-hover:animate-bounce" />
        Price Drop Alert
      </button>
    );
  }

  return (
    <div className="w-full sm:w-[400px] bg-[#050505] border border-primary/30 p-4 rounded-sm animate-in fade-in slide-in-from-bottom-4 duration-300 relative overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,229,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,255,0.05)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />
      <div className="relative z-10">
      {status === "success" ? (
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-3" />
          <h4 className="text-white font-heading font-bold text-lg">Alert Set!</h4>
          <p className="text-zinc-400 text-sm mt-1">We'll email you when {productName} drops in price.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-4 h-4 text-primary" />
            <span className="text-white font-heading font-bold text-sm uppercase tracking-wider">Set Price Alert</span>
          </div>
          <p className="text-zinc-400 text-xs mb-1">Enter your email to get notified of price drops.</p>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="commander@example.com"
              required
              disabled={status === "loading"}
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary/50 text-white pl-10 pr-4 py-2.5 outline-none font-sans text-sm transition-colors disabled:opacity-50"
            />
          </div>
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={status === "loading"}
              className="flex-1 px-4 py-2 bg-zinc-900 text-zinc-400 hover:text-white font-heading text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={status === "loading"}
              className="flex-[2] flex items-center justify-center gap-2 bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-[#050505] font-heading font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
            >
              {status === "loading" ? (
                "Processing..."
              ) : (
                <>
                  Alert Me <ArrowRight className="w-3 h-3" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
      </div>
    </div>
  );
}
