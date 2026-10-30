import Link from 'next/link';
import { format } from 'date-fns';
import { ensureAdminPageAccess } from '@/lib/auth/ensure-admin';
import { isDemoMode } from '@/lib/auth/session';
import { listDemoOrders } from '@/lib/orders/demo-store';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function AdminOrdersPage() {
  await ensureAdminPageAccess('/admin/orders');

  let orders: {
    id: string;
    status: string;
    total_qty: number;
    shampoo_qty: number;
    conditioner_qty: number;
    created_at: string;
  }[] = [];

  if (isDemoMode()) {
    orders = (await listDemoOrders()).sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  } else {
    const admin = createAdminClient();
    if (!admin) {
      return (
        <p className="text-muted">Admin database client is unavailable.</p>
      );
    }
    const { data } = await admin
      .from('orders')
      .select(
        'id, status, total_qty, shampoo_qty, conditioner_qty, created_at',
      )
      .order('created_at', { ascending: false });
    orders = data ?? [];
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl tracking-tight">Orders</h1>
      <div className="overflow-x-auto border border-border/80">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-border/80 bg-cream/50 text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Shampoo</th>
              <th className="px-4 py-3">Conditioner</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {orders.length === 0 ?
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted">
                  No orders.
                </td>
              </tr>
            : orders.map((o) => (
                <tr key={o.id} className="hover:bg-cream/30">
                  <td className="px-4 py-3 font-mono text-xs">
                    <Link href={`/admin/orders/${o.id}`} className="hover:underline">
                      {o.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{o.status}</td>
                  <td className="px-4 py-3 tabular-nums">{o.shampoo_qty}</td>
                  <td className="px-4 py-3 tabular-nums">{o.conditioner_qty}</td>
                  <td className="px-4 py-3 tabular-nums">{o.total_qty}</td>
                  <td className="px-4 py-3 text-muted">
                    {format(new Date(o.created_at), 'MMM d, yyyy')}
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
