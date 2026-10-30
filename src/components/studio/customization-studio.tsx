'use client';

import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import type { ProductType } from '@/lib/types';
import { buildLabelTexture } from '@/lib/bottle/build-label-texture';
import { StudioControls } from '@/components/studio/studio-controls';
import { StudioSummary } from '@/components/studio/studio-summary';

const Bottle3D = dynamic(
  () => import('@/components/studio/bottle-3d').then((m) => m.Bottle3D),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[420px] w-full items-center justify-center">
        <div className="h-56 w-28 animate-pulse rounded-[40%] bg-[#ebe6df]" />
      </div>
    ),
  },
);

export function CustomizationStudio() {
  const [productType, setProductType] = useState<ProductType>('shampoo');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFileName, setLogoFileName] = useState<string | null>(null);
  const [logoScale, setLogoScale] = useState(0.85);
  const [logoOffsetX, setLogoOffsetX] = useState(0);
  const [logoOffsetY, setLogoOffsetY] = useState(0);
  const [resetToken, setResetToken] = useState(0);

  const onLogoUpload = useCallback((dataUrl: string, fileName: string) => {
    setLogoUrl(dataUrl);
    setLogoFileName(fileName);
    setLogoScale(0.85);
    setLogoOffsetX(0);
    setLogoOffsetY(0);
  }, []);

  const onLogoRemove = useCallback(() => {
    setLogoUrl(null);
    setLogoFileName(null);
    setLogoScale(0.85);
    setLogoOffsetX(0);
    setLogoOffsetY(0);
  }, []);

  const onDownloadPreview = useCallback(async () => {
    try {
      const glCanvas = document.querySelector(
        '#studio-bottle-stage canvas',
      ) as HTMLCanvasElement | null;
      if (glCanvas && glCanvas.width > 0) {
        const url = glCanvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `quaffed-${productType}-preview.png`;
        a.click();
        return;
      }
      const canvas = await buildLabelTexture({
        productType,
        logoUrl,
        logoScale,
        logoOffsetX,
        logoOffsetY,
      });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `quaffed-${productType}-label-preview.png`;
      a.click();
    } catch {
      // retry quietly
    }
  }, [productType, logoUrl, logoScale, logoOffsetX, logoOffsetY]);

  return (
    <section
      id="studio"
      className="scroll-mt-20 border-t border-border/50 bg-background px-6 py-20 md:px-10 md:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center md:mb-16"
        >
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted">
            Customization studio
          </p>
          <h2 className="mt-3 font-display text-3xl tracking-tight md:text-4xl">
            Design your bottle
          </h2>
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-[minmax(240px,280px)_minmax(0,1fr)_minmax(220px,260px)] lg:items-start lg:gap-10 xl:gap-14">
          {/* Controls — below bottle on mobile */}
          <div className="order-2 lg:order-1">
            <StudioControls
              productType={productType}
              onProductChange={(t) => {
                setProductType(t);
                setResetToken((n) => n + 1);
              }}
              logoUrl={logoUrl}
              logoFileName={logoFileName}
              onLogoUpload={onLogoUpload}
              onLogoRemove={onLogoRemove}
              logoScale={logoScale}
              logoOffsetX={logoOffsetX}
              logoOffsetY={logoOffsetY}
              onLogoTransform={(partial) => {
                if (partial.logoScale !== undefined) setLogoScale(partial.logoScale);
                if (partial.logoOffsetX !== undefined)
                  setLogoOffsetX(partial.logoOffsetX);
                if (partial.logoOffsetY !== undefined)
                  setLogoOffsetY(partial.logoOffsetY);
              }}
              onResetPlacement={() => {
                setLogoScale(0.85);
                setLogoOffsetX(0);
                setLogoOffsetY(0);
              }}
              onResetFront={() => setResetToken((n) => n + 1)}
            />
          </div>

          {/* Bottle — first on mobile, center on desktop */}
          <div className="order-1 lg:order-2">
            <div
              id="studio-bottle-stage"
              className="relative mx-auto aspect-[3/5] w-full max-w-[340px] sm:max-w-[380px] lg:max-w-[440px] xl:max-w-[500px]"
            >
              <Bottle3D
                productType={productType}
                logoUrl={logoUrl}
                logoScale={logoScale}
                logoOffsetX={logoOffsetX}
                logoOffsetY={logoOffsetY}
                resetToken={resetToken}
                className="h-full"
              />
            </div>
            <p className="mt-5 text-center text-xs tracking-wide text-muted">
              Drag to rotate · Explore your bottle in 360°
            </p>
          </div>

          <div className="order-3 lg:sticky lg:top-24 lg:self-start">
            <StudioSummary
              productType={productType}
              logoUrl={logoUrl}
              logoFileName={logoFileName}
              onDownloadPreview={onDownloadPreview}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
