import { buildMergeKey } from './normalize';
import type { AdminScheduleItem, MergeScheduleOptions, ScheduleSource } from './types';

function pickPreferred(existing: AdminScheduleItem, incoming: AdminScheduleItem): AdminScheduleItem {
  const mergedSources = Array.from(
    new Set<ScheduleSource>([
      ...(existing.mergedSources ?? [existing.source]),
      ...(incoming.mergedSources ?? [incoming.source]),
    ]),
  );

  const preferIncoming =
    incoming.source === 'fashion_event' ||
    incoming.source === 'media_event' ||
    incoming.source === 'award';

  const primary = preferIncoming ? incoming : existing;
  const secondary = preferIncoming ? existing : incoming;

  return {
    ...primary,
    title: primary.title || secondary.title,
    titleThai: primary.titleThai ?? secondary.titleThai,
    venue: primary.venue ?? secondary.venue,
    link: primary.link ?? secondary.link,
    description: primary.description ?? secondary.description,
    contentItemId: primary.contentItemId ?? secondary.contentItemId,
    brandCollabId: primary.brandCollabId ?? secondary.brandCollabId,
    visible: primary.visible && secondary.visible,
    mergedSources,
  };
}

/**
 * Collapse duplicate schedule rows (product rule: merge).
 * Dedupe key: normalized title + date (day) + actor set.
 */
export function mergeScheduleItems(
  items: AdminScheduleItem[],
  options: MergeScheduleOptions = {},
): AdminScheduleItem[] {
  const strategy = options.strategy ?? 'merge';
  if (strategy === 'none') return [...items];

  const byKey = new Map<string, AdminScheduleItem>();

  for (const item of items) {
    const key = buildMergeKey(item);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, { ...item, mergedSources: item.mergedSources ?? [item.source] });
      continue;
    }
    byKey.set(key, pickPreferred(existing, item));
  }

  return Array.from(byKey.values()).sort(
    (a, b) => new Date(b.scheduledAt.replace(' ', 'T')).getTime()
      - new Date(a.scheduledAt.replace(' ', 'T')).getTime(),
  );
}

/**
 * Skip content_items event rows that are mirrors of fashion/media sync links.
 */
export function isLinkedContentItemMirror(
  contentItemId: string,
  linkedFashionIds: ReadonlySet<string>,
  linkedMediaIds: ReadonlySet<string>,
): boolean {
  return linkedFashionIds.has(contentItemId) || linkedMediaIds.has(contentItemId);
}
