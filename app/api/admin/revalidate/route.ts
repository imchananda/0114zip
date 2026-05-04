import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    // 1. ตรวจสอบสิทธิ์ (Admin Only)
    // สามารถใช้ Service Role Key เป็น Secret Key ในการยืนยันตัวตนได้
    const authHeader = request.headers.get('authorization');
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!serviceKey || serviceKey === 'YOUR_SERVICE_ROLE_KEY_HERE') {
      return NextResponse.json({ error: 'Service Role Key is not configured' }, { status: 500 });
    }

    if (!authHeader || authHeader !== `Bearer ${serviceKey}`) {
      // ตรวจสอบผ่าน Token หากเรียกจากหน้าบ้าน
      // (ในตัวอย่างนี้ใช้ Service Key เพื่อความรัดกุมเวลาเรียกผ่าน Webhook)
      return NextResponse.json({ error: 'Unauthorized: Invalid Admin Secret' }, { status: 401 });
    }

    const body = await request.json();
    const { tag, path, type } = body;

    // 2. สั่งล้าง Cache (On-Demand Revalidation)
    if (tag) {
      revalidateTag(tag);
      return NextResponse.json({ revalidated: true, tag, now: Date.now() });
    }

    if (path) {
      revalidatePath(path, type || 'page');
      return NextResponse.json({ revalidated: true, path, type: type || 'page', now: Date.now() });
    }

    return NextResponse.json({ error: 'Missing "tag" or "path" in request body' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
