import { isDemoMode } from '@/lib/auth/session';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  listDemoSyncJobs,
  updateDemoSyncJob,
  getDemoOrder,
} from '@/lib/orders/demo-store';
import { isExcelConfigured } from '@/lib/excel/graph-client';
import { ensureWorkbookAndTable } from '@/lib/excel/ensure-workbook';
import { syncOrderToExcel, withRetry } from '@/lib/excel/sync-order';

export async function processPendingJobs(limit = 10) {
  const excelConfigured = isExcelConfigured();
  const ensure = await ensureWorkbookAndTable();

  if (isDemoMode()) {
    const jobs = await listDemoSyncJobs();
    const pending = jobs.filter((j) => j.status === 'pending').slice(0, limit);
    const results = [];

    for (const job of pending) {
      await updateDemoSyncJob(job.id, {
        status: 'processing',
        attempt_count: job.attempt_count + 1,
        last_attempted: new Date().toISOString(),
      });

      const order = await getDemoOrder(job.order_id);
      if (!order) {
        await updateDemoSyncJob(job.id, {
          status: 'failed',
          last_error: 'Order not found',
        });
        results.push({ jobId: job.id, success: false });
        continue;
      }

      if (!excelConfigured) {
        await updateDemoSyncJob(job.id, {
          status: 'failed',
          last_error: 'Excel not configured',
        });
        results.push({
          jobId: job.id,
          success: false,
          excelConfigured: false,
        });
        continue;
      }

      const sync = await withRetry(() =>
        syncOrderToExcel({
          id: order.id,
          created_at: order.created_at,
          customer_snapshot: order.customer_snapshot,
          shampoo_qty: order.shampoo_qty,
          conditioner_qty: order.conditioner_qty,
          total_qty: order.total_qty,
          status: order.status,
          price_per_bottle: order.price_per_bottle,
          total_value: order.total_value,
          notes: order.notes,
          excel_row_id: order.excel_row_id,
        }),
      ).catch((e: unknown) => ({
        success: false,
        excelConfigured: true,
        error: e instanceof Error ? e.message : 'Sync failed',
      }));

      if (sync.success) {
        await updateDemoSyncJob(job.id, {
          status: 'completed',
          completed_at: new Date().toISOString(),
          last_error: null,
        });
      } else {
        await updateDemoSyncJob(job.id, {
          status: 'failed',
          last_error: sync.error ?? 'Unknown error',
        });
      }
      results.push({ jobId: job.id, ...sync });
    }

    return {
      processed: results.length,
      results,
      excelConfigured,
      ensure,
      demoMode: true,
    };
  }

  const admin = createAdminClient();
  if (!admin) {
    return {
      processed: 0,
      results: [],
      excelConfigured,
      ensure,
      error: 'Supabase admin not configured',
    };
  }

  const { data: jobs, error } = await admin
    .from('excel_sync_jobs')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  const results = [];
  for (const job of jobs ?? []) {
    await admin
      .from('excel_sync_jobs')
      .update({
        status: 'processing',
        attempt_count: (job.attempt_count ?? 0) + 1,
        last_attempted: new Date().toISOString(),
      })
      .eq('id', job.id);

    const { data: order } = await admin
      .from('orders')
      .select('*')
      .eq('id', job.order_id)
      .single();

    if (!order) {
      await admin
        .from('excel_sync_jobs')
        .update({ status: 'failed', last_error: 'Order not found' })
        .eq('id', job.id);
      results.push({ jobId: job.id, success: false });
      continue;
    }

    if (!excelConfigured) {
      await admin
        .from('excel_sync_jobs')
        .update({
          status: 'failed',
          last_error: 'Microsoft Graph Excel not configured',
        })
        .eq('id', job.id);
      results.push({ jobId: job.id, success: false, excelConfigured: false });
      continue;
    }

    const sync = await withRetry(() =>
      syncOrderToExcel({
        id: order.id,
        created_at: order.created_at,
        customer_snapshot: order.customer_snapshot as Record<string, unknown>,
        shampoo_qty: order.shampoo_qty,
        conditioner_qty: order.conditioner_qty,
        total_qty: order.total_qty,
        status: order.status,
        price_per_bottle: order.price_per_bottle,
        total_value: order.total_value,
        notes: order.notes,
        excel_row_id: order.excel_row_id,
      }),
    ).catch((e: unknown) => ({
      success: false,
      excelConfigured: true,
      error: e instanceof Error ? e.message : 'Sync failed',
    }));

    if (sync.success && 'excelRowId' in sync) {
      await admin
        .from('orders')
        .update({ excel_row_id: sync.excelRowId ?? order.id })
        .eq('id', order.id);
      await admin
        .from('excel_sync_jobs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          last_error: null,
        })
        .eq('id', job.id);
    } else {
      await admin
        .from('excel_sync_jobs')
        .update({
          status: 'failed',
          last_error: sync.error ?? 'Unknown',
        })
        .eq('id', job.id);
    }

    results.push({ jobId: job.id, ...sync });
  }

  return {
    processed: results.length,
    results,
    excelConfigured,
    ensure,
    demoMode: false,
  };
}
