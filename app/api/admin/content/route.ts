import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, supabase } from '@/lib/supabase';
import { verifyAdmin } from '@/lib/auth';

// GET /api/admin/content?type=series
export async function GET(req: NextRequest) {
  const isAdmin = await verifyAdmin(req);
  const client = isAdmin ? getAdminClient() : supabase;

  const type = req.nextUrl.searchParams.get('type');
  let query = client.from('content_items').select('*').order('sort_order', { ascending: true }).order('year', { ascending: false });

  if (type) query = query.eq('content_type', type);
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
