import { notFound } from 'next/navigation';
import { ensureAdminPageAccess } from '@/lib/auth/ensure-admin';
import { isDemoMode } from '@/lib/auth/session';
import { getDemoOrder } from '@/lib/orders/demo-store';
import { createAdminClient } from '@/lib/supabase/admin';
import { OrderDetailClient } from '@/components/admin/order-detail-client';

export const instant = false;

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  await ensureAdminPageAccess(`/admin/orders/${id}`);

  if (isDemoMode()) {
    const order = await getDemoOrder(id);
    if (!order) notFound();
    return <OrderDetailClient order={order} />;
  }

  const admin = createAdminClient();
  if (!admin) notFound();

  const { data: order } = await admin
    .from('orders')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!order) notFound();

  return <OrderDetailClient order={order} />;
}
