import type { AdminScheduleItem, ScheduleCategory } from './types';

export type PublicScheduleEventType =
  | 'event'
  | 'fashion'
  | 'show'
  | 'concert'
  | 'fanmeet'
  | 'live'
  | 'release'
  | 'award'
  | 'media';

/** Legacy-compatible shape for /api/schedule and homepage consumers */
export interface PublicScheduleEvent {
  id: string;
  title: string;
  title_thai?: string | null;
  event_type: PublicScheduleEventType;
  date: string;
  venue?: string | null;
  actors: string[];
  link?: string | null;
  description?: string | null;
  source?: AdminScheduleItem['source'];
}

const PUBLIC_EVENT_TYPES = new Set<string>([
  'event',
  'fashion',
  'show',
  'concert',
  'fanmeet',
  'live',
  'release',
  'award',
  'media',
]);

function toPublicEventType(category: ScheduleCategory): PublicScheduleEventType {
  if (PUBLIC_EVENT_TYPES.has(category)) {
    return category as PublicScheduleEventType;
  }
  return 'event';
}

export function toPublicScheduleEvent(item: AdminScheduleItem): PublicScheduleEvent {
  return {
    id: item.id,
    title: item.title,
    title_thai: item.titleThai,
    event_type: toPublicEventType(item.category),
    date: item.scheduledAt,
    venue: item.venue,
    actors: item.actors,
    link: item.link,
    description: item.description,
    source: item.source,
  };
}

export function toPublicScheduleEvents(items: AdminScheduleItem[]): PublicScheduleEvent[] {
  return items.map(toPublicScheduleEvent);
}
