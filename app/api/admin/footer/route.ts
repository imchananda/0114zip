import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, supabase } from '@/lib/supabase';
import { verifyAdmin } from '@/lib/auth';

export interface FooterSettings {
  titleLeft: string;
  titleRight: string;
  tagline: string;
  copyright: string;
  socialLinks: { name: string; url: string }[];
}

const DEFAULT_FOOTER: FooterSettings = {
  titleLeft: 'Namtan',
  titleRight: 'Film',
  tagline: 'สร้างด้วยความรักจากแฟนคลับ',
  copyright: '© 2024 Fan Project · ไม่ได้เกี่ยวข้องกับต้นสังกัด',
  socialLinks: [
    { name: 'Twitter', url: '#' },
    { name: 'Instagram', url: '#' },
    { name: 'TikTok', url: '#' },
  ],
};

// GET /api/admin/footer
export async function GET() {
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'footer')
    .single();

  if (error || !data) {
    return NextResponse.json(DEFAULT_FOOTER);
  }
  return NextResponse.json({ ...DEFAULT_FOOTER, ...(data.value as object) });
}

// PUT /api/admin/footer
export async function PUT(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body: FooterSettings = await req.json();
  const admin = getAdminClient();

  const { error } = await admin
    .from('site_settings')
    .upsert(
      [{ key: 'footer', value: body, updated_at: new Date().toISOString() }],
      { onConflict: 'key' },
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
