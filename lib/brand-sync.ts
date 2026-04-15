import { getAdminClient } from '@/lib/supabase';

type SupabaseAdmin = ReturnType<typeof getAdminClient>;

const PLATFORM_TYPE: Record<string, string> = {
  instagram: 'Social', x: 'Social', tiktok: 'Social',
  threads: 'Social', weibo: 'Social', rednote: 'Social',
  facebook: 'Social', youtube: 'Campaign',
};

/**
 * Rebuilds brand_collaborations.media_items from ALL linked media_posts + media_events.
 * Called whenever a post or event with brand_collab_id is created/updated/deleted.
 */
export async function syncBrandMediaItems(supabase: SupabaseAdmin, brandId: number) {
  const [{ data: posts }, { data: events }] = await Promise.all([
    supabase
      .from('media_posts')
      .select('id, title, post_url, platform, post_date')
      .eq('brand_collab_id', brandId)
      .eq('is_visible', true)
      .order('post_date', { ascending: false }),
    supabase
      .from('media_events')
      .select('id, title, link, start_date, end_date, description, venue, event_type')
      .eq('brand_collab_id', brandId)
      .eq('is_active', true)
      .order('start_date', { ascending: false }),
  ]);

  const postItems = (posts ?? []).map((p: any) => ({
    type: PLATFORM_TYPE[p.platform as string] ?? 'Social',
    title: (p.title as string | null) || `${p.platform} post`,
    url: p.post_url as string,
  }));

  const eventItems = (events ?? []).map((e: any) => ({
    type: 'Event',
    title: e.title as string,
    ...(e.link ? { url: e.link as string } : {}),
    ...(e.start_date ? { date: e.start_date as string } : {}),
    ...(e.description ? { description: e.description as string } : {}),
  }));

  await supabase
    .from('brand_collaborations')
    .update({ media_items: [...eventItems, ...postItems] })
    .eq('id', brandId);
}
