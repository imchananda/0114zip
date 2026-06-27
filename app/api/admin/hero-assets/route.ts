import { randomUUID } from 'node:crypto';
import { imageSize } from 'image-size';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { verifyAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const HERO_CATEGORY = 'hero';
const HERO_BUCKET = 'content-images';
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

function readImageDimensions(buffer: Buffer): { width: number | null; height: number | null } {
  try {
    const dimensions = imageSize(buffer);
    return {
      width: typeof dimensions.width === 'number' ? dimensions.width : null,
      height: typeof dimensions.height === 'number' ? dimensions.height : null,
    };
  } catch {
    return { width: null, height: null };
  }
}

function sanitizeLimit(value: string | null): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 20;
  const rounded = Math.round(parsed);
  if (rounded < 1) return 1;
  if (rounded > 100) return 100;
  return rounded;
}

function sanitizePage(value: string | null): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 1;
  const rounded = Math.round(parsed);
  return rounded > 0 ? rounded : 1;
}

function sanitizeSearch(value: string | null): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function sanitizeCategory(value: string | null): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function safeExtension(fileName: string, mimeType: string): string {
  const fromName = fileName.split('.').pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{2,5}$/.test(fromName)) return fromName;
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/webp') return 'webp';
  if (mimeType === 'image/gif') return 'gif';
  return 'jpg';
}

export async function GET(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const page = sanitizePage(req.nextUrl.searchParams.get('page'));
  const limit = sanitizeLimit(req.nextUrl.searchParams.get('limit'));
  const search = sanitizeSearch(req.nextUrl.searchParams.get('search'));
  const category = sanitizeCategory(req.nextUrl.searchParams.get('category'));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const admin = getAdminClient();
  let query = admin
    .from('gallery_items')
    .select('id, image, title, category, created_at, visible, width, height, mime_type, storage_path', { count: 'exact' })
    .eq('visible', true)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (category) {
    query = query.eq('category', category);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,image.ilike.%${search}%`);
  }

  const { data, count, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const items = (data ?? []).map((item) => ({
    id: item.id,
    url: item.image,
    title: item.title,
    category: item.category,
    createdAt: item.created_at,
    visible: item.visible,
    width: item.width,
    height: item.height,
    mimeType: item.mime_type,
    storagePath: item.storage_path,
  }));

  return NextResponse.json({
    items,
    page,
    limit,
    total: count ?? 0,
    hasMore: typeof count === 'number' ? page * limit < count : false,
  });
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const titleInput = formData.get('title');
    const title = typeof titleInput === 'string' ? titleInput.trim() : '';

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: jpg, png, webp, gif' }, { status: 400 });
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
    }

    const admin = getAdminClient();
    const extension = safeExtension(file.name, file.type);
    const path = `hero/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const dimensions = readImageDimensions(buffer);

    const { error: uploadError } = await admin.storage
      .from(HERO_BUCKET)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const publicUrl = admin.storage.from(HERO_BUCKET).getPublicUrl(path).data.publicUrl;

    const { data: record, error: insertError } = await admin
      .from('gallery_items')
      .insert([{
        image: publicUrl,
        title: title || null,
        category: HERO_CATEGORY,
        visible: true,
        storage_path: path,
        mime_type: file.type,
        width: dimensions.width,
        height: dimensions.height,
      }])
      .select('id, image, title, category, created_at, visible, width, height, mime_type, storage_path')
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      id: record.id,
      url: record.image,
      title: record.title,
      category: record.category,
      createdAt: record.created_at,
      visible: record.visible,
      storagePath: record.storage_path,
      mimeType: record.mime_type,
      fileSize: file.size,
      width: record.width,
      height: record.height,
    });
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

