import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, supabase } from '@/lib/supabase';
import { verifyAdmin } from '@/lib/auth';
import { isLegacyContentType, LEGACY_CONTENT_TYPES } from '@/lib/content-constants';

const LEGACY_CONTENT_MESSAGE: Record<string, string> = {
  magazine: 'Magazine content moved to /admin/fashion (category: magazine).',
  award: 'Awards moved to /admin/awards.',
};

function rejectLegacyContentType(type: string | null): NextResponse | null {
  if (type && isLegacyContentType(type)) {
    return NextResponse.json(
      { error: LEGACY_CONTENT_MESSAGE[type], deprecated: true },
      { status: 410 },
    );
  }
  return null;
}

function rejectLegacyContentBody(body: Record<string, unknown>): NextResponse | null {
  const contentType = body.content_type;
  if (typeof contentType === 'string' && isLegacyContentType(contentType)) {
    return NextResponse.json(
      { error: LEGACY_CONTENT_MESSAGE[contentType], deprecated: true },
      { status: 410 },
    );
  }
  return null;
}

// GET /api/admin/content?type=series
export async function GET(req: NextRequest) {
  const isAdmin = await verifyAdmin(req);
  const client = isAdmin ? getAdminClient() : supabase;

  const type = req.nextUrl.searchParams.get('type');
  const legacyReject = rejectLegacyContentType(type);
  if (legacyReject) return legacyReject;

  let query = client
    .from('content_items')
    .select('*, brand_collaborations(id, brand_name, brand_logo)')
    .order('sort_order', { ascending: true })
    .order('year', { ascending: false });

  if (type) {
    query = query.eq('content_type', type);
  } else {
    query = query.not('content_type', 'in', `(${LEGACY_CONTENT_TYPES.join(',')})`);
  }
  if (!isAdmin) query = query.eq('visible', true);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

// POST /api/admin/content — add new content
export async function POST(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const legacyReject = rejectLegacyContentBody(body as Record<string, unknown>);
  if (legacyReject) return legacyReject;

  const admin = getAdminClient();

  const { data, error } = await admin.from('content_items').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}

// PUT /api/admin/content — update content
export async function PUT(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const legacyReject = rejectLegacyContentBody(body as Record<string, unknown>);
  if (legacyReject) return legacyReject;

  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const admin = getAdminClient();
  const { data, error } = await admin.from('content_items').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

// DELETE /api/admin/content?id=xxx
export async function DELETE(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const admin = getAdminClient();
  const { error } = await admin.from('content_items').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
