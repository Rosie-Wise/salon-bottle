'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export function Cta() {
  return (
    <section className="bg-foreground px-6 py-24 text-background md:px-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.65 }}
        className="mx-auto flex max-w-6xl flex-col items-start gap-8 md:flex-row md:items-center md:justify-between"
      >
        <div className="max-w-xl">
          <h2 className="font-display text-3xl tracking-tight md:text-4xl">
            Ready when you are
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-background/75 md:text-base">
            Begin with your logo. We will meet you with clear defaults and room to
            refine until the label feels like your salon.
          </p>
        </div>
        <Button
          asChild
          size="lg"
          className="bg-background text-foreground hover:bg-cream"
        >
          <a href="#studio">Customize Your Bottle</a>
        </Button>
      </motion.div>
    </section>
  );
}
