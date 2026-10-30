import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { getCurrentUser } from '@/lib/auth/session';
import {
  parseDataUrl,
  sanitizeSvg,
  validateUpload,
} from '@/lib/upload/validate';

async function readUploadBody(request: Request): Promise<{
  buffer: Buffer;
  mime: string;
  fileName: string;
} | null> {
  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return null;
    }
    const arrayBuffer = await file.arrayBuffer();
    return {
      buffer: Buffer.from(arrayBuffer),
      mime: file.type || 'application/octet-stream',
      fileName: file.name || 'logo',
    };
  }

  let json: { dataUrl?: string; fileName?: string };
  try {
    json = (await request.json()) as typeof json;
  } catch {
    return null;
  }
  if (!json.dataUrl) {
    return null;
  }
  const parsed = parseDataUrl(json.dataUrl);
  if (!parsed) {
    return null;
  }
  return {
    buffer: parsed.buffer,
    mime: parsed.mime,
    fileName: json.fileName ?? 'logo',
  };
}

export async function POST(request: Request) {
  const payload = await readUploadBody(request);
  if (!payload) {
    return NextResponse.json(
      { error: 'Provide multipart file or JSON { dataUrl, fileName? }' },
      { status: 400 },
    );
  }

  let buffer = payload.buffer;
  let mime = payload.mime;

  if (mime.includes('svg')) {
    const text = buffer.toString('utf8');
    buffer = Buffer.from(sanitizeSvg(text), 'utf8');
    mime = 'image/svg+xml';
  }

  const validation = validateUpload(buffer, mime);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  mime = validation.mime;

  const supabaseReady = isSupabaseConfigured();
  const admin = createAdminClient();
  const user = await getCurrentUser();

  if (!supabaseReady || !admin) {
    const dataUrl = `data:${mime};base64,${buffer.toString('base64')}`;
    return NextResponse.json({
      demo: true,
      demoMode: true,
      id: randomUUID(),
      fileName: payload.fileName,
      mimeType: mime,
      publicUrl: dataUrl,
      dataUrl,
    });
  }

  const logoId = randomUUID();
  const ownerFolder = user?.id ?? 'anonymous';
  const ext =
    mime === 'image/png' ? 'png'
    : mime === 'image/jpeg' || mime === 'image/jpg' ? 'jpg'
    : mime === 'image/webp' ? 'webp'
    : 'svg';
  const storagePath = `${ownerFolder}/${logoId}.${ext}`;

  const { error: uploadError } = await admin.storage
    .from('logos')
    .upload(storagePath, buffer, {
      contentType: mime,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: uploadError.message, demo: false },
      { status: 500 },
    );
  }

  const { data: signed } = await admin.storage
    .from('logos')
    .createSignedUrl(storagePath, 60 * 60 * 24 * 7);

  const publicUrl = signed?.signedUrl ?? null;

  await admin.from('logos').insert({
    id: logoId,
    user_id: user?.id ?? null,
    session_id: null,
    original_filename: payload.fileName,
    storage_path: storagePath,
    public_url: publicUrl,
  });

  return NextResponse.json({
    demo: false,
    demoMode: false,
    id: logoId,
    fileName: payload.fileName,
    mimeType: mime,
    storagePath,
    publicUrl,
  });
}
