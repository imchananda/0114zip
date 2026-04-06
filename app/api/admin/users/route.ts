import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { getAuthUserRole } from '@/lib/auth';

// GET /api/admin/users?search=xxx&role=admin&page=1&limit=20
export async function GET(req: NextRequest) {
  const roleAuth = await getAuthUserRole(req);
  if (roleAuth !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized: Admins only' }, { status: 403 });
  }

  const admin = getAdminClient();
  const search = req.nextUrl.searchParams.get('search') || '';
  const role = req.nextUrl.searchParams.get('role') || '';
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  let query = admin
    .from('users')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // Apply search filter
  if (search) {
    query = query.or(`display_name.ilike.%${search}%,email.ilike.%${search}%,username.ilike.%${search}%`);
  }

  // Apply role filter
  if (role && role !== 'all') {
    query = query.eq('role', role);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get role counts for stats
  const { data: allUsers } = await admin.from('users').select('role');
  const roleCounts = {
    total: allUsers?.length || 0,
    admin: 0,
    moderator: 0,
    fan: 0,
    banned: 0,
  };
  allUsers?.forEach((u: { role: string }) => {
    const r = u.role as keyof typeof roleCounts;
    if (r in roleCounts) roleCounts[r]++;
  });

  return NextResponse.json({
    users: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
    roleCounts,
  });
}

// PUT /api/admin/users — update user (role, points, level, badges)
export async function PUT(req: NextRequest) {
  const role = await getAuthUserRole(req);
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized: Admins only' }, { status: 403 });
  }

  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
  }

  // Only allow updating specific fields
  const allowedFields = ['role', 'points', 'level', 'badges', 'display_name', 'avatar_url'];
  const safeUpdates: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (key in updates) {
      safeUpdates[key] = updates[key];
    }
  }

  // Validate role
  if (safeUpdates.role && !['admin', 'moderator', 'fan', 'banned'].includes(safeUpdates.role as string)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  const admin = getAdminClient();
  
  // Update password in Supabase Auth if provided
  if (updates.password && typeof updates.password === 'string') {
    const { error: pwdError } = await admin.auth.admin.updateUserById(id, {
      password: updates.password
    });
    if (pwdError) {
      return NextResponse.json({ error: `Password Error: ${pwdError.message}` }, { status: 500 });
    }
  }

  // Update public user profile
  const { data, error } = await admin
    .from('users')
    .update(safeUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/admin/users?id=xxx&hard=true
export async function DELETE(req: NextRequest) {
  const role = await getAuthUserRole(req);
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized: Admins only' }, { status: 403 });
  }

  const id = req.nextUrl.searchParams.get('id');
  const hardDelete = req.nextUrl.searchParams.get('hard') === 'true';

  if (!id) {
    return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
  }

  const admin = getAdminClient();

  if (hardDelete) {
    // Delete from auth.users (cascade should handle public.users, but we do both to be safe)
    await admin.from('users').delete().eq('id', id);
    const { error: authError } = await admin.auth.admin.deleteUser(id);
    
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, deleted: true });
  }

  // Soft delete / Ban
  const { data, error } = await admin
    .from('users')
    .update({ role: 'banned' })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, user: data });
}
