import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/database.types';

import {
  DEFAULT_SCHEDULE_SOURCE_TOGGLES,
  SCHEDULE_SOURCES,
  type ScheduleSource,
  type ScheduleSourceToggles,
} from './types';

export const SCHEDULE_SOURCES_SETTINGS_KEY = 'scheduleSources';

export const SCHEDULE_SOURCE_LABELS: Record<
  ScheduleSource,
  { label: string; description: string }
> = {
  content_event: {
    label: '📅 Manual events',
    description: 'คิวงานที่เพิ่มใน /admin/schedule (content_items.event)',
  },
  content_work: {
    label: '🎬 Works & releases',
    description: 'ซีรีส์ / วาไรตี้ / ดนตรี จาก /admin/content',
  },
  fashion_event: {
    label: '👗 Fashion',
    description: 'งานแฟชั่นและนิตยสารจาก /admin/fashion',
  },
  award: {
    label: '🏆 Awards',
    description: 'รางวัลที่เปิด show_on_schedule ใน /admin/awards',
  },
  media_event: {
    label: '📺 Media events',
    description: 'อีเวนต์สื่อจาก /admin/media',
  },
};

function isScheduleSource(key: string): key is ScheduleSource {
  return (SCHEDULE_SOURCES as readonly string[]).includes(key);
}

export function normalizeScheduleSourceToggles(value: unknown): ScheduleSourceToggles {
  const result: ScheduleSourceToggles = { ...DEFAULT_SCHEDULE_SOURCE_TOGGLES };
  if (!value || typeof value !== 'object') return result;

  const record = value as Record<string, unknown>;
  for (const key of SCHEDULE_SOURCES) {
    if (isScheduleSource(key) && typeof record[key] === 'boolean') {
      result[key] = record[key];
    }
  }
  return result;
}

export async function fetchScheduleSourceToggles(
  client: SupabaseClient<Database>,
): Promise<ScheduleSourceToggles> {
  const { data, error } = await client
    .from('site_settings')
    .select('value')
    .eq('key', SCHEDULE_SOURCES_SETTINGS_KEY)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return normalizeScheduleSourceToggles(data?.value);
}
