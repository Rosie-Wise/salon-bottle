import { NextResponse } from 'next/server';
import { AuthError, isDemoMode, requireAdmin } from '@/lib/auth/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { listDemoSyncJobs } from '@/lib/orders/demo-store';
import { isExcelConfigured } from '@/lib/excel/graph-client';
import { ensureWorkbookAndTable } from '@/lib/excel/ensure-workbook';
import { processPendingJobs } from '@/lib/excel/process-jobs';

export async function GET() {
  const excelConfigured = isExcelConfigured();
  const ensure = await ensureWorkbookAndTable();

  if (isDemoMode()) {
    const jobs = await listDemoSyncJobs();
    const counts = jobs.reduce(
      (acc, j) => {
        acc[j.status] = (acc[j.status] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    return NextResponse.json({
      excelConfigured,
      ensure,
      demoMode: true,
      counts,
      pending: counts.pending ?? 0,
    });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({
      excelConfigured,
      ensure,
      error: 'Supabase admin not configured',
    });
  }

  const { data: jobs } = await admin.from('excel_sync_jobs').select('status');
  const counts = (jobs ?? []).reduce(
    (acc, j) => {
      acc[j.status] = (acc[j.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return NextResponse.json({
    excelConfigured,
    ensure,
    demoMode: false,
    counts,
    pending: counts.pending ?? 0,
  });
}

export async function POST() {
  try {
    if (!isDemoMode()) {
      await requireAdmin();
    }
    const result = await processPendingJobs();
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Sync failed' },
      { status: 500 },
    );
  }
}
