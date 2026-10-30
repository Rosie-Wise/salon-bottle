'use client';

import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    title: 'Choose your product',
    body: 'Select hydrating shampoo or conditioner — both 200 mL.',
  },
  {
    number: '02',
    title: 'Upload your logo',
    body: 'Place your salon logo on the front of a seamless wraparound label.',
  },
  {
    number: '03',
    title: 'Rotate & finalize',
    body: 'Explore your bottle in 360°, then download a preview or continue to order.',
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="border-t border-border/60 bg-cream px-6 py-24 md:px-10"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-16 max-w-lg"
        >
          <h2 className="font-display text-3xl tracking-tight md:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-muted leading-relaxed">
            Three simple steps from your logo to bottles that look unmistakably
            like your salon.
          </p>
        </motion.div>

        <div className="grid gap-12 md:grid-cols-3 md:gap-10">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <p className="text-xs tracking-[0.2em] text-muted">{step.number}</p>
              <h3 className="mt-4 font-display text-2xl tracking-tight">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
