import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { verifyAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const ALLOWED_FIELDS = [
  'title',
  'title_thai',
  'show',
  'year',
  'category',
  'artist',
  'result',
  'ceremony_date',
  'show_on_schedule',
] as const;

function normalizeCeremonyDate(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null;
}

function normalizeAwardBody(body: Record<string, unknown>) {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const show = typeof body.show === 'string' ? body.show.trim() : '';
  const category = typeof body.category === 'string' ? body.category.trim() : '';
  const year = Number(body.year);
  const showOnSchedule = body.show_on_schedule === true;
  const ceremonyDate = normalizeCeremonyDate(body.ceremony_date);

  if (showOnSchedule && !ceremonyDate) {
    return { error: 'ceremony_date is required when show_on_schedule is enabled' as const };
  }

  return {
    title,
    title_thai: typeof body.title_thai === 'string' && body.title_thai.trim() ? body.title_thai.trim() : null,
    show,
    year: Number.isFinite(year) ? year : null,
    category,
    artist: typeof body.artist === 'string' ? body.artist : 'both',
    result: typeof body.result === 'string' ? body.result : 'nominated',
    ceremony_date: ceremonyDate,
    show_on_schedule: showOnSchedule,
  };
}

// GET /api/admin/awards
export async function GET(req: NextRequest) {
  if (!(await verifyAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('awards')
    .select('*')
    .order('year', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/admin/awards
export async function POST(req: NextRequest) {
  if (!(await verifyAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as Record<string, unknown>;
  const normalized = normalizeAwardBody(body);
  if ('error' in normalized) {
    return NextResponse.json({ error: normalized.error }, { status: 400 });
  }

  const { title, show, year, category } = normalized;
  if (!title || !show || !year || !category) {
    return NextResponse.json({ error: 'Missing required fields: title, show, year, category' }, { status: 400 });
  }

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('awards')
    .insert(normalized)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// PUT /api/admin/awards
export async function PUT(req: NextRequest) {
  if (!(await verifyAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as Record<string, unknown> & { id?: string };
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const safe: Record<string, unknown> = {};
  for (const k of ALLOWED_FIELDS) {
    if (k in updates) safe[k] = updates[k];
  }
  if (safe.year !== undefined) safe.year = Number(safe.year);
  if ('ceremony_date' in safe) safe.ceremony_date = normalizeCeremonyDate(safe.ceremony_date);
  if ('show_on_schedule' in safe) safe.show_on_schedule = safe.show_on_schedule === true;

  const supabase = getAdminClient();

  if (safe.show_on_schedule === true) {
    let ceremonyDate = safe.ceremony_date as string | null | undefined;
    if (ceremonyDate === undefined) {
      const { data: existing, error: fetchError } = await supabase
        .from('awards')
        .select('ceremony_date')
        .eq('id', id)
        .single();
      if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });
      ceremonyDate = existing?.ceremony_date ?? null;
    }
    if (!ceremonyDate) {
      return NextResponse.json(
        { error: 'ceremony_date is required when show_on_schedule is enabled' },
        { status: 400 },
      );
    }
  }

  const { data, error } = await supabase
    .from('awards')
    .update(safe)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/admin/awards?id=xxx
export async function DELETE(req: NextRequest) {
  if (!(await verifyAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const supabase = getAdminClient();
  const { error } = await supabase.from('awards').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
