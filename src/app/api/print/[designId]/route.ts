import { NextResponse } from 'next/server';
import type { DesignConfig } from '@/lib/types';
import { createAdminClient } from '@/lib/supabase/admin';
import { isDemoMode } from '@/lib/auth/session';
import {
  designConfigToSvg,
  getProductionProofMetadata,
  PRODUCTION_PROOF_NOTE,
} from '@/lib/print/export-sticker';

type RouteContext = { params: Promise<{ designId: string }> };

async function loadDesign(
  designId: string,
): Promise<{ config: DesignConfig; logoUrl: string | null } | null> {
  if (isDemoMode()) {
    return null;
  }
  const admin = createAdminClient();
  if (!admin) {
    return null;
  }
  const { data: design } = await admin
    .from('designs')
    .select('config, logo_id')
    .eq('id', designId)
    .maybeSingle();

  if (!design?.config) {
    return null;
  }

  let logoUrl: string | null = null;
  if (design.logo_id) {
    const { data: logo } = await admin
      .from('logos')
      .select('public_url, storage_path')
      .eq('id', design.logo_id)
      .maybeSingle();
    if (logo?.public_url) {
      logoUrl = logo.public_url;
    } else if (logo?.storage_path) {
      const { data: signed } = await admin.storage
        .from('logos')
        .createSignedUrl(logo.storage_path, 3600);
      logoUrl = signed?.signedUrl ?? null;
    }
  }

  return {
    config: design.config as DesignConfig,
    logoUrl,
  };
}

export async function GET(request: Request, context: RouteContext) {
  const { designId } = await context.params;
  const { searchParams } = new URL(request.url);
  const format = (searchParams.get('format') ?? 'svg').toLowerCase();
  const configParam = searchParams.get('config');
  const logoParam = searchParams.get('logoUrl');

  let config: DesignConfig | null = null;
  let logoUrl: string | null = logoParam;

  if (configParam) {
    try {
      config = JSON.parse(configParam) as DesignConfig;
    } catch {
      return NextResponse.json({ error: 'Invalid config query JSON' }, { status: 400 });
    }
  } else {
    const loaded = await loadDesign(designId);
    if (!loaded) {
      return NextResponse.json(
        {
          error: 'Design not found. Pass ?config= JSON in demo mode.',
          demoMode: isDemoMode(),
        },
        { status: 404 },
      );
    }
    config = loaded.config;
    logoUrl = loaded.logoUrl;
  }

  const svg = designConfigToSvg(config, logoUrl);
  const meta = getProductionProofMetadata();

  if (format === 'svg') {
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Content-Disposition': `attachment; filename="production-proof-${designId}.svg"`,
        'X-Production-Proof': 'true',
      },
    });
  }

  if (format === 'png' || format === 'pdf') {
    return NextResponse.json(
      {
        format,
        fallback: 'svg',
        note: `${PRODUCTION_PROOF_NOTE} PNG/PDF export requires optional native libraries — download SVG instead.`,
        metadata: meta,
        svg,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Production-Proof': 'true',
        },
      },
    );
  }

  return NextResponse.json(
    { error: 'format must be svg, png, or pdf' },
    { status: 400 },
  );
}
