'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative bg-background px-6 pb-16 pt-16 md:px-10 md:pb-20 md:pt-24">
      <div className="relative mx-auto max-w-3xl text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6 text-xs uppercase tracking-[0.28em] text-foreground"
        >
          RAD · QUAFFED
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-4xl leading-[1.12] tracking-tight text-foreground md:text-5xl lg:text-[3.25rem]"
        >
          Your Brand. Your Bottle.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-muted md:text-lg"
        >
          Create professional, salon-branded shampoo and conditioner, customized
          with your logo.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16 }}
          className="mt-10"
        >
          <Button asChild size="lg">
            <a href="#studio">Customize Your Bottle</a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
