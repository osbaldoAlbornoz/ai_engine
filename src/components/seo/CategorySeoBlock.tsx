'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { categorySeoContent } from '@/data/seoData';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

interface CategorySeoBlockProps {
  category: string;
}

export function CategorySeoBlock({ category }: CategorySeoBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const seoData = categorySeoContent[category.toLowerCase()];

  if (!seoData) return null;

  return (
    <div className="mt-20 border-t border-white/10 pt-12">
      <div className="max-w-4xl mx-auto bg-[#050505] border border-white/10 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-white font-heading">{seoData.title}</h2>
          </div>

          <div className="relative">
            <AnimatePresence initial={false}>
              <motion.div
                key="content"
                initial={false}
                animate={{ height: isExpanded ? 'auto' : '150px' }}
                className="overflow-hidden"
              >
                <div 
                  className="prose prose-invert prose-zinc max-w-none prose-headings:text-white prose-headings:font-heading prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-p:text-zinc-300 prose-p:leading-relaxed prose-li:text-zinc-300 prose-strong:text-fuchsia-400"
                  dangerouslySetInnerHTML={{ __html: seoData.content }}
                />
              </motion.div>
            </AnimatePresence>

            {/* Gradient Overlay when collapsed */}
            {!isExpanded && (
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none" />
            )}
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-6 flex items-center justify-center w-full py-3 gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-semibold text-white transition-colors"
          >
            {isExpanded ? (
              <>Show Less <ChevronUp className="w-4 h-4" /></>
            ) : (
              <>Read Full Guide <ChevronDown className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
