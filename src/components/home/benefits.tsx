'use client';

import { motion } from 'framer-motion';
import { getSiteConfigSync } from '@/lib/config/site';

export function Benefits() {
  const { benefits } = getSiteConfigSync();

  return (
    <section className="border-t border-border/60 bg-ivory px-6 py-24 md:px-10">
      <div className="mx-auto max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-display text-3xl tracking-tight md:text-4xl"
        >
          Why salons choose us
        </motion.h2>

        <ul className="mt-14 grid gap-12 md:grid-cols-2">
          {benefits.map((item, i) => (
            <motion.li
              key={item.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="border-t border-border/70 pt-8"
            >
              <h3 className="font-display text-xl">{item.title}</h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
                {item.description}
              </p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
