"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquareHeart, X, Send, CheckCircle2, 
  Lightbulb, HelpCircle, Bug, MessageCircle, Loader2 
} from "lucide-react";

type FeedbackCategory = "Feature Request" | "Hardware Question" | "Report a Bug" | "Other";

const CATEGORIES: { id: FeedbackCategory; label: string; icon: any }[] = [
  { id: "Feature Request", label: "Feature Request", icon: Lightbulb },
  { id: "Hardware Question", label: "Hardware Question", icon: HelpCircle },
  { id: "Report a Bug", label: "Report a Bug", icon: Bug },
  { id: "Other", label: "Other", icon: MessageCircle },
];

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<FeedbackCategory>("Feature Request");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, name, email, message }),
      });

      if (!res.ok) {
        throw new Error("Failed to send feedback");
      }

      setIsSuccess(true);
      setMessage("");
      setName("");
      setEmail("");
      
      // Auto close after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
        setIsOpen(false);
      }, 3000);

    } catch (err: any) {
      console.error(err);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-16 md:right-36 lg:right-48 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 bg-[#050505] border border-primary/40 text-primary hover:text-white hover:bg-primary/20 hover:border-primary px-4 py-3 rounded-full shadow-[0_0_20px_rgba(0,255,255,0.2)] backdrop-blur-md font-heading text-xs font-bold uppercase tracking-wider transition-all duration-300 group cursor-pointer"
          aria-label="Open feedback modal"
        >
          <div className="relative">
            <MessageSquareHeart className="w-5 h-5 group-hover:scale-110 transition-transform text-accent" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-ping" />
          </div>
          <span className="hidden sm:inline">Ideas</span>
        </motion.button>
      </div>

      {/* Modal Popup */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            {/* Click away overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-[#08080c] border border-white/15 rounded-2xl shadow-[0_0_50px_rgba(0,255,255,0.15)] p-6 md:p-8 overflow-hidden z-10 font-sans"
            >
              {/* Sci-fi Accent Glow Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="mb-6">
                <h3 className="text-xl md:text-2xl font-bold font-heading text-white flex items-center gap-2.5">
                  <MessageSquareHeart className="w-6 h-6 text-accent" />
                  Feedback & Suggestions
                </h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Have an idea, question, or feature request? We’d love to hear from you.
                </p>
              </div>

              {isSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-12 flex flex-col items-center justify-center text-center space-y-3"
                >
                  <div className="w-16 h-16 rounded-full bg-accent/20 border border-accent flex items-center justify-center text-accent">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold font-heading text-white">Thank You!</h4>
                  <p className="text-sm text-zinc-300 max-w-xs">
                    Your feedback has been submitted successfully. We appreciate your input!
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Category Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-heading font-semibold text-zinc-400 uppercase tracking-widest">
                      Feedback Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = category === cat.id;
                        return (
                          <button
                            type="button"
                            key={cat.id}
                            onClick={() => setCategory(cat.id)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-heading font-medium transition-all text-left ${
                              isSelected
                                ? "bg-primary/15 border-primary text-primary"
                                : "bg-white/5 border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-white/10"
                            }`}
                          >
                            <Icon className={`w-4 h-4 shrink-0 ${isSelected ? "text-primary" : "text-zinc-500"}`} />
                            <span>{cat.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Name & Email inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-heading text-zinc-400 uppercase tracking-wider">
                        Name <span className="text-zinc-600">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#030305] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-primary/60 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-heading text-zinc-400 uppercase tracking-wider">
                        Email <span className="text-zinc-600">(Optional, for reply)</span>
                      </label>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#030305] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-primary/60 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-heading text-zinc-400 uppercase tracking-wider">
                      Message <span className="text-accent">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Share your thoughts, suggestions, or hardware questions..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-[#030305] border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-primary/60 transition-colors resize-none"
                    />
                  </div>

                  {errorMessage && (
                    <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2.5 text-center">
                      {errorMessage}
                    </p>
                  )}

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !message.trim()}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary to-accent hover:opacity-90 disabled:opacity-50 text-black font-heading text-sm font-bold uppercase tracking-wider rounded-lg transition-all shadow-[0_0_20px_rgba(0,255,255,0.3)] cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Feedback</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
