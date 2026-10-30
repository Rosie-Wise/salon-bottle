'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { RotateCcw, Upload, X } from 'lucide-react';
import type { ProductType } from '@/lib/types';
import { PRODUCT_COPY } from '@/lib/sticker/defaults';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface StudioControlsProps {
  productType: ProductType;
  onProductChange: (type: ProductType) => void;
  logoUrl: string | null;
  logoFileName: string | null;
  onLogoUpload: (dataUrl: string, fileName: string) => void;
  onLogoRemove: () => void;
  logoScale: number;
  logoOffsetX: number;
  logoOffsetY: number;
  onLogoTransform: (partial: {
    logoScale?: number;
    logoOffsetX?: number;
    logoOffsetY?: number;
  }) => void;
  onResetPlacement: () => void;
  onResetFront: () => void;
}

const ACCEPT = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/svg+xml': ['.svg'],
  'image/webp': ['.webp'],
};

export function StudioControls({
  productType,
  onProductChange,
  logoUrl,
  logoFileName,
  onLogoUpload,
  onLogoRemove,
  logoScale,
  logoOffsetX,
  logoOffsetY,
  onLogoTransform,
  onResetPlacement,
  onResetFront,
}: StudioControlsProps) {
  const onDrop = useCallback(
    (files: File[]) => {
      const file = files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onLogoUpload(reader.result, file.name);
        }
      };
      reader.readAsDataURL(file);
    },
    [onLogoUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div className="flex h-full flex-col gap-8">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
          Step 1
        </p>
        <h3 className="mt-2 font-display text-xl tracking-tight">
          Choose Your Product
        </h3>
        <div className="mt-4 grid gap-2">
          {(['shampoo', 'conditioner'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onProductChange(type)}
              className={cn(
                'rounded-xl border px-4 py-3.5 text-left transition-all duration-200',
                productType === type
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-transparent text-foreground hover:border-foreground/40',
              )}
            >
              <span className="block text-sm font-medium tracking-wide">
                {PRODUCT_COPY[type].productName}
              </span>
              <span
                className={cn(
                  'mt-1 block text-xs',
                  productType === type ? 'text-background/70' : 'text-muted',
                )}
              >
                200 mL · 6.8 fl oz
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
          Step 2
        </p>
        <h3 className="mt-2 font-display text-xl tracking-tight">
          Upload Your Logo
        </h3>

        {!logoUrl ?
          <div
            {...getRootProps()}
            className={cn(
              'mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-12 transition-colors duration-200',
              isDragActive
                ? 'border-foreground bg-cream/80'
                : 'border-border hover:border-foreground/35 hover:bg-cream/40',
            )}
          >
            <input {...getInputProps()} aria-label="Upload salon logo" />
            <Upload className="mb-3 h-5 w-5 text-muted" strokeWidth={1.5} />
            <p className="text-sm font-medium">Upload Your Salon Logo</p>
            <p className="mt-2 text-center text-xs leading-relaxed text-muted">
              PNG, JPG, SVG, or WebP
              <br />
              Transparent backgrounds supported
            </p>
          </div>
        : <div className="mt-4 space-y-5">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-cream/50 px-3 py-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt="Uploaded logo"
                className="h-12 w-12 rounded-lg object-contain bg-white"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{logoFileName}</p>
                <p className="text-xs text-muted">On bottle front</p>
              </div>
              <button
                type="button"
                onClick={onLogoRemove}
                className="rounded-full p-2 text-muted transition-colors hover:bg-background hover:text-foreground"
                aria-label="Remove logo"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.16em] text-muted">
                Logo size
              </span>
              <input
                type="range"
                min={0.4}
                max={1.2}
                step={0.02}
                value={logoScale}
                onChange={(e) =>
                  onLogoTransform({ logoScale: Number(e.target.value) })
                }
                className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-foreground"
              />
            </label>

            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.16em] text-muted">
                Move vertical
              </span>
              <input
                type="range"
                min={-24}
                max={24}
                step={1}
                value={logoOffsetY}
                onChange={(e) =>
                  onLogoTransform({ logoOffsetY: Number(e.target.value) })
                }
                className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-foreground"
              />
            </label>

            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.16em] text-muted">
                Move horizontal
              </span>
              <input
                type="range"
                min={-24}
                max={24}
                step={1}
                value={logoOffsetX}
                onChange={(e) =>
                  onLogoTransform({ logoOffsetX: Number(e.target.value) })
                }
                className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-foreground"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={onResetPlacement}
              >
                Reset placement
              </Button>
              <div {...getRootProps()} className="inline-flex">
                <input {...getInputProps()} />
                <Button type="button" size="sm" variant="ghost">
                  Replace logo
                </Button>
              </div>
            </div>
          </div>
        }
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
          Step 3
        </p>
        <h3 className="mt-2 font-display text-xl tracking-tight">
          Preview Your Design
        </h3>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="secondary" onClick={onResetFront}>
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} />
            Front view
          </Button>
          {logoUrl && (
            <Button type="button" size="sm" variant="ghost" onClick={onLogoRemove}>
              Remove logo
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
