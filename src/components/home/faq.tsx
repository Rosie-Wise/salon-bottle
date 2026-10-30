'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { getSiteConfigSync } from '@/lib/config/site';
import { cn } from '@/lib/utils';

export function Faq() {
  const { faqs } = getSiteConfigSync();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="border-t border-border/60 bg-background px-6 py-24 md:px-10">
      <div className="mx-auto max-w-3xl">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-display text-3xl tracking-tight md:text-4xl"
        >
          Questions
        </motion.h2>

        <ul className="mt-12 divide-y divide-border/80">
          {faqs.map((faq, index) => {
            const open = openIndex === index;
            return (
              <li key={faq.question}>
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-4 py-6 text-left"
                  onClick={() => setOpenIndex(open ? null : index)}
                  aria-expanded={open}
                >
                  <span className="font-display text-lg leading-snug">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      'mt-1 h-5 w-5 shrink-0 text-muted transition-transform',
                      open && 'rotate-180',
                    )}
                    strokeWidth={1.25}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 text-sm leading-relaxed text-muted">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
