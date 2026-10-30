import { NextResponse } from 'next/server';
import type { BrandAnalysis } from '@/lib/types';
import { generateThreeDesigns } from '@/lib/sticker/generate';

export async function POST(request: Request) {
  let body: { brandAnalysis?: BrandAnalysis; logoUrl?: string | null };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.brandAnalysis) {
    return NextResponse.json(
      { error: 'brandAnalysis is required' },
      { status: 400 },
    );
  }

  const designs = generateThreeDesigns(body.brandAnalysis, body.logoUrl ?? null);

  return NextResponse.json({ designs });
}
