import { NextResponse } from 'next/server';
import type { BrandAnalysis, DesignConfig } from '@/lib/types';
import { interpretCustomization } from '@/lib/openai/customize';
import { getOpenAI } from '@/lib/openai/client';

export async function POST(request: Request) {
  let body: {
    message?: string;
    config?: DesignConfig;
    brandAnalysis?: BrandAnalysis | null;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.message || typeof body.message !== 'string') {
    return NextResponse.json({ error: 'message is required' }, { status: 400 });
  }
  if (!body.config) {
    return NextResponse.json({ error: 'config is required' }, { status: 400 });
  }

  const patch = await interpretCustomization(
    body.message,
    body.config,
    body.brandAnalysis ?? null,
  );

  return NextResponse.json({
    patch,
    openAiConfigured: Boolean(getOpenAI()),
  });
}
