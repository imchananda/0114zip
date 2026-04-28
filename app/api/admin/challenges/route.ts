import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { verifyAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/admin/challenges
export async function GET(req: NextRequest) {
  if (!(await verifyAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/admin/challenges
export async function POST(req: NextRequest) {
  if (!(await verifyAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { slug, title, description, type, reward_points, questions } = body;
  if (!slug || !title) return NextResponse.json({ error: 'Missing slug or title' }, { status: 400 });

  let parsedQuestions = questions;
  if (typeof questions === 'string') {
    try { parsedQuestions = JSON.parse(questions); } catch {
      return NextResponse.json({ error: 'Invalid questions JSON' }, { status: 400 });
    }
  }

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('challenges')
    .insert({ slug, title, description, type: type ?? 'quiz', reward_points: Number(reward_points) || 10, questions: parsedQuestions ?? [] })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// PUT /api/admin/challenges — update or toggle
export async function PUT(req: NextRequest) {
  if (!(await verifyAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const allowed = ['title', 'slug', 'description', 'type', 'reward_points', 'questions', 'is_active', 'start_date', 'end_date'];
  const safe: Record<string, unknown> = {};
  for (const k of allowed) {
    if (k in updates) safe[k] = updates[k];
  }

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('challenges')
    .update(safe)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/admin/challenges?id=xxx
export async function DELETE(req: NextRequest) {
  if (!(await verifyAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const supabase = getAdminClient();
  const { error } = await supabase.from('challenges').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
