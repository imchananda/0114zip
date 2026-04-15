import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, supabase } from '@/lib/supabase';
import { verifyAdmin } from '@/lib/auth';

// GET /api/admin/banners — public read (hero components also use this)
export async function GET() {
  const { data, error } = await supabase
    .from('banner_configs')
    .select('*')
    .order('slug');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// PUT /api/admin/banners — update a banner config by slug
// Body: { slug, title, title_thai, tagline, tagline_thai, banner_image, accent_color }
export async function PUT(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  if (!body.slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 });

  const { data, error } = await getAdminClient()
    .from('banner_configs')
    .upsert({ ...body, updated_at: new Date().toISOString() }, { onConflict: 'slug' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
