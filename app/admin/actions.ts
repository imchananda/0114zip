'use server';

import { cookies } from 'next/headers';
import { createSupabaseServer } from '@/lib/supabase';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function clearGlobalCacheAction() {
  try {
    const cookieStore = await cookies();
    const supabase = createSupabaseServer(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify admin role
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin' && profile?.role !== 'superadmin') {
      return { success: false, error: 'Forbidden' };
    }

    // ล้าง Cache ทั้งเว็บ
    revalidatePath('/', 'layout');
    
    return { success: true, timestamp: Date.now() };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return { success: false, error: message };
  }
}

export async function revalidateTagAction(tag: string) {
  try {
    const cookieStore = await cookies();
    const supabase = createSupabaseServer(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin' && profile?.role !== 'superadmin') {
      return { success: false, error: 'Forbidden' };
    }

    revalidateTag(tag);
    
    return { success: true, tag, timestamp: Date.now() };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return { success: false, error: message };
  }
}
