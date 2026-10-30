import {
  EXCEL_TABLE_NAME,
  getGraphConfig,
  graphFetch,
  isExcelConfigured,
  workbookItemPath,
} from '@/lib/excel/graph-client';

export interface OrderRowForExcel {
  id: string;
  created_at: string;
  customer_snapshot: Record<string, unknown>;
  shampoo_qty: number;
  conditioner_qty: number;
  total_qty: number;
  status: string;
  price_per_bottle?: number | null;
  total_value?: number | null;
  notes?: string | null;
  excel_row_id?: string | null;
}

export interface SyncOrderResult {
  success: boolean;
  excelConfigured: boolean;
  excelRowId?: string;
  skipped?: boolean;
  error?: string;
}

function snapshotField(
  snapshot: Record<string, unknown>,
  key: string,
): string {
  const v = snapshot[key];
  return v == null ? '' : String(v);
}

function buildRowValues(order: OrderRowForExcel): (string | number)[] {
  const snap = order.customer_snapshot ?? {};
  const excelRowId = order.excel_row_id ?? order.id;
  return [
    order.id,
    order.created_at,
    snapshotField(snap, 'salonName') || snapshotField(snap, 'salon_name'),
    snapshotField(snap, 'email') || snapshotField(snap, 'contactEmail'),
    snapshotField(snap, 'phone') || snapshotField(snap, 'contactPhone'),
    snapshotField(snap, 'businessLocation') ||
      snapshotField(snap, 'business_location'),
    order.shampoo_qty,
    order.conditioner_qty,
    order.total_qty,
    order.status,
    order.price_per_bottle ?? '',
    order.total_value ?? '',
    order.notes ?? '',
    excelRowId,
  ];
}

async function orderIdExistsInTable(
  orderId: string,
): Promise<boolean> {
  const config = getGraphConfig();
  if (!config) {
    return false;
  }
  const itemPath = workbookItemPath(config);
  const filterRes = await graphFetch(
    `${itemPath}/workbook/tables/${EXCEL_TABLE_NAME}/columns/item(name='Order ID')/range`,
  );
  if (!filterRes.ok) {
    return false;
  }
  const data = (await filterRes.json()) as {
    values?: (string | number)[][];
  };
  const rows = data.values ?? [];
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i]?.[0]) === orderId) {
      return true;
    }
  }
  return false;
}

export async function syncOrderToExcel(
  order: OrderRowForExcel,
): Promise<SyncOrderResult> {
  if (!isExcelConfigured()) {
    return {
      success: false,
      excelConfigured: false,
      error: 'Microsoft Graph Excel is not configured.',
    };
  }

  try {
    if (order.excel_row_id) {
      const exists = await orderIdExistsInTable(order.id);
      if (exists) {
        return {
          success: true,
          excelConfigured: true,
          excelRowId: order.excel_row_id,
          skipped: true,
        };
      }
    } else {
      const exists = await orderIdExistsInTable(order.id);
      if (exists) {
        return {
          success: true,
          excelConfigured: true,
          excelRowId: order.id,
          skipped: true,
        };
      }
    }

    const config = getGraphConfig();
    if (!config) {
      return {
        success: false,
        excelConfigured: false,
        error: 'Graph config missing.',
      };
    }

    const itemPath = workbookItemPath(config);
    const values = [buildRowValues(order)];

    const appendRes = await graphFetch(
      `${itemPath}/workbook/tables/${EXCEL_TABLE_NAME}/rows/add`,
      {
        method: 'POST',
        body: JSON.stringify({ values }),
      },
    );

    if (!appendRes.ok) {
      const text = await appendRes.text();
      return {
        success: false,
        excelConfigured: true,
        error: `Append failed: ${appendRes.status} ${text}`,
      };
    }

    const excelRowId = order.excel_row_id ?? order.id;
    return {
      success: true,
      excelConfigured: true,
      excelRowId,
    };
  } catch (err) {
    return {
      success: false,
      excelConfigured: true,
      error: err instanceof Error ? err.message : 'Unknown sync error',
    };
  }
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 500,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, delayMs * attempt));
      }
    }
  }
  throw lastError;
}
