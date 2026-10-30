'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { DesignConfig } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const STATUSES = [
  'New',
  'Design Review',
  'Confirmed',
  'In Production',
  'Ready',
  'Shipped',
  'Completed',
  'Cancelled',
] as const;

interface OrderDetailClientProps {
  order: {
    id: string;
    status: string;
    shampoo_qty: number;
    conditioner_qty: number;
    total_qty: number;
    notes?: string | null;
    customer_snapshot?: Record<string, unknown>;
  };
}

function printUrl(designId: string, config: DesignConfig, logoUrl: string | null) {
  const params = new URLSearchParams({
    config: JSON.stringify(config),
  });
  if (logoUrl) params.set('logoUrl', logoUrl);
  return `/api/print/${designId}?${params.toString()}`;
}

export function OrderDetailClient({ order }: OrderDetailClientProps) {
  const [status, setStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const snapshot = order.customer_snapshot ?? {};
  const shampooConfig = snapshot.shampooConfig as DesignConfig | undefined;
  const conditionerConfig = snapshot.conditionerConfig as DesignConfig | null | undefined;
  const logoHint = typeof snapshot.logoDataUrl === 'string' ? snapshot.logoDataUrl : null;

  async function saveStatus() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error ?? 'Update failed.');
      }
      setMessage('Status updated.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Update failed.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="font-mono text-lg tracking-tight md:text-2xl">{order.id}</h1>
        <Link href="/admin/orders" className="text-sm text-muted hover:text-foreground">
          ← All orders
        </Link>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wider text-muted">Shampoo</dt>
          <dd className="mt-1 tabular-nums">{order.shampoo_qty}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-muted">Conditioner</dt>
          <dd className="mt-1 tabular-nums">{order.conditioner_qty}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-muted">Total</dt>
          <dd className="mt-1 tabular-nums">{order.total_qty}</dd>
        </div>
        {order.notes && (
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wider text-muted">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap">{order.notes}</dd>
          </div>
        )}
      </dl>

      <div className="max-w-xs space-y-3">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="flex h-11 w-full border border-border bg-ivory px-4 text-sm"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <Button type="button" disabled={saving} onClick={saveStatus}>
          {saving ? 'Saving…' : 'Update status'}
        </Button>
        {message && <p className="text-sm text-muted">{message}</p>}
      </div>

      <section className="space-y-4">
        <h2 className="font-display text-xl">Print files</h2>
        <p className="text-sm text-muted">
          Download production SVG proofs when design configs were included in the
          order snapshot.
        </p>
        <div className="flex flex-wrap gap-3">
          {shampooConfig && (
            <Button asChild variant="secondary" size="sm">
              <a
                href={printUrl(`${order.id}-shampoo`, shampooConfig, logoHint)}
                download
              >
                Shampoo SVG
              </a>
            </Button>
          )}
          {conditionerConfig && (
            <Button asChild variant="secondary" size="sm">
              <a
                href={printUrl(
                  `${order.id}-conditioner`,
                  conditionerConfig,
                  logoHint,
                )}
                download
              >
                Conditioner SVG
              </a>
            </Button>
          )}
          {!shampooConfig && !conditionerConfig && (
            <p className="text-sm text-muted">No design configs on this order.</p>
          )}
        </div>
      </section>
    </div>
  );
}
