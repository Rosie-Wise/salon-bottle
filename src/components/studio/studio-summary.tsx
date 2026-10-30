'use client';

import Link from 'next/link';
import { Download } from 'lucide-react';
import type { ProductType } from '@/lib/types';
import { PRODUCT_COPY } from '@/lib/sticker/defaults';
import { Button } from '@/components/ui/button';

export interface StudioSummaryProps {
  productType: ProductType;
  logoUrl: string | null;
  logoFileName: string | null;
  onDownloadPreview: () => void;
}

export function StudioSummary({
  productType,
  logoUrl,
  logoFileName,
  onDownloadPreview,
}: StudioSummaryProps) {
  const status = logoUrl ? 'Logo applied' : 'Awaiting logo';

  return (
    <div className="flex h-full flex-col">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Summary</p>
      <h3 className="mt-2 font-display text-xl tracking-tight">Your Design</h3>

      <dl className="mt-6 space-y-5 text-sm">
        <div>
          <dt className="text-[10px] uppercase tracking-[0.16em] text-muted">
            Product
          </dt>
          <dd className="mt-1.5 font-medium tracking-wide">
            {PRODUCT_COPY[productType].productName}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.16em] text-muted">
            Bottle size
          </dt>
          <dd className="mt-1.5">200 mL · 6.8 fl oz</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.16em] text-muted">
            Logo
          </dt>
          <dd className="mt-1.5 truncate">{logoFileName ?? 'None uploaded'}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.16em] text-muted">
            Status
          </dt>
          <dd className="mt-1.5">{status}</dd>
        </div>
      </dl>

      {logoUrl && (
        <div className="mt-6 flex h-24 items-center justify-center rounded-2xl border border-border bg-cream/60 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt="Logo preview"
            className="max-h-full max-w-full object-contain"
          />
        </div>
      )}

      <div className="mt-auto flex flex-col gap-3 pt-10">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={onDownloadPreview}
        >
          <Download className="h-4 w-4" strokeWidth={1.5} />
          Download Preview
        </Button>
        <Button asChild size="lg" className="w-full">
          <Link href="/create/upload">Finalize My Design</Link>
        </Button>
        <p className="text-center text-[11px] leading-relaxed text-muted">
          Your logo stays in this browser until you continue to finalize.
        </p>
      </div>
    </div>
  );
}
