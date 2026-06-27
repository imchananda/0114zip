import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { getAdminClient, supabase } from '@/lib/supabase';
import { verifyAdmin } from '@/lib/auth';
import { normalizeHomepageConfig, serializeHomepageBuilderConfig } from '@/lib/homepage-sections';
import { normalizeHeroBannerConfig } from '@/lib/hero-banner';

type SiteSettingRow = { key: string; value: unknown };

export const revalidate = 300;

const HOME_SECTIONS_KEY = 'homeSections';
const HERO_BANNER_KEY = 'heroBanner';

/** Re-normalize raw JSONB before persist (Phase 7 — unified normalize + version bump). */
function normalizeHomeSectionsForStorage(value: unknown): unknown {
  const normalized = normalizeHomepageConfig(value);
  return serializeHomepageBuilderConfig(normalized.sections, normalized.pageMotion, normalized.pageTheme);
}

function normalizeSettingValue(key: string, value: unknown): unknown {
  if (key === HOME_SECTIONS_KEY) {
    return normalizeHomeSectionsForStorage(value);
  }
  if (key === HERO_BANNER_KEY) {
    return normalizeHeroBannerConfig(value);
  }
  return value;
}

export async function GET() {
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const settings: Record<string, unknown> = {};
  for (const row of (data as SiteSettingRow[]) ?? []) {
    settings[row.key] = row.key === HERO_BANNER_KEY
      ? normalizeHeroBannerConfig(row.value)
      : row.value;
  }
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const admin = getAdminClient();

  let rows: { key: string; value: unknown; updated_at: string }[] = [];

  if ('key' in body && 'value' in body) {
    const key = String(body.key);
    rows = [{
      key,
      value: normalizeSettingValue(key, body.value),
      updated_at: new Date().toISOString(),
    }];
  } else {
    rows = Object.entries(body).map(([key, value]) => ({
      key,
      value: normalizeSettingValue(key, value),
      updated_at: new Date().toISOString(),
    }));
  }

  const { error } = await admin
    .from('site_settings')
    .upsert(rows, { onConflict: 'key' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Invalidate settings caches instantly
  revalidateTag('settings');

  if ('scheduleSources' in body) {
    revalidateTag('schedule');
  }

  return NextResponse.json({ success: true });
}
