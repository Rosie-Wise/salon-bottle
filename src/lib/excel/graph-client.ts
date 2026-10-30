const GRAPH_SCOPE = 'https://graph.microsoft.com/.default';
const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';

export interface GraphConfig {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  driveId?: string;
  siteId?: string;
  workbookPath: string;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

export function getGraphConfig(): GraphConfig | null {
  const tenantId = process.env.MS_TENANT_ID?.trim();
  const clientId = process.env.MS_CLIENT_ID?.trim();
  const clientSecret = process.env.MS_CLIENT_SECRET?.trim();
  const workbookPath = process.env.MS_WORKBOOK_PATH?.trim();
  const driveId = process.env.MS_DRIVE_ID?.trim();
  const siteId = process.env.MS_SITE_ID?.trim();

  if (!tenantId || !clientId || !clientSecret || !workbookPath) {
    return null;
  }
  if (!driveId && !siteId) {
    return null;
  }

  return {
    tenantId,
    clientId,
    clientSecret,
    driveId,
    siteId,
    workbookPath,
  };
}

export function isExcelConfigured(): boolean {
  return getGraphConfig() !== null;
}

export async function getAccessToken(): Promise<string | null> {
  const config = getGraphConfig();
  if (!config) {
    return null;
  }

  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60_000) {
    return cachedToken.token;
  }

  const tokenUrl = `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    scope: GRAPH_SCOPE,
    grant_type: 'client_credentials',
  });

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) {
    cachedToken = null;
    return null;
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };
  cachedToken = {
    token: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };
  return data.access_token;
}

function driveRoot(config: GraphConfig): string {
  if (config.driveId) {
    return `${GRAPH_BASE}/drives/${config.driveId}`;
  }
  return `${GRAPH_BASE}/sites/${config.siteId}/drive`;
}

export async function graphFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Microsoft Graph is not configured or token request failed');
  }
  const url = path.startsWith('http') ? path : `${GRAPH_BASE}${path}`;
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
}

export function workbookItemPath(config: GraphConfig): string {
  const encoded = encodeURIComponent(config.workbookPath).replace(/%2F/g, '/');
  return `${driveRoot(config)}/root:/${encoded}:`;
}

export const EXCEL_WORKBOOK_DISPLAY_NAME = 'Salon Bottle Orders';
export const EXCEL_TABLE_NAME = 'Orders';

export const EXCEL_ORDER_COLUMNS = [
  'Order ID',
  'Created At',
  'Salon Name',
  'Contact Email',
  'Contact Phone',
  'Business Location',
  'Shampoo Qty',
  'Conditioner Qty',
  'Total Qty',
  'Status',
  'Price Per Bottle',
  'Total Value',
  'Notes',
  'Excel Row ID',
] as const;
