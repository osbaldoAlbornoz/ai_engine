'use client';

import { useState } from 'react';
import { generateProductFaqs } from '@/data/seoData';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductFaqSchemaProps {
  productName: string;
  category: string;
  vram: string | number | null;
}

export function ProductFaqSchema({ productName, category, vram }: ProductFaqSchemaProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First one open by default
  const faqs = generateProductFaqs(productName, category, vram);

  return (
    <div className="mt-16">
      <div className="flex items-center gap-3 mb-8">
        <HelpCircle className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-white font-heading">Frequently Asked Questions</h2>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <div 
              key={index}
              className="bg-[#050505] border border-white/10 rounded-xl overflow-hidden transition-colors hover:border-white/20 shadow-[0_0_15px_rgba(0,0,0,0.3)]"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
              >
                <h3 className={`text-lg font-semibold font-heading pr-8 drop-shadow-md ${index % 2 === 0 ? 'text-primary' : 'text-accent'}`}>
                  {faq.question}
                </h3>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0 text-zinc-400"
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-6 pb-6 text-zinc-300 leading-relaxed border-t border-white/5 pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
