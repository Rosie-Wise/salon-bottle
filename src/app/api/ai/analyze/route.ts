import { NextResponse } from 'next/server';
import { analyzeLogo } from '@/lib/openai/analyze-logo';
import {
  checkRateLimit,
  clientIpFromHeaders,
} from '@/lib/api/rate-limit';
import { getOpenAI } from '@/lib/openai/client';

export async function POST(request: Request) {
  const ip = clientIpFromHeaders(request.headers);
  const limit = checkRateLimit(`ai-analyze:${ip}`, 20, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again shortly.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((limit.resetAt - Date.now()) / 1000)) },
      },
    );
  }

  let body: { imageDataUrl?: string };
  try {
    body = (await request.json()) as { imageDataUrl?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.imageDataUrl || typeof body.imageDataUrl !== 'string') {
    return NextResponse.json(
      { error: 'imageDataUrl is required' },
      { status: 400 },
    );
  }

  const analysis = await analyzeLogo(body.imageDataUrl);

  return NextResponse.json({
    ...analysis,
    openAiConfigured: Boolean(getOpenAI()),
  });
}
