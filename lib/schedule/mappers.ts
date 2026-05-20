import {
  actorsMergeKey,
  composeScheduleId,
  dateOnlyToScheduledAt,
  normalizeActors,
  normalizeScheduledAt,
  resolveEventTypeCategory,
  resolveWorkCategory,
} from './normalize';
import type {
  AdminScheduleItem,
  AwardScheduleRow,
  ContentItemScheduleRow,
  FashionEventScheduleRow,
  MapContentEventOptions,
  MediaEventScheduleRow,
  ScheduleCategory,
} from './types';

function baseItem(
  partial: Omit<AdminScheduleItem, 'id'> & { source: AdminScheduleItem['source']; sourceId: string },
): AdminScheduleItem {
  return {
    ...partial,
    id: composeScheduleId(partial.source, partial.sourceId),
  };
}

export function mapContentEventRow(
  row: ContentItemScheduleRow,
  options: MapContentEventOptions = {},
): AdminScheduleItem | null {
  if (row.content_type !== 'event') return null;
  if (options.isLinkedMirror) return null;

  const scheduledAt = normalizeScheduledAt(row.date, row.year);
  if (!scheduledAt) return null;

  return baseItem({
    source: 'content_event',
    sourceId: row.id,
    contentItemId: row.id,
    title: row.title,
    titleThai: row.title_thai,
    category: resolveEventTypeCategory(row.event_type),
    scheduledAt,
    venue: row.venue,
    link: row.link,
    description: row.description,
    actors: normalizeActors(row.actors),
    visible: row.visible ?? true,
    editable: true,
    adminEditPath: '/admin/schedule',
    brandCollabId: row.brand_collab_id ?? null,
  });
}

export function mapContentWorkRow(row: ContentItemScheduleRow): AdminScheduleItem | null {
  const category = resolveWorkCategory(row.content_type);
  if (!category) return null;

  const scheduledAt = normalizeScheduledAt(row.date, row.year);
  if (!scheduledAt) return null;

  return baseItem({
    source: 'content_work',
    sourceId: row.id,
    contentItemId: row.id,
    title: row.title,
    titleThai: row.title_thai,
    category,
    scheduledAt,
    link: row.link,
    description: row.description,
    actors: normalizeActors(row.actors),
    visible: row.visible ?? true,
    editable: false,
    adminEditPath: '/admin/content',
    brandCollabId: row.brand_collab_id ?? null,
  });
}

export function mapFashionEventRow(row: FashionEventScheduleRow): AdminScheduleItem | null {
  const scheduledAt = dateOnlyToScheduledAt(row.event_date);
  if (!scheduledAt) return null;

  const category: ScheduleCategory = row.category === 'magazine' ? 'fashion' : 'fashion';
  const descParts = [
    row.brands?.length ? row.brands.join(', ') : '',
    row.hashtag?.trim() ?? '',
  ].filter(Boolean);

  return baseItem({
    source: 'fashion_event',
    sourceId: row.id,
    contentItemId: row.content_item_id ?? null,
    title: row.event_name,
    titleThai: row.title_thai,
    category,
    scheduledAt,
    venue: row.location,
    description: descParts.length > 0 ? descParts.join('\n') : null,
    actors: normalizeActors(row.actors),
    visible: row.visible ?? true,
    editable: false,
    adminEditPath: '/admin/fashion',
  });
}

export function mapAwardRow(row: AwardScheduleRow): AdminScheduleItem | null {
  if (!row.show_on_schedule) return null;

  const scheduledAt =
    dateOnlyToScheduledAt(row.ceremony_date) ??
    normalizeScheduledAt(null, row.year);
  if (!scheduledAt) return null;

  const artist = row.artist?.trim().toLowerCase() || 'both';
  const actors =
    artist === 'both' ? ['namtan', 'film', 'both']
    : artist === 'namtan' ? ['namtan']
    : artist === 'film' ? ['film']
    : normalizeActors([artist]);

  return baseItem({
    source: 'award',
    sourceId: row.id,
    title: row.title,
    titleThai: row.title_thai,
    category: 'award',
    scheduledAt,
    description: `${row.show} · ${row.category} · ${row.result}`,
    actors,
    visible: true,
    editable: false,
    adminEditPath: '/admin/awards',
  });
}

export function mapMediaEventRow(row: MediaEventScheduleRow): AdminScheduleItem | null {
  const scheduledAt = dateOnlyToScheduledAt(row.start_date);
  if (!scheduledAt) return null;

  return baseItem({
    source: 'media_event',
    sourceId: row.id,
    contentItemId: row.content_item_id ?? null,
    title: row.title,
    category: resolveEventTypeCategory(row.event_type ?? 'event'),
    scheduledAt,
    venue: row.venue,
    link: row.link,
    description: row.description,
    actors: normalizeActors(row.actors),
    visible: row.is_active ?? true,
    editable: false,
    adminEditPath: '/admin/media',
    brandCollabId: row.brand_collab_id ?? null,
  });
}

/** Exported for tests — stable merge fingerprint inputs */
export function scheduleItemFingerprint(item: AdminScheduleItem): string {
  return `${item.title}|${item.scheduledAt.slice(0, 10)}|${actorsMergeKey(item.actors)}`;
}
