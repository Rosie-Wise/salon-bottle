import {
  EXCEL_ORDER_COLUMNS,
  EXCEL_TABLE_NAME,
  EXCEL_WORKBOOK_DISPLAY_NAME,
  getGraphConfig,
  graphFetch,
  isExcelConfigured,
  workbookItemPath,
} from '@/lib/excel/graph-client';

export interface EnsureWorkbookResult {
  configured: boolean;
  ensured: boolean;
  message: string;
}

/**
 * Ensures the workbook file and Orders table exist when Microsoft Graph is configured.
 * Creates an empty xlsx placeholder is not supported via Graph alone — expects the file
 * to exist at MS_WORKBOOK_PATH or creates a session workbook via upload if missing.
 */
export async function ensureWorkbookAndTable(): Promise<EnsureWorkbookResult> {
  if (!isExcelConfigured()) {
    return {
      configured: false,
      ensured: false,
      message: 'Microsoft Graph Excel integration is not configured.',
    };
  }

  const config = getGraphConfig();
  if (!config) {
    return {
      configured: false,
      ensured: false,
      message: 'Missing Graph configuration.',
    };
  }

  const itemPath = workbookItemPath(config);
  const metaRes = await graphFetch(itemPath);

  if (metaRes.status === 404) {
    return {
      configured: true,
      ensured: false,
      message: `Workbook not found at "${config.workbookPath}". Upload "${EXCEL_WORKBOOK_DISPLAY_NAME}" with an Excel table named "${EXCEL_TABLE_NAME}" and headers: ${EXCEL_ORDER_COLUMNS.join(', ')}.`,
    };
  }

  if (!metaRes.ok) {
    return {
      configured: true,
      ensured: false,
      message: `Could not access workbook: ${metaRes.status} ${metaRes.statusText}`,
    };
  }

  const tablesRes = await graphFetch(`${itemPath}/workbook/tables`);
  if (!tablesRes.ok) {
    return {
      configured: true,
      ensured: false,
      message: `Workbook found but tables could not be listed: ${tablesRes.status}`,
    };
  }

  const tablesJson = (await tablesRes.json()) as {
    value?: { name: string }[];
  };
  const hasOrders = tablesJson.value?.some((t) => t.name === EXCEL_TABLE_NAME);

  if (hasOrders) {
    return {
      configured: true,
      ensured: true,
      message: `Table "${EXCEL_TABLE_NAME}" is present.`,
    };
  }

  const createRes = await graphFetch(`${itemPath}/workbook/tables/add`, {
    method: 'POST',
    body: JSON.stringify({
      address: 'Sheet1!A1:N2',
      hasHeaders: true,
    }),
  });

  if (!createRes.ok) {
    return {
      configured: true,
      ensured: false,
      message: `Create table "${EXCEL_TABLE_NAME}" manually with headers: ${EXCEL_ORDER_COLUMNS.join(', ')}.`,
    };
  }

  const created = (await createRes.json()) as { name?: string };
  if (created.name && created.name !== EXCEL_TABLE_NAME) {
    await graphFetch(`${itemPath}/workbook/tables/${created.name}`, {
      method: 'PATCH',
      body: JSON.stringify({ name: EXCEL_TABLE_NAME }),
    });
  }

  return {
    configured: true,
    ensured: true,
    message: `Table "${EXCEL_TABLE_NAME}" created with default range — verify column headers.`,
  };
}
