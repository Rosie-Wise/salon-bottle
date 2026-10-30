import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  AuthError,
  isAdminUser,
  isDemoMode,
  requireAuth,
} from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import {
  getDemoOrder,
  listDemoOrders,
  saveDemoOrder,
} from '@/lib/orders/demo-store';

const patchSchema = z.object({
  status: z.string().min(1).optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (isDemoMode()) {
    const order = await getDemoOrder(id);
    if (!order) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ order, demoMode: true });
  }

  try {
    const user = await requireAuth();
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase unavailable' }, { status: 503 });
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!order) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const admin = await isAdminUser(user);
    if (order.user_id !== user.id && !admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ order, demoMode: false });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;

  let body: z.infer<typeof patchSchema>;
  try {
    body = patchSchema.parse(await request.json());
  } catch (err) {
    const message = err instanceof z.ZodError ? err.message : 'Invalid body';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (!body.status) {
    return NextResponse.json({ error: 'status is required' }, { status: 400 });
  }

  if (isDemoMode()) {
    const orders = await listDemoOrders();
    const order = orders.find((o) => o.id === id);
    if (!order) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    order.status = body.status;
    order.updated_at = new Date().toISOString();
    await saveDemoOrder(order);
    return NextResponse.json({
      order,
      demoMode: true,
      note: 'Demo mode — admin patch applied locally only.',
    });
  }

  try {
    const user = await requireAuth();
    if (!(await isAdminUser(user))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase unavailable' }, { status: 503 });
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update({ status: body.status })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ order, demoMode: false });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
