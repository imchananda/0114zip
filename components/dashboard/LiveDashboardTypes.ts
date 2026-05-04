export const PROXY_HOSTS = ['upload.wikimedia.org', 'commons.wikimedia.org', 'encrypted-tbn0.gstatic.com'];
export function imgSrc(url: string): string {
  try {
    const h = new URL(url).hostname;
    if (PROXY_HOSTS.includes(h)) return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  } catch { /* ignore */ }
  return url.replace(/^http:\/\//, 'https://');
}

export type Artist = 'namtan' | 'film' | 'luna';

export type WidgetType =
  | 'ig_followers' | 'x_followers' | 'tiktok_followers' | 'weibo_followers'
  | 'namtan_emv'  | 'film_emv'    | 'emv_split'
  | 'fan_audience'
  | 'namtan_portrait' | 'film_portrait'
  | 'featured_series' | 'featured_music'
  | 'series_count' | 'brands_count' | 'awards_count'
  | 'nt_brands_list' | 'fl_brands_list'
  | 'nt_works_pie'   | 'fl_works_pie'
  | 'hidden';

export type StatsTileType =
  | 'nt_awards' | 'fl_awards'
  | 'nt_brands' | 'fl_brands'
  | 'nt_ig'     | 'fl_ig'
  | 'nt_x'      | 'fl_x'
  | 'nt_tiktok' | 'fl_tiktok'
  | 'nt_weibo'  | 'fl_weibo'
  | 'nt_series' | 'fl_series'
  | 'nt_emv'    | 'fl_emv'
  | 'hidden';

export const STATS_TILE_OPTIONS: { value: StatsTileType; label: string }[] = [
  { value: 'nt_awards',  label: '🏆 น้ำตาล Awards' },
  { value: 'fl_awards',  label: '🏆 ฟิล์ม Awards' },
  { value: 'nt_brands',  label: '🏷️ น้ำตาล Brands' },
  { value: 'fl_brands',  label: '🏷️ ฟิล์ม Brands' },
  { value: 'nt_ig',      label: '📸 น้ำตาล IG Followers' },
  { value: 'fl_ig',      label: '📸 ฟิล์ม IG Followers' },
  { value: 'nt_x',       label: '𝕏 น้ำตาล X Followers' },
  { value: 'fl_x',       label: '𝕏 ฟิล์ม X Followers' },
  { value: 'nt_tiktok',  label: '🎵 น้ำตาล TikTok' },
  { value: 'fl_tiktok',  label: '🎵 ฟิล์ม TikTok' },
  { value: 'nt_weibo',   label: '🌐 น้ำตาล Weibo' },
  { value: 'fl_weibo',   label: '🌐 ฟิล์ม Weibo' },
  { value: 'nt_series',  label: '📺 น้ำตาล Series' },
  { value: 'fl_series',  label: '📺 ฟิล์ม Series' },
  { value: 'nt_emv',     label: '💙 น้ำตาล EMV' },
  { value: 'fl_emv',     label: '💛 ฟิล์ม EMV' },
  { value: 'hidden',     label: '✕ ซ่อน' },
];

export interface StatsStripDef {
  id: string;
  label: string;
  defaultTile: StatsTileType;
}

export const STATS_STRIP_DEFS: StatsStripDef[] = [
  { id: '1', label: 'Tile 1', defaultTile: 'nt_awards' },
  { id: '2', label: 'Tile 2', defaultTile: 'fl_awards' },
  { id: '3', label: 'Tile 3', defaultTile: 'nt_brands' },
  { id: '4', label: 'Tile 4', defaultTile: 'fl_brands' },
  { id: '5', label: 'Tile 5', defaultTile: 'nt_ig' },
  { id: '6', label: 'Tile 6', defaultTile: 'fl_ig' },
];

export const DEFAULT_STATS_STRIP: Record<string, StatsTileType> = Object.fromEntries(
  STATS_STRIP_DEFS.map(s => [s.id, s.defaultTile])
) as Record<string, StatsTileType>;

export const WIDGET_OPTIONS: { value: WidgetType; label: string }[] = [
  { value: 'ig_followers',     label: '📸 Instagram Followers' },
  { value: 'x_followers',      label: '𝕏 X Followers' },
  { value: 'tiktok_followers', label: '🎵 TikTok Followers' },
  { value: 'weibo_followers',  label: '🌐 Weibo Followers' },
  { value: 'namtan_emv',       label: '💙 น้ำตาล — EMV' },
  { value: 'film_emv',         label: '💛 ฟิล์ม — EMV' },
  { value: 'emv_split',        label: '🍩 EMV Split Donut' },
  { value: 'fan_audience',     label: '🌍 Fan Audience' },
  { value: 'namtan_portrait',  label: '🖼️ Portrait น้ำตาล' },
  { value: 'film_portrait',    label: '🖼️ Portrait ฟิล์ม' },
  { value: 'featured_series',  label: '🎥 Featured Series' },
  { value: 'featured_music',   label: '🎶 Featured Music' },
  { value: 'series_count',     label: '📊 Series & Works Count' },
  { value: 'brands_count',     label: '🏷️ Brand Collabs Count' },
  { value: 'awards_count',     label: '🏆 Awards Count' },
  { value: 'nt_brands_list',   label: '🏷️ รวม Brands น้ำตาล' },
  { value: 'fl_brands_list',   label: '🏷️ รวม Brands ฟิล์ม' },
  { value: 'nt_works_pie',     label: '🥧 Pie Chart งาน น้ำตาล' },
  { value: 'fl_works_pie',     label: '🥧 Pie Chart งาน ฟิล์ม' },
  { value: 'hidden',           label: '✕ ซ่อน' },
];

export interface SlotDef {
  id: string;
  label: string;
  defaultWidget: WidgetType;
  gridClass: string;
  delay: number;
}

export const SLOT_DEFS: SlotDef[] = [
  { id: 'A', label: 'Row 1, Col 1',   defaultWidget: 'ig_followers',     delay: 0,    gridClass: 'col-start-1 row-start-1 md:col-start-1 md:row-start-1' },
  { id: 'B', label: 'Row 1, Col 2',   defaultWidget: 'x_followers',      delay: 0.07, gridClass: 'col-start-2 row-start-1 md:col-start-2 md:row-start-1' },
  { id: 'C', label: 'Col 4, Tall (1–2)', defaultWidget: 'fan_audience',   delay: 0.1,  gridClass: 'col-start-1 row-start-3 md:col-start-4 md:row-start-1 md:row-span-2' },
  { id: 'D', label: 'Col 3, Tall (1–2)', defaultWidget: 'namtan_portrait',  delay: 0.14, gridClass: 'col-start-1 row-start-2 md:col-start-3 md:row-start-1 md:row-span-2' },
  { id: 'E', label: 'Row 2, Col 1',   defaultWidget: 'film_emv',         delay: 0.19, gridClass: 'col-start-1 row-start-2 md:col-start-1 md:row-start-2' },
  { id: 'F', label: 'Row 2, Col 2',   defaultWidget: 'emv_split',        delay: 0.23, gridClass: 'col-start-2 row-start-2 md:col-start-2 md:row-start-2' },
  { id: 'H', label: 'Row 3, Col 1',   defaultWidget: 'film_portrait',    delay: 0.31, gridClass: 'col-start-2 row-start-5 row-span-2 md:col-start-1 md:row-start-3 md:row-span-1' },
  { id: 'I', label: 'Row 3, Col 2',   defaultWidget: 'tiktok_followers', delay: 0.35, gridClass: 'col-start-1 row-start-5 md:col-start-2 md:row-start-3' },
  { id: 'J', label: 'Row 3, Col 3',   defaultWidget: 'weibo_followers',  delay: 0.39, gridClass: 'col-start-1 row-start-6 md:col-start-3 md:row-start-3' },
  { id: 'K', label: 'Row 3, Col 4',   defaultWidget: 'series_count',     delay: 0.43, gridClass: 'col-start-2 row-start-6 md:col-start-4 md:row-start-3' },
];

export const DEFAULT_BENTO: Record<string, WidgetType> = Object.fromEntries(
  SLOT_DEFS.map(s => [s.id, s.defaultWidget])
) as Record<string, WidgetType>;

export interface BentoSlotLink {
  namtan?: string;
  film?: string;
  single?: string;
}

const DUAL_WIDGETS: Set<WidgetType> = new Set([
  'ig_followers', 'x_followers', 'tiktok_followers', 'weibo_followers',
  'emv_split', 'fan_audience', 'series_count', 'brands_count', 'awards_count',
]);
export function isDualWidget(w: WidgetType): boolean { return DUAL_WIDGETS.has(w); }

export interface LiveDashboardConfig {
  showArtists:         string[];
  showPlatforms:       string[];
  showFollowerSection: boolean;
  showQuickLinks:      boolean;
  bento:               Record<string, WidgetType>;
  statsStrip:          Record<string, StatsTileType>;
  bentoLinks?:         Record<string, BentoSlotLink>;
}
export const CFG_DEFAULT: LiveDashboardConfig = {
  showArtists: ['namtan', 'film', 'luna'],
  showPlatforms: ['ig', 'x', 'tiktok', 'weibo'],
  showFollowerSection: true,
  showQuickLinks: true,
  bento: DEFAULT_BENTO,
  statsStrip: DEFAULT_STATS_STRIP,
  bentoLinks: {},
};

export interface IgPost    { artist: Artist; emv: number; post_date: string; }
export interface BrandCollab { artists: Artist[]; brand_name: string; category?: string; collab_type?: string; }
export interface EngData {
  latestSnapshots: Record<Artist, Record<string, number>>;
  igPosts:         Record<Artist, IgPost[]>;
  brandCollabs:    BrandCollab[];
}
export interface ArtistProfile { id: string; photo_url?: string | null; }
export interface FanCountry    { name: string; value: number; color: string; }

export interface ContentDbItem {
  id: string;
  title: string;
  title_thai?: string;
  year?: number;
  content_type: string;
  actors: string[];
  image?: string | null;
  links?: { platform: string; url: string }[];
}

export type StaticWorkItem = {
  actors: string[];
  type?: string;
  content_type?: string;
  year?: number;
};

export type StaticAwardItem = {
  actors?: string[];
  year?: number;
};

export const PLATFORM_META: Record<string, { label: string }> = {
  youtube: { label: 'YouTube' },
  netflix: { label: 'Netflix' },
  wetv:    { label: 'WeTV'    },
  viu:     { label: 'Viu'     },
  iqiyi:   { label: 'iQIYI'  },
  oned:    { label: 'OneD'    },
  ch3:     { label: 'CH3+'    },
  gmm:     { label: 'GMM25'   },
  other:   { label: 'Link'    },
};

export const NT = 'var(--namtan-teal)';
export const FL = 'var(--film-gold)';

export function fmtEMV(n: number): string {
  if (!n) return '฿—';
  if (n >= 1_000_000) return `฿${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `฿${(n / 1_000).toFixed(0)}K`;
  return `฿${n.toLocaleString('th-TH')}`;
}
export function fmtFol(n: number): string {
  if (!n) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}
