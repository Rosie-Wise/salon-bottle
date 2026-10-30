import { NextResponse } from 'next/server';
import { AuthError, isDemoMode, requireAdmin } from '@/lib/auth/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { listDemoOrders } from '@/lib/orders/demo-store';
import { isExcelConfigured } from '@/lib/excel/graph-client';
import { getOpenAI } from '@/lib/openai/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export async function GET() {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }

  if (isDemoMode()) {
    const orders = await listDemoOrders();
    const byStatus = orders.reduce(
      (acc, o) => {
        acc[o.status] = (acc[o.status] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    return NextResponse.json({
      demoMode: true,
      orders: {
        total: orders.length,
        byStatus,
        totalBottles: orders.reduce((s, o) => s + o.total_qty, 0),
      },
      customers: { total: 0, note: 'Demo mode — no customer directory.' },
      integrations: {
        supabase: isSupabaseConfigured(),
        openAi: Boolean(getOpenAI()),
        excel: isExcelConfigured(),
      },
    });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: 'Admin client unavailable' }, { status: 503 });
  }

  const [
    { count: orderCount },
    { count: customerCount },
    { count: designCount },
    { data: statusRows },
  ] = await Promise.all([
    admin.from('orders').select('*', { count: 'exact', head: true }),
    admin.from('profiles').select('*', { count: 'exact', head: true }),
    admin.from('designs').select('*', { count: 'exact', head: true }),
    admin.from('orders').select('status, total_qty'),
  ]);

  const byStatus = (statusRows ?? []).reduce(
    (acc, row) => {
      acc[row.status] = (acc[row.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const totalBottles = (statusRows ?? []).reduce(
    (s, row) => s + (row.total_qty ?? 0),
    0,
  );

  const { count: pendingSync } = await admin
    .from('excel_sync_jobs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  return NextResponse.json({
    demoMode: false,
    orders: {
      total: orderCount ?? 0,
      byStatus,
      totalBottles,
    },
    customers: { total: customerCount ?? 0 },
    designs: { total: designCount ?? 0 },
    excelSync: { pending: pendingSync ?? 0 },
    integrations: {
      supabase: true,
      openAi: Boolean(getOpenAI()),
      excel: isExcelConfigured(),
    },
  });
}
