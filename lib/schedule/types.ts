/**
 * Phase Data — canonical admin/public schedule model.
 * PR1: types + contracts only (no API wiring).
 */

export const SCHEDULE_SOURCES = [
  'content_event',
  'content_work',
  'fashion_event',
  'award',
  'media_event',
] as const;

export type ScheduleSource = (typeof SCHEDULE_SOURCES)[number];

/** UI badge / filter values shared by admin and public schedule views */
export const SCHEDULE_CATEGORIES = [
  'event',
  'fashion',
  'show',
  'concert',
  'fanmeet',
  'live',
  'release',
  'award',
  'media',
] as const;

export type ScheduleCategory = (typeof SCHEDULE_CATEGORIES)[number];

export type ContentWorkType = 'series' | 'variety' | 'music';

/** Admin-configurable source whitelist (stored in settings JSON — PR5) */
export type ScheduleSourceToggles = Record<ScheduleSource, boolean>;

export const DEFAULT_SCHEDULE_SOURCE_TOGGLES: ScheduleSourceToggles = {
  content_event: true,
  content_work: true,
  fashion_event: true,
  award: true,
  media_event: true,
};

export interface AdminScheduleItem {
  /** Stable composite id, e.g. `fashion_event:uuid` */
  id: string;
  source: ScheduleSource;
  /** Primary key in the origin table */
  sourceId: string;
  /** Set when a DB sync link exists on the source row */
  contentItemId?: string | null;

  title: string;
  titleThai?: string | null;
  category: ScheduleCategory;
  /** Normalized `YYYY-MM-DD HH:mm` (local display string contract) */
  scheduledAt: string;
  venue?: string | null;
  link?: string | null;
  description?: string | null;
  actors: string[];

  visible: boolean;
  /** Manual content_event rows are editable inline in /admin/schedule */
  editable: boolean;
  adminEditPath?: string;

  brandCollabId?: number | null;
  /** Populated after merge when multiple sources collapse into one row */
  mergedSources?: ScheduleSource[];
}

/** Minimal row shapes for mappers (PR4 aggregator inputs) */

export interface ContentItemScheduleRow {
  id: string;
  content_type: string;
  title: string;
  title_thai?: string | null;
  date?: string | null;
  year?: number | null;
  actors?: string[] | null;
  event_type?: string | null;
  venue?: string | null;
  link?: string | null;
  description?: string | null;
  visible?: boolean | null;
  brand_collab_id?: number | null;
}

export interface FashionEventScheduleRow {
  id: string;
  event_name: string;
  title_thai?: string | null;
  event_date?: string | null;
  location?: string | null;
  category?: string | null;
  actors?: string[] | null;
  hashtag?: string | null;
  brands?: string[] | null;
  visible?: boolean | null;
  content_item_id?: string | null;
}

export interface AwardScheduleRow {
  id: string;
  title: string;
  title_thai?: string | null;
  show: string;
  year: number;
  category: string;
  artist: string;
  result: string;
  /** PR2 — ceremony date for schedule sort/display */
  ceremony_date: string | null;
  /** PR2 — admin toggle in /admin/awards */
  show_on_schedule: boolean;
}

export interface MediaEventScheduleRow {
  id: string;
  title: string;
  description?: string | null;
  start_date?: string | null;
  actors?: string[] | null;
  event_type?: string | null;
  venue?: string | null;
  link?: string | null;
  is_active?: boolean | null;
  content_item_id?: string | null;
  brand_collab_id?: number | null;
}

export interface MapContentEventOptions {
  /** When true, row is mirrored from fashion/media sync — skip in aggregator */
  isLinkedMirror?: boolean;
}

export interface MergeScheduleOptions {
  /** Normalized title/date/actors key merge (product default: merge) */
  strategy?: 'merge' | 'none';
}
