import { NextResponse } from 'next/server';
import { AuthError, isDemoMode, requireAdmin } from '@/lib/auth/session';
import { createAdminClient } from '@/lib/supabase/admin';

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
    return NextResponse.json({
      customers: [],
      demoMode: true,
      note: 'Configure Supabase to list registered customers.',
    });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: 'Admin client unavailable' }, { status: 503 });
  }

  const { data: profiles, error } = await admin
    .from('profiles')
    .select(
      'id, first_name, last_name, salon_name, email, phone, business_location, role, created_at',
    )
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: orderCounts } = await admin.from('orders').select('user_id');
  const countByUser = (orderCounts ?? []).reduce(
    (acc, row) => {
      if (row.user_id) {
        acc[row.user_id] = (acc[row.user_id] ?? 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  const customers = (profiles ?? []).map((p) => ({
    ...p,
    orderCount: countByUser[p.id] ?? 0,
  }));

  return NextResponse.json({ customers, demoMode: false });
}
