import type { ScheduleCategory } from './types';

const WORK_CONTENT_TYPES = new Set(['series', 'variety', 'music']);

const EVENT_TYPE_TO_CATEGORY: Record<string, ScheduleCategory> = {
  event: 'event',
  fashion: 'fashion',
  show: 'show',
  concert: 'concert',
  fanmeet: 'fanmeet',
  live: 'live',
  release: 'release',
  media: 'media',
  award: 'award',
};

const WORK_TYPE_TO_CATEGORY: Record<string, ScheduleCategory> = {
  series: 'release',
  variety: 'show',
  music: 'release',
};

export function composeScheduleId(source: string, sourceId: string): string {
  return `${source}:${sourceId}`;
}

export function normalizeActors(raw: string[] | null | undefined): string[] {
  const actors = (raw ?? []).map((a) => a.trim().toLowerCase()).filter(Boolean);
  if (actors.includes('both')) return ['namtan', 'film', 'both'];
  return Array.from(new Set(actors));
}

export function actorsMergeKey(actors: string[]): string {
  const set = new Set(actors.map((a) => a.toLowerCase()));
  if (set.has('both') || (set.has('namtan') && set.has('film'))) return 'both';
  if (set.has('namtan')) return 'namtan';
  if (set.has('film')) return 'film';
  return 'unknown';
}

/**
 * Coerce DB date/year into schedule contract `YYYY-MM-DD HH:mm`.
 * Works without a date use `YYYY-01-01 12:00:00` from year (product rule).
 */
export function normalizeScheduledAt(
  date: string | null | undefined,
  year?: number | null,
): string | null {
  const trimmed = date?.trim();
  if (trimmed) {
    const normalized = trimmed.includes('T') ? trimmed.replace('T', ' ') : trimmed;
    if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
      return `${normalized} 12:00:00`;
    }
    if (/^\d{4}-\d{2}-\d{2}\s/.test(normalized)) {
      return normalized.length >= 16 ? normalized.slice(0, 16) : `${normalized.slice(0, 10)} 12:00:00`;
    }
    const parsed = new Date(normalized);
    if (!Number.isNaN(parsed.getTime())) {
      const iso = parsed.toISOString().slice(0, 16).replace('T', ' ');
      return iso;
    }
  }

  const y = typeof year === 'number' && Number.isFinite(year) && year > 0 ? year : null;
  if (y !== null) return `${y}-01-01 12:00:00`;

  return null;
}

export function normalizeTitleKey(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function buildMergeKey(item: {
  title: string;
  scheduledAt: string;
  actors: string[];
}): string {
  const day = item.scheduledAt.slice(0, 10);
  return `${normalizeTitleKey(item.title)}|${day}|${actorsMergeKey(item.actors)}`;
}

export function resolveEventTypeCategory(eventType: string | null | undefined): ScheduleCategory {
  const key = (eventType ?? 'event').trim().toLowerCase();
  return EVENT_TYPE_TO_CATEGORY[key] ?? 'event';
}

export function resolveWorkCategory(contentType: string): ScheduleCategory | null {
  if (!WORK_CONTENT_TYPES.has(contentType)) return null;
  return WORK_TYPE_TO_CATEGORY[contentType] ?? 'release';
}

export function isWorkContentType(contentType: string): contentType is 'series' | 'variety' | 'music' {
  return WORK_CONTENT_TYPES.has(contentType);
}

/** ISO date-only from fashion event_date or awards ceremony_date */
export function dateOnlyToScheduledAt(dateOnly: string | null | undefined): string | null {
  if (!dateOnly?.trim()) return null;
  const d = dateOnly.trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
  return `${d} 12:00:00`;
}
