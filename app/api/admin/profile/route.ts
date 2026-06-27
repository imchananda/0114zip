import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, supabase } from '@/lib/supabase';
import { verifyAdmin } from '@/lib/auth';

export const revalidate = 300; // Cache for 5 minutes

// GET /api/admin/profile — public read (artist pages also use this)
export async function GET() {
  const { data, error } = await supabase
    .from('artist_profiles')
    .select('*')
    .order('id');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// PUT /api/admin/profile — update a profile by id ('namtan' | 'film')
export async function PUT(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    // Payload Sanitization: Keep ONLY columns that actually exist in the DB table to prevent column mismatch errors
    const allowedKeys = [
      'id', 'nickname', 'nickname_th', 'full_name', 'full_name_th',
      'birth_date', 'birth_date_th', 'birth_place', 'birth_place_th',
      'education', 'education_th', 'instagram', 'twitter', 'photo_url'
    ];

    const sanitizedBody: Record<string, unknown> = {};
    allowedKeys.forEach((key) => {
      if (body[key] !== undefined) {
        sanitizedBody[key] = body[key];
      }
    });

    const { data, error } = await getAdminClient()
      .from('artist_profiles')
      .upsert({ ...sanitizedBody, updated_at: new Date().toISOString() }, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Database update failed' }, { status: 500 });
  }
}

// POST /api/admin/profile — Secure server-side image upload using getAdminClient() to profiles bucket with Deterministic Naming
export async function POST(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const artistId = formData.get('artistId') as string | null;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    if (!artistId || (artistId !== 'namtan' && artistId !== 'film')) {
      return NextResponse.json({ error: 'Invalid artistId. Expected "namtan" or "film"' }, { status: 400 });
    }

    // Validate type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: jpg, png, webp, gif' }, { status: 400 });
    }

    // Validate size (Max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
    }

    const admin = getAdminClient();
    const ext = file.name.split('.').pop() || 'jpg';
    
    // Deterministic Overwrite Naming to prevent duplicate and orphaned files in Supabase Storage
    const filePath = `artists/${artistId}/profile_main.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to 'profiles' bucket with upsert enabled to overwrite previous images
    const { error: uploadError } = await admin.storage
      .from('profiles')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: urlData } = admin.storage.from('profiles').getPublicUrl(filePath);

    return NextResponse.json({
      url: urlData.publicUrl,
      path: filePath,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'File upload failed' }, { status: 500 });
  }
}
