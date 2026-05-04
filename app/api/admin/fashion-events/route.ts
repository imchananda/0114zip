import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { verifyAdmin } from '@/lib/auth';

const TABLE = 'fashion_events';

const FASHION_CATEGORIES = new Set([
  'evening_look',
  'street_style',
  'runway',
  'red_carpet',
  'casual',
  'accessories',
]);

const ACTOR_SET = new Set(['namtan', 'film', 'both']);

function normBody(raw: Record<string, unknown>) {
  const num = (v: unknown) => {
    if (v === '' || v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  const strArr = (v: unknown): string[] => {
    if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean);
    if (typeof v === 'string') {
      return v.split(/[,，]/).map((s) => s.trim()).filter(Boolean);
    }
    return [];
  };
  const int = (v: unknown, d: number) => {
    const n = num(v);
    if (n === null || !Number.isFinite(n)) return d;
    return Math.max(0, Math.floor(n));
  };

  const rawCat = String(raw.category ?? 'runway').trim();
  const category = FASHION_CATEGORIES.has(rawCat) ? rawCat : 'runway';

  const actors = strArr(raw.actors)
    .map((a) => a.toLowerCase())
    .filter((a) => ACTOR_SET.has(a));
  const actorsNorm = actors.length > 0 ? Array.from(new Set(actors)) : ['both'];

  return {
    event_name: String(raw.event_name ?? '').trim(),
    title_thai: raw.title_thai != null && raw.title_thai !== '' ? String(raw.title_thai).trim() : null,
    brands: strArr(raw.brands),
    location: raw.location != null && raw.location !== '' ? String(raw.location).trim() : null,
    category,
    actors: actorsNorm,
    hashtag: raw.hashtag != null && raw.hashtag !== '' ? String(raw.hashtag).trim() : null,
    engagement: num(raw.engagement),
    emv: num(raw.emv),
    miv: num(raw.miv),
    event_date: raw.event_date != null && raw.event_date !== '' ? String(raw.event_date) : null,
    image_url: raw.image_url != null && raw.image_url !== '' ? String(raw.image_url).trim() : null,
    look_count: int(raw.look_count, 1) || 1,
    in_highlight: Boolean(raw.in_highlight),
    sort_order: int(raw.sort_order, 0),
    visible: raw.visible === undefined ? true : Boolean(raw.visible),
  };
}

// GET /api/admin/fashion-events
export async function GET(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { data, error } = await getAdminClient()
    .from(TABLE)
    .select('*')
    .order('sort_order', { ascending: true })
    .order('event_date', { ascending: false, nullsFirst: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST
export async function POST(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = (await req.json()) as Record<string, unknown>;
  const row = normBody(body);
  if (!row.event_name) {
    return NextResponse.json({ error: 'event_name is required' }, { status: 400 });
  }

  const { data, error } = await getAdminClient()
    .from(TABLE)
    .insert(row)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// PUT
export async function PUT(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = (await req.json()) as Record<string, unknown> & { id?: string };
  const id = body.id;
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  const row = normBody(body);
  if (!row.event_name) {
    return NextResponse.json({ error: 'event_name is required' }, { status: 400 });
  }

  const { data, error } = await getAdminClient()
    .from(TABLE)
    .update(row)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE
export async function DELETE(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { error } = await getAdminClient()
    .from(TABLE)
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
