'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isClientDemoMode } from '@/lib/supabase/demo-mode-client';

interface OrderRow {
  id: string;
  status?: string;
  total_qty?: number;
  shampoo_qty?: number;
  conditioner_qty?: number;
  created_at?: string;
  notes?: string | null;
}

export default function DashboardOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const demoMode = isClientDemoMode();

  useEffect(() => {
    fetch('/api/orders')
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(body.error ?? 'Could not load orders.');
        }
        setOrders(body.orders ?? []);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load orders.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl tracking-tight">My Orders</h1>
        <p className="mt-3 text-muted">
          {demoMode ?
            'Demo mode — orders are stored locally for this environment.'
          : 'Orders linked to your RAD account.'}
        </p>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading orders…
        </div>
      )}

      {error && (
        <div className="space-y-4">
          <p className="text-sm text-red-800/90">{error}</p>
          {!demoMode && (
            <Button asChild variant="secondary">
              <Link href="/auth/login?next=/dashboard/orders">Sign in</Link>
            </Button>
          )}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="border border-dashed border-border px-8 py-16 text-center">
          <p className="text-muted">No orders yet.</p>
          <Button asChild className="mt-6">
            <Link href="/create/upload">Start a label</Link>
          </Button>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <ul className="divide-y divide-border/80 border border-border/80">
          {orders.map((order) => (
            <li key={order.id} className="px-6 py-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-mono text-sm">{order.id}</span>
                <span className="text-xs uppercase tracking-wider text-muted">
                  {order.status ?? 'New'}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted">
                {order.total_qty ?? 0} bottles
                {order.created_at ?
                  ` · ${format(new Date(order.created_at), 'MMM d, yyyy')}`
                : ''}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
