'use client';

import { motion } from 'framer-motion';
import { getSiteConfigSync } from '@/lib/config/site';

export function ProductInfo() {
  const { productInfo, minOrderQty, qtyIncrement } = getSiteConfigSync();

  return (
    <section className="bg-cream px-6 py-24 md:px-10">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 max-w-lg"
        >
          <h2 className="font-display text-3xl tracking-tight md:text-4xl">
            The collection
          </h2>
          <p className="mt-4 text-sm text-muted">
            Orders from {minOrderQty} bottles, in increments of {qtyIncrement}.
          </p>
        </motion.div>

        <div className="grid gap-16 md:grid-cols-2">
          {(['shampoo', 'conditioner'] as const).map((key, i) => {
            const product = productInfo[key];
            return (
              <motion.article
                key={key}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.1 }}
              >
                <p className="text-xs uppercase tracking-[0.18em] text-muted">
                  {product.defaultVolume}
                </p>
                <h3 className="mt-2 font-display text-2xl">{product.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  {product.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
