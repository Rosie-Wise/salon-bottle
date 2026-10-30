import Link from 'next/link';
import { format } from 'date-fns';
import { ensureAdminPageAccess } from '@/lib/auth/ensure-admin';
import { isDemoMode } from '@/lib/auth/session';
import { listDemoOrders } from '@/lib/orders/demo-store';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function AdminOverviewPage() {
  await ensureAdminPageAccess('/admin');

  let totalOrders = 0;
  let totalBottles = 0;
  let recent: {
    id: string;
    status: string;
    total_qty: number;
    created_at: string;
  }[] = [];

  if (isDemoMode()) {
    const orders = await listDemoOrders();
    totalOrders = orders.length;
    totalBottles = orders.reduce((s, o) => s + o.total_qty, 0);
    recent = orders
      .slice()
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, 8);
  } else {
    const admin = createAdminClient();
    if (admin) {
      const { data: orders } = await admin
        .from('orders')
        .select('id, status, total_qty, created_at')
        .order('created_at', { ascending: false })
        .limit(8);
      recent = orders ?? [];
      totalOrders = recent.length;
      const { count } = await admin
        .from('orders')
        .select('*', { count: 'exact', head: true });
      totalOrders = count ?? 0;
      const { data: qtyRows } = await admin.from('orders').select('total_qty');
      totalBottles = (qtyRows ?? []).reduce(
        (s, r) => s + (r.total_qty ?? 0),
        0,
      );
    }
  }

  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-display text-3xl tracking-tight">Overview</h1>
        {isDemoMode() && (
          <p className="mt-2 text-sm text-muted">
            Demo mode — showing locally stored orders.
          </p>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="border border-border/80 bg-ivory/40 p-8">
          <p className="text-xs uppercase tracking-wider text-muted">Orders</p>
          <p className="mt-2 font-display text-4xl tabular-nums">{totalOrders}</p>
        </div>
        <div className="border border-border/80 bg-ivory/40 p-8">
          <p className="text-xs uppercase tracking-wider text-muted">
            Total bottles
          </p>
          <p className="mt-2 font-display text-4xl tabular-nums">{totalBottles}</p>
        </div>
      </div>

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-xl">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm text-muted hover:text-foreground">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto border border-border/80">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b border-border/80 bg-cream/50 text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Qty</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {recent.length === 0 ?
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted">
                    No orders yet.
                  </td>
                </tr>
              : recent.map((o) => (
                  <tr key={o.id}>
                    <td className="px-4 py-3 font-mono text-xs">
                      <Link href={`/admin/orders/${o.id}`} className="hover:underline">
                        {o.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{o.status}</td>
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
      </section>
    </div>
  );
}
