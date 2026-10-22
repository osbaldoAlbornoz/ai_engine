"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Copy, Check, Mail, X } from "lucide-react";

interface ProductShareWidgetProps {
  product: {
    id?: string;
    name: string;
    brand?: string;
    category?: string;
    aiScore?: number;
    image_url?: string;
    image?: string;
    gallery?: string[];
  };
  mode?: "all" | "inline" | "floating";
  className?: string;
}

export function ProductShareWidget({
  product,
  mode = "all",
  className = "",
}: ProductShareWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const directUrl = product.id
        ? `${window.location.origin}/product/${product.id}`
        : window.location.href;
      setShareUrl(directUrl);
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        setCanNativeShare(true);
      }
    }
  }, [product.id]);

  const shareTitle = `Check out ${product.name} on The AI Engine Lab!`;
  const shareText = `Check out ${product.name}${
    product.aiScore ? ` (AI Score: ${product.aiScore})` : ""
  } on The AI Engine Lab:`;

  const handleNativeShare = async () => {
    if (canNativeShare) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl || window.location.href,
        });
        return true;
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Error sharing:", err);
        }
      }
    }
    return false;
  };

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const handleCopy = async () => {
    const targetUrl = shareUrl || window.location.href;
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      const input = document.createElement("input");
      input.value = targetUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const previewImage =
    product.image_url ||
    product.image ||
    (product.gallery && product.gallery[0]) ||
    "/images/GPU_1024.png";

  const showInline = mode === "all" || mode === "inline";
  const showFloating = mode === "all" || mode === "floating";

  return (
    <>
      {/* 1. INLINE TRIGGER BUTTON (Placed next to CTA) */}
      {showInline && (
        <button
          type="button"
          onClick={handleOpenModal}
          aria-label="Share product details"
          className={`group relative inline-flex items-center justify-center gap-2.5 px-6 py-4 bg-[#050505] border border-cyan-400/50 text-white hover:text-[#050505] overflow-hidden font-heading font-bold text-sm md:text-base uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:shadow-[0_0_35px_rgba(6,182,212,0.5)] cursor-pointer ${className}`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:10px_10px] opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none" />
          <Share2 className="w-5 h-5 relative z-10 text-cyan-400 group-hover:text-[#050505] group-hover:rotate-12 transition-all duration-300" />
          <span className="relative z-10">Share</span>
          <div className="absolute inset-0 border border-transparent group-hover:border-white/20 transition-colors z-20 pointer-events-none" />
        </button>
      )}

      {/* 2. FLOATING TRIGGER BUTTON (Positioned directly above the IDEAS button) */}
      {showFloating && (
        <div className="fixed bottom-20 right-16 md:right-36 lg:right-48 z-50">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenModal}
            className="flex items-center gap-2.5 bg-[#050505] border border-cyan-400/50 text-cyan-300 hover:text-white hover:bg-cyan-500/20 hover:border-cyan-300 px-4 py-3 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.25)] backdrop-blur-md font-heading text-xs font-bold uppercase tracking-wider transition-all duration-300 group cursor-pointer"
            aria-label="Share product link"
          >
            <div className="relative">
              <Share2 className="w-5 h-5 group-hover:scale-110 group-hover:rotate-12 transition-transform text-cyan-400 group-hover:text-cyan-200" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
            </div>
            <span className="hidden sm:inline">Share</span>
          </motion.button>
        </div>
      )}

      {/* 3. MODAL POPUP */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            {/* Click away overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal Content Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              className="relative w-full max-w-md bg-[#08080c] border border-cyan-500/30 rounded-2xl shadow-[0_0_60px_rgba(6,182,212,0.25)] p-6 md:p-7 overflow-hidden z-10 font-sans"
            >
              {/* Sci-fi Accent Glow Top Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-cyan-500" />

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-heading text-white">Share Hardware</h3>
                  <p className="text-xs text-zinc-400">Share this device with your network or team</p>
                </div>
              </div>

              {/* Mini Preview Card */}
              <div className="flex items-center gap-3.5 p-3 mb-5 rounded-xl bg-[#030305] border border-zinc-800/80">
                <img
                  src={previewImage}
                  alt={product.name}
                  className="w-14 h-14 object-contain rounded-lg bg-black/60 p-1 border border-zinc-800 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {product.brand && (
                      <span className="text-[10px] font-heading px-2 py-0.5 bg-zinc-900 border border-fuchsia-500/40 text-fuchsia-400 uppercase tracking-wider">
                        {product.brand}
                      </span>
                    )}
                    {product.aiScore !== undefined && product.aiScore !== null && (
                      <span className="text-[10px] font-heading px-2 py-0.5 bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold uppercase tracking-wider shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                        AI Score: {product.aiScore}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-white truncate font-heading">
                    {product.name}
                  </p>
                </div>
              </div>

              {/* Native Mobile Share Button (if supported) */}
              {canNativeShare && (
                <button
                  onClick={handleNativeShare}
                  className="w-full flex items-center justify-center gap-2.5 mb-3.5 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/40 text-cyan-300 hover:text-white hover:bg-cyan-500/30 font-heading text-xs uppercase tracking-wider font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)] cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-cyan-400" />
                  <span>Open System Share Menu</span>
                </button>
              )}

              {/* Social Channels: WhatsApp & Email (Direct product link) */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {/* WhatsApp */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    shareText + " " + (shareUrl || (typeof window !== "undefined" ? window.location.href : ""))
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-[#25D366]/60 hover:bg-[#25D366]/15 text-zinc-200 hover:text-[#25D366] transition-all group cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(37,211,102,0.2)]"
                >
                  <svg className="w-5 h-5 text-[#25D366] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.477-.15-.678.15-.2.301-.778.979-.954 1.18-.176.2-.352.225-.653.075-1.378-.69-2.277-1.232-3.18-2.784-.239-.41.239-.382.684-1.272.075-.15.038-.282-.019-.395-.056-.113-.678-1.635-.93-2.24-.245-.588-.494-.509-.678-.518l-.578-.01c-.2 0-.527.075-.803.376-.276.301-1.054 1.03-1.054 2.511s1.08 2.909 1.23 3.11c.15.2 2.126 3.246 5.151 4.553 2.158.932 2.997.904 4.07.741 1.073-.162 2.378-.972 2.716-1.91.338-.938.338-1.742.238-1.91-.1-.168-.3-.263-.6-.413zM12.04 2C6.51 2 2.03 6.48 2.03 12.01c0 1.97.57 3.81 1.56 5.37L2 22l4.77-1.54c1.5 1.02 3.32 1.55 5.27 1.55 5.53 0 10.01-4.48 10.01-10.01C22.05 6.48 17.57 2 12.04 2z" />
                  </svg>
                  <span className="text-xs font-heading font-bold uppercase tracking-wider">WhatsApp</span>
                </a>

                {/* Email */}
                <a
                  href={`mailto:?subject=${encodeURIComponent(
                    product.name + " - The AI Engine Lab"
                  )}&body=${encodeURIComponent(
                    shareText + "\n\n" + (shareUrl || (typeof window !== "undefined" ? window.location.href : ""))
                  )}`}
                  className="flex items-center justify-center gap-2.5 p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-cyan-400/60 hover:bg-cyan-500/15 text-zinc-200 hover:text-cyan-300 transition-all group cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                >
                  <Mail className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span className="text-xs font-heading font-bold uppercase tracking-wider">Email</span>
                </a>
              </div>

              {/* Copy Direct Link */}
              <div>
                <label className="block text-[11px] font-heading uppercase tracking-wider text-zinc-400 mb-2">
                  Direct Link
                </label>
                <div className="flex items-center gap-2 p-1.5 bg-black border border-zinc-800 rounded-xl focus-within:border-cyan-500/60 transition-colors">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="w-full bg-transparent px-2.5 text-xs text-zinc-300 outline-none truncate font-mono select-all"
                  />
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-bold uppercase transition-all shrink-0 cursor-pointer ${
                      copied
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                        : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 hover:text-white"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
