const MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED_MIMES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/svg+xml',
]);

export function sanitizeSvg(content: string): string {
  let out = content;
  out = out.replace(/<script[\s\S]*?<\/script>/gi, '');
  out = out.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  out = out.replace(/javascript:/gi, '');
  return out;
}

export function validateUpload(
  bytes: Buffer,
  mimeType: string,
): { ok: true; mime: string } | { ok: false; error: string } {
  const mime = mimeType.toLowerCase().split(';')[0]?.trim() ?? '';
  if (!ALLOWED_MIMES.has(mime)) {
    return { ok: false, error: `Unsupported file type: ${mime || 'unknown'}` };
  }
  if (bytes.length > MAX_BYTES) {
    return { ok: false, error: 'File exceeds 5MB limit.' };
  }
  return { ok: true, mime };
}

export function parseDataUrl(dataUrl: string): {
  mime: string;
  buffer: Buffer;
} | null {
  const match = /^data:([^;]+);base64,(.+)$/i.exec(dataUrl.trim());
  if (!match) {
    return null;
  }
  return {
    mime: match[1],
    buffer: Buffer.from(match[2], 'base64'),
  };
}
