'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const examples = [
  {
    src: '/labels/bottle-front.png',
    label: 'Front view',
    caption: 'Brand face · logo & product',
    width: 1413,
    height: 1600,
  },
  {
    src: '/labels/bottle-back.png',
    label: 'Back view',
    caption: 'Ingredients · volume',
    width: 1428,
    height: 1600,
  },
  {
    src: '/labels/bottle-side.png',
    label: 'Side view',
    caption: 'Claims · barcode · distributor',
    width: 1435,
    height: 1600,
  },
] as const;

export function Examples() {
  return (
    <section className="bg-background px-6 py-24 md:px-10">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <h2 className="font-display text-3xl tracking-tight md:text-4xl">
            One seamless wrap
          </h2>
          <p className="mt-4 max-w-md text-muted leading-relaxed">
            Front branding, ingredients, and claims print as a continuous label
            around the full 200 mL bottle.
          </p>
        </motion.div>

        <div className="grid items-end gap-10 sm:grid-cols-3">
          {examples.map((ex, i) => (
            <motion.div
              key={ex.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              className="flex flex-col items-center"
            >
              <Image
                src={ex.src}
                alt={ex.label}
                width={ex.width}
                height={ex.height}
                sizes="280px"
                className="h-auto w-full max-w-[280px] object-contain"
              />
              <p className="mt-5 text-xs uppercase tracking-[0.16em] text-foreground">
                {ex.label}
              </p>
              <p className="mt-2 text-center text-sm text-muted">{ex.caption}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
