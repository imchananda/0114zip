import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/database.types';

import {
  mapAwardRow,
  mapContentEventRow,
  mapContentWorkRow,
  mapFashionEventRow,
  mapMediaEventRow,
} from './mappers';
import { isLinkedContentItemMirror, mergeScheduleItems } from './merge';
import { scheduleNowString } from './normalize';
import type {
  AdminScheduleItem,
  AggregateScheduleOptions,
  AwardScheduleRow,
  ContentItemScheduleRow,
  FashionEventScheduleRow,
  MediaEventScheduleRow,
  ScheduleSourceToggles,
  ScheduleTimeFilter,
} from './types';
import { DEFAULT_SCHEDULE_SOURCE_TOGGLES as DEFAULT_TOGGLES } from './types';

type DbClient = SupabaseClient<Database>;

const WORK_TYPES = ['series', 'variety', 'music'] as const;

async function fetchLinkedContentItemIds(client: DbClient): Promise<{
  fashion: Set<string>;
  media: Set<string>;
}> {
  const [fashionRes, mediaRes] = await Promise.all([
    client.from('fashion_events').select('content_item_id').not('content_item_id', 'is', null),
    client.from('media_events').select('content_item_id').not('content_item_id', 'is', null),
  ]);

  if (fashionRes.error) throw new Error(fashionRes.error.message);
  if (mediaRes.error) throw new Error(mediaRes.error.message);

  const fashion = new Set(
    (fashionRes.data ?? [])
      .map((row) => row.content_item_id)
      .filter((id): id is string => typeof id === 'string'),
  );
  const media = new Set(
    (mediaRes.data ?? [])
      .map((row) => row.content_item_id)
      .filter((id): id is string => typeof id === 'string'),
  );

  return { fashion, media };
}

function applyVisibilityFilter(
  items: AdminScheduleItem[],
  includeHidden: boolean,
): AdminScheduleItem[] {
  if (includeHidden) return items;
  return items.filter((item) => item.visible);
}

function applyTimeFilter(
  items: AdminScheduleItem[],
  type: ScheduleTimeFilter,
  nowStr: string,
): AdminScheduleItem[] {
  if (type === 'all') {
    return [...items].sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));
  }

  const filtered = items.filter((item) =>
    type === 'upcoming' ? item.scheduledAt >= nowStr : item.scheduledAt < nowStr,
  );

  if (type === 'upcoming') {
    return filtered.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  }
  return filtered.sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));
}

function applyLimit(items: AdminScheduleItem[], limit?: number): AdminScheduleItem[] {
  if (limit === undefined || !Number.isFinite(limit) || limit <= 0) return items;
  return items.slice(0, limit);
}

function mapContentRows(
  rows: ContentItemScheduleRow[],
  linkedFashion: Set<string>,
  linkedMedia: Set<string>,
  sources: ScheduleSourceToggles,
): AdminScheduleItem[] {
  const items: AdminScheduleItem[] = [];

  for (const row of rows) {
    if (row.content_type === 'magazine' || row.content_type === 'award') continue;

    if (row.content_type === 'event' && sources.content_event) {
      const isMirror = isLinkedContentItemMirror(row.id, linkedFashion, linkedMedia);
      const mapped = mapContentEventRow(row, { isLinkedMirror: isMirror });
      if (mapped) items.push(mapped);
      continue;
    }

    if (WORK_TYPES.includes(row.content_type as (typeof WORK_TYPES)[number]) && sources.content_work) {
      const mapped = mapContentWorkRow(row);
      if (mapped) items.push(mapped);
    }
  }

  return items;
}

/**
 * Fetch all enabled schedule sources, normalize, merge duplicates, and filter.
 */
export async function aggregateSchedule(
  client: DbClient,
  options: AggregateScheduleOptions = {},
): Promise<AdminScheduleItem[]> {
  const includeHidden = options.includeHidden ?? false;
  const sources = options.sources ?? DEFAULT_TOGGLES;
  const type = options.type ?? 'all';
  const nowStr = scheduleNowString();

  const linked = await fetchLinkedContentItemIds(client);

  const queries: Promise<void>[] = [];
  const mapped: AdminScheduleItem[] = [];

  if (sources.content_event || sources.content_work) {
    queries.push((async () => {
      let query = client
        .from('content_items')
        .select(
          'id, content_type, title, title_thai, date, year, actors, event_type, venue, link, description, visible, brand_collab_id',
        )
        .in('content_type', ['event', ...WORK_TYPES]);

      if (!includeHidden) query = query.eq('visible', true);

      const { data, error } = await query;
      if (error) throw new Error(error.message);

      mapped.push(
        ...mapContentRows(
          (data ?? []) as ContentItemScheduleRow[],
          linked.fashion,
          linked.media,
          sources,
        ),
      );
    })());
  }

  if (sources.fashion_event) {
    queries.push((async () => {
      let query = client
        .from('fashion_events')
        .select(
          'id, event_name, title_thai, event_date, location, category, actors, hashtag, brands, visible, content_item_id',
        );

      if (!includeHidden) query = query.eq('visible', true);

      const { data, error } = await query;
      if (error) throw new Error(error.message);

      for (const row of (data ?? []) as FashionEventScheduleRow[]) {
        const item = mapFashionEventRow(row);
        if (item) mapped.push(item);
      }
    })());
  }

  if (sources.award) {
    queries.push((async () => {
      const { data, error } = await client
        .from('awards')
        .select(
          'id, title, title_thai, show, year, category, artist, result, ceremony_date, show_on_schedule',
        )
        .eq('show_on_schedule', true);

      if (error) {
        // PR2 columns may not exist until migration_awards_schedule_fields.sql is applied
        if (
          error.message.includes('ceremony_date') ||
          error.message.includes('show_on_schedule')
        ) {
          return;
        }
        throw new Error(error.message);
      }

      for (const row of (data ?? []) as AwardScheduleRow[]) {
        const item = mapAwardRow(row);
        if (item) mapped.push(item);
      }
    })());
  }

  if (sources.media_event) {
    queries.push((async () => {
      let query = client
        .from('media_events')
        .select(
          'id, title, description, start_date, actors, event_type, venue, link, is_active, content_item_id, brand_collab_id',
        );

      if (!includeHidden) query = query.eq('is_active', true);

      const { data, error } = await query;
      if (error) throw new Error(error.message);

      for (const row of (data ?? []) as MediaEventScheduleRow[]) {
        const item = mapMediaEventRow(row);
        if (item) mapped.push(item);
      }
    })());
  }

  await Promise.all(queries);

  const merged = mergeScheduleItems(mapped);
  const visible = applyVisibilityFilter(merged, includeHidden);
  const timed = applyTimeFilter(visible, type, nowStr);
  return applyLimit(timed, options.limit);
}
