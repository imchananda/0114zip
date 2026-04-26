import { getAdminClient } from '@/lib/supabase';

type SupabaseAdmin = ReturnType<typeof getAdminClient>;

const PLATFORM_TYPE: Record<string, string> = {
  instagram: 'Social', x: 'Social', tiktok: 'Social',
  threads: 'Social', weibo: 'Social', rednote: 'Social',
  facebook: 'Social', youtube: 'Campaign',
};

interface MediaPostRow {
  title: string | null;
  post_url: string;
  platform: string;
}

interface MediaEventRow {
  title: string;
  link: string | null;
  start_date: string | null;
  description: string | null;
}

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

  const postItems = ((posts as MediaPostRow[] | null) ?? []).map((p) => ({
    type: PLATFORM_TYPE[p.platform] ?? 'Social',
    title: p.title || `${p.platform} post`,
    url: p.post_url,
  }));

  const eventItems = ((events as MediaEventRow[] | null) ?? []).map((e) => ({
    type: 'Event',
    title: e.title,
    ...(e.link ? { url: e.link } : {}),
    ...(e.start_date ? { date: e.start_date } : {}),
    ...(e.description ? { description: e.description } : {}),
  }));

  await supabase
    .from('brand_collaborations')
    .update({ media_items: [...eventItems, ...postItems] })
    .eq('id', brandId);
}
