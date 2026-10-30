import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  AuthError,
  isDemoMode,
  requireAuthUnlessDemo,
} from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { getSiteConfigSync } from '@/lib/config/site';
import {
  findDemoOrderBySubmissionKey,
  generateOrderId,
  listDemoOrders,
  saveDemoOrder,
  saveDemoSyncJob,
} from '@/lib/orders/demo-store';

const createOrderSchema = z.object({
  designId: z.string().uuid().optional().nullable(),
  approvedVersion: z.number().int().positive().optional().nullable(),
  shampooQty: z.number().int().min(0),
  conditionerQty: z.number().int().min(0),
  notes: z.string().max(2000).optional().nullable(),
  submissionKey: z.string().min(8).max(128).optional(),
  customerSnapshot: z.record(z.string(), z.unknown()).default({}),
});

function validateQuantities(shampooQty: number, conditionerQty: number) {
  const site = getSiteConfigSync();
  const total = shampooQty + conditionerQty;
  if (total < site.minOrderQty) {
    return `Minimum order is ${site.minOrderQty} bottles.`;
  }
  if (total % site.qtyIncrement !== 0) {
    return `Total quantity must be a multiple of ${site.qtyIncrement}.`;
  }
  if (shampooQty < 0 || conditionerQty < 0) {
    return 'Quantities must be non-negative.';
  }
  return null;
}

export async function GET() {
  try {
    const { user, demoMode } = await requireAuthUnlessDemo();

    if (demoMode) {
      const orders = await listDemoOrders();
      return NextResponse.json({ orders, demoMode: true });
    }

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 503 },
      );
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ orders: data ?? [], demoMode: false });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}

export async function POST(request: Request) {
  let parsed: z.infer<typeof createOrderSchema>;
  try {
    const json = await request.json();
    parsed = createOrderSchema.parse(json);
  } catch (err) {
    const message = err instanceof z.ZodError ? err.message : 'Invalid body';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const qtyError = validateQuantities(parsed.shampooQty, parsed.conditionerQty);
  if (qtyError) {
    return NextResponse.json({ error: qtyError }, { status: 400 });
  }

  const site = getSiteConfigSync();
  const totalQty = parsed.shampooQty + parsed.conditionerQty;
  const pricePerBottle = site.pricePerBottle;
  const totalValue =
    pricePerBottle != null ? pricePerBottle * totalQty : null;

  const demoMode = isDemoMode();

  try {
    if (demoMode) {
      if (parsed.submissionKey) {
        const existing = await findDemoOrderBySubmissionKey(parsed.submissionKey);
        if (existing) {
          return NextResponse.json({
            order: existing,
            demoOrder: true,
            demoMode: true,
            duplicate: true,
          });
        }
      }

      const now = new Date().toISOString();
      const order = {
        id: generateOrderId(),
        user_id: null,
        design_id: parsed.designId ?? null,
        approved_version: parsed.approvedVersion ?? null,
        shampoo_qty: parsed.shampooQty,
        conditioner_qty: parsed.conditionerQty,
        total_qty: totalQty,
        customer_snapshot: parsed.customerSnapshot,
        notes: parsed.notes ?? null,
        status: 'New',
        price_per_bottle: pricePerBottle,
        total_value: totalValue,
        submission_key: parsed.submissionKey ?? randomUUID(),
        excel_row_id: null,
        created_at: now,
        updated_at: now,
      };

      await saveDemoOrder(order);

      const syncJob = {
        id: randomUUID(),
        order_id: order.id,
        status: 'pending' as const,
        attempt_count: 0,
        last_error: null,
        last_attempted: null,
        completed_at: null,
        created_at: now,
      };
      await saveDemoSyncJob(syncJob);

      const { isExcelConfigured } = await import('@/lib/excel/graph-client');
      const { processPendingJobs } = await import('@/lib/excel/process-jobs');
      void processPendingJobs(5).catch(() => undefined);

      return NextResponse.json({
        order,
        excelSyncJob: syncJob,
        demoOrder: true,
        demoMode: true,
        excelConfigured: isExcelConfigured(),
      });
    }

    const { user } = await requireAuthUnlessDemo();
    const supabase = await createClient();
    if (!supabase || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (parsed.submissionKey) {
      const { data: existing } = await supabase
        .from('orders')
        .select('*')
        .eq('submission_key', parsed.submissionKey)
        .maybeSingle();
      if (existing) {
        return NextResponse.json({
          order: existing,
          demoOrder: false,
          duplicate: true,
        });
      }
    }

    const now = new Date().toISOString();
    const orderId = generateOrderId();
    const submissionKey = parsed.submissionKey ?? randomUUID();

    const orderRow = {
      id: orderId,
      user_id: user.id,
      design_id: parsed.designId ?? null,
      approved_version: parsed.approvedVersion ?? null,
      shampoo_qty: parsed.shampooQty,
      conditioner_qty: parsed.conditionerQty,
      total_qty: totalQty,
      customer_snapshot: parsed.customerSnapshot,
      notes: parsed.notes ?? null,
      status: 'New',
      price_per_bottle: pricePerBottle,
      total_value: totalValue,
      submission_key: submissionKey,
      excel_row_id: null,
      created_at: now,
      updated_at: now,
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderRow)
      .select('*')
      .single();

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    const { data: syncJob, error: jobError } = await supabase
      .from('excel_sync_jobs')
      .insert({
        order_id: orderId,
        status: 'pending',
      })
      .select('*')
      .single();

    if (jobError) {
      return NextResponse.json(
        { order, excelSyncJob: null, warning: jobError.message },
        { status: 201 },
      );
    }

    const { isExcelConfigured } = await import('@/lib/excel/graph-client');
    const { processPendingJobs } = await import('@/lib/excel/process-jobs');
    void processPendingJobs(5).catch(() => undefined);

    return NextResponse.json(
      {
        order,
        excelSyncJob: syncJob,
        demoOrder: false,
        demoMode: false,
        excelConfigured: isExcelConfigured(),
      },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
