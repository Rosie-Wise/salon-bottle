'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getSiteConfigSync, DEFAULT_SITE_CONFIG } from '@/lib/config/site';
import type { SiteConfig } from '@/lib/types';

const STORAGE_KEY = 'rad-site-config';

function loadConfig(): SiteConfig {
  if (typeof window === 'undefined') return DEFAULT_SITE_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getSiteConfigSync();
    return { ...DEFAULT_SITE_CONFIG, ...JSON.parse(raw) };
  } catch {
    return getSiteConfigSync();
  }
}

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setConfig(loadConfig());
  }, []);

  function update<K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) {
    setConfig((c) => ({ ...c, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    setSaved(true);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-10 px-2 py-4">
      <header>
        <h1 className="font-display text-3xl tracking-tight">Site settings</h1>
        <p className="mt-2 text-sm text-muted">
          Configure order rules and public content. Pricing stays hidden until you
          set a price per bottle. Values save locally until Supabase site_settings
          is connected.
        </p>
      </header>

      <section className="space-y-5 border border-border/80 bg-ivory/40 p-6">
        <h2 className="text-xs uppercase tracking-[0.16em] text-muted">
          Ordering
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="minQty">Minimum quantity</Label>
            <Input
              id="minQty"
              type="number"
              min={1}
              value={config.minOrderQty}
              onChange={(e) => update('minOrderQty', Number(e.target.value) || 1)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inc">Quantity increment</Label>
            <Input
              id="inc"
              type="number"
              min={1}
              value={config.qtyIncrement}
              onChange={(e) => update('qtyIncrement', Number(e.target.value) || 1)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price per bottle</Label>
            <Input
              id="price"
              type="number"
              min={0}
              step="0.01"
              placeholder="Leave empty"
              value={config.pricePerBottle ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                update('pricePerBottle', v === '' ? null : Number(v));
              }}
            />
          </div>
        </div>
      </section>

      <section className="space-y-5 border border-border/80 bg-ivory/40 p-6">
        <h2 className="text-xs uppercase tracking-[0.16em] text-muted">
          Wrap-around label (200 mL bottle)
        </h2>
        <p className="text-sm text-muted">
          One label wraps the bottle. Front half is salon-custom; back half is
          the fixed ingredients panel. Safe area keeps text inside the blue box.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="wIn">Label size</Label>
            <Input id="wIn" defaultValue="5.34 in × 4.05 in" disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="safeIn">Safe area</Label>
            <Input id="safeIn" defaultValue="5.16 in × 3.87 in" disabled />
          </div>
        </div>
      </section>

      <section className="space-y-5 border border-border/80 bg-ivory/40 p-6">
        <h2 className="text-xs uppercase tracking-[0.16em] text-muted">
          Product blurbs
        </h2>
        <div className="space-y-2">
          <Label htmlFor="shampooDesc">Shampoo description</Label>
          <Textarea
            id="shampooDesc"
            rows={3}
            value={config.productInfo.shampoo.description}
            onChange={(e) =>
              update('productInfo', {
                ...config.productInfo,
                shampoo: {
                  ...config.productInfo.shampoo,
                  description: e.target.value,
                },
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="condDesc">Conditioner description</Label>
          <Textarea
            id="condDesc"
            rows={3}
            value={config.productInfo.conditioner.description}
            onChange={(e) =>
              update('productInfo', {
                ...config.productInfo,
                conditioner: {
                  ...config.productInfo.conditioner,
                  description: e.target.value,
                },
              })
            }
          />
        </div>
      </section>

      <div className="flex items-center gap-4">
        <Button type="button" onClick={handleSave}>
          Save settings
        </Button>
        {saved && (
          <p className="text-sm text-muted">Saved to this browser for now.</p>
        )}
      </div>
    </div>
  );
}
