import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '.data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const SYNC_JOBS_FILE = path.join(DATA_DIR, 'excel_sync_jobs.json');

export interface DemoOrderRecord {
  id: string;
  user_id: string | null;
  design_id: string | null;
  approved_version: number | null;
  shampoo_qty: number;
  conditioner_qty: number;
  total_qty: number;
  customer_snapshot: Record<string, unknown>;
  notes: string | null;
  status: string;
  price_per_bottle: number | null;
  total_value: number | null;
  submission_key: string | null;
  excel_row_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DemoExcelSyncJob {
  id: string;
  order_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  attempt_count: number;
  last_error: string | null;
  last_attempted: string | null;
  completed_at: string | null;
  created_at: string;
}

async function ensureDataDir(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
}

async function readJsonFile<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(file, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJsonFile<T>(file: string, data: T): Promise<void> {
  await ensureDataDir();
  await writeFile(file, JSON.stringify(data, null, 2), 'utf8');
}

export async function listDemoOrders(): Promise<DemoOrderRecord[]> {
  return readJsonFile<DemoOrderRecord[]>(ORDERS_FILE, []);
}

export async function getDemoOrder(id: string): Promise<DemoOrderRecord | null> {
  const orders = await listDemoOrders();
  return orders.find((o) => o.id === id) ?? null;
}

export async function findDemoOrderBySubmissionKey(
  key: string,
): Promise<DemoOrderRecord | null> {
  const orders = await listDemoOrders();
  return orders.find((o) => o.submission_key === key) ?? null;
}

export async function saveDemoOrder(order: DemoOrderRecord): Promise<void> {
  const orders = await listDemoOrders();
  const idx = orders.findIndex((o) => o.id === order.id);
  if (idx >= 0) {
    orders[idx] = order;
  } else {
    orders.push(order);
  }
  await writeJsonFile(ORDERS_FILE, orders);
}

export async function listDemoSyncJobs(): Promise<DemoExcelSyncJob[]> {
  return readJsonFile<DemoExcelSyncJob[]>(SYNC_JOBS_FILE, []);
}

export async function saveDemoSyncJob(job: DemoExcelSyncJob): Promise<void> {
  const jobs = await listDemoSyncJobs();
  const idx = jobs.findIndex((j) => j.id === job.id);
  if (idx >= 0) {
    jobs[idx] = job;
  } else {
    jobs.push(job);
  }
  await writeJsonFile(SYNC_JOBS_FILE, jobs);
}

export async function updateDemoSyncJob(
  id: string,
  patch: Partial<DemoExcelSyncJob>,
): Promise<DemoExcelSyncJob | null> {
  const jobs = await listDemoSyncJobs();
  const idx = jobs.findIndex((j) => j.id === id);
  if (idx < 0) {
    return null;
  }
  jobs[idx] = { ...jobs[idx], ...patch };
  await writeJsonFile(SYNC_JOBS_FILE, jobs);
  return jobs[idx];
}

export function generateOrderId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${ts}-${rand}`;
}
