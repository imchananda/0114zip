import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import * as jose from 'jose';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'namtanfilm-admin-secret-change-this-in-production';

type UserRow = { id: string };

async function checkAdminAuth(): Promise<boolean> {
  try {
    const token = (await cookies()).get('admin_session')?.value;
    if (!token) return false;
    const secret = new TextEncoder().encode(JWT_SECRET);
    await jose.jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

// GET /api/admin/notifications — fetch recent broadcast history
export async function GET() {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const adminClient = getAdminClient();
    const { data, error } = await adminClient
      .from('user_notifications')
      .select('type, title, body, link, created_at')
      .order('created_at', { ascending: false })
      .limit(300);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Deduplicate broadcasts: same title sent within the same minute = 1 broadcast
    const seen = new Map<string, { count: number; type: string; title: string; body: string | null; link: string | null; created_at: string }>();
    for (const n of data ?? []) {
      const key = `${n.title}||${(n.created_at ?? '').substring(0, 16)}`;
      if (seen.has(key)) {
        seen.get(key)!.count++;
      } else {
        seen.set(key, { count: 1, type: n.type, title: n.title, body: n.body, link: n.link, created_at: n.created_at });
      }
    }

    return NextResponse.json([...seen.values()].slice(0, 30));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // 1. Verify admin auth
    const token = (await cookies()).get('admin_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      await jose.jwtVerify(token, secret);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { title, body, link, type } = await req.json();
    if (!title || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const adminClient = getAdminClient();

    // 2. Get all users
    const { data: users, error: usersErr } = await adminClient.from('users').select('id');
    
    if (usersErr) {
      console.warn("Could not load users table, broadcasting skipped.", usersErr);
      return NextResponse.json({ error: 'Failed to retrieve users' }, { status: 500 });
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ message: 'No users found to notify' });
    }

    // 3. Prepare bulk insert
    const notifications = (users as UserRow[]).map((u) => ({
      user_id: u.id,
      type,
      title,
      body,
      link,
      is_read: false
    }));

    // 4. Execute insert
    const { error: insertErr } = await adminClient.from('user_notifications').insert(notifications);
    if (insertErr) throw insertErr;

    return NextResponse.json({ success: true, count: users.length });

  } catch (error: unknown) {
    console.error('Broadcast Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
