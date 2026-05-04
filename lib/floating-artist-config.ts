import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const db = createClient(supabaseUrl, supabaseKey);

export type FloatingDock = 'top' | 'bottom' | 'left' | 'right';
export type FloatingAlign = 'start' | 'center' | 'end';

export interface FloatingNavItem {
  id: string;
  href: string;
  icon: string;
  color?: string;
  /** next-intl key, e.g. state.namtan */
  labelKey?: string;
  labelEn?: string;
  labelTh?: string;
  isArtist?: boolean;
}

export interface FloatingArtistSelectorConfig {
  items: FloatingNavItem[];
  dock: FloatingDock;
  align: FloatingAlign;
  visibility: {
    home: boolean;
    artistPages: boolean;
  };
}

export const DEFAULT_FLOATING_ARTIST_ITEMS: FloatingNavItem[] = [
  { id: 'both', labelKey: 'state.namtanfilm', href: '/artist/both', color: 'var(--nf-gradient)', icon: '💕', isArtist: true },
  { id: 'namtan', labelKey: 'state.namtan', href: '/artist/namtan', color: 'var(--namtan-teal)', icon: '💙', isArtist: true },
  { id: 'film', labelKey: 'state.film', href: '/artist/film', color: 'var(--film-gold)', icon: '💛', isArtist: true },
  { id: 'lunar', labelKey: 'state.lunar', href: '/artist/lunar', color: 'var(--nf-gradient)', icon: '🌙', isArtist: true },
  { id: 'challenges', labelKey: 'nav.challenges', href: '/challenges', color: '#8B5CF6', icon: '🎮', isArtist: false },
];

export const DEFAULT_FLOATING_ARTIST_CONFIG: FloatingArtistSelectorConfig = {
  items: DEFAULT_FLOATING_ARTIST_ITEMS,
  dock: 'bottom',
  align: 'center',
  visibility: { home: true, artistPages: true },
};

function isDock(v: unknown): v is FloatingDock {
  return v === 'top' || v === 'bottom' || v === 'left' || v === 'right';
}

function isAlign(v: unknown): v is FloatingAlign {
  return v === 'start' || v === 'center' || v === 'end';
}

export function normalizeFloatingArtistSelectorConfig(raw: unknown): FloatingArtistSelectorConfig {
  if (!raw || typeof raw !== 'object') return DEFAULT_FLOATING_ARTIST_CONFIG;
  const o = raw as Record<string, unknown>;
  const itemsRaw = o.items;
  let items: FloatingNavItem[] = DEFAULT_FLOATING_ARTIST_ITEMS;
  if (Array.isArray(itemsRaw)) {
    const parsed: FloatingNavItem[] = [];
    for (const row of itemsRaw) {
      if (!row || typeof row !== 'object') continue;
      const r = row as Record<string, unknown>;
      const id = typeof r.id === 'string' && r.id ? r.id : `item-${parsed.length}`;
      const href = typeof r.href === 'string' ? r.href : '/';
      const icon = typeof r.icon === 'string' ? r.icon : '🔗';
      parsed.push({
        id,
        href,
        icon,
        ...(typeof r.color === 'string' && r.color ? { color: r.color } : {}),
        ...(typeof r.labelKey === 'string' && r.labelKey ? { labelKey: r.labelKey } : {}),
        ...(typeof r.labelEn === 'string' ? { labelEn: r.labelEn } : {}),
        ...(typeof r.labelTh === 'string' ? { labelTh: r.labelTh } : {}),
        ...(r.isArtist === true ? { isArtist: true } : {}),
      });
    }
    if (parsed.length > 0) items = parsed;
  }
  const vis = o.visibility && typeof o.visibility === 'object' ? (o.visibility as Record<string, unknown>) : {};
  return {
    items,
    dock: isDock(o.dock) ? o.dock : DEFAULT_FLOATING_ARTIST_CONFIG.dock,
    align: isAlign(o.align) ? o.align : DEFAULT_FLOATING_ARTIST_CONFIG.align,
    visibility: {
      home: vis.home !== false,
      artistPages: vis.artistPages !== false,
    },
  };
}

export async function fetchFloatingArtistSelectorConfig(): Promise<FloatingArtistSelectorConfig> {
  const { data, error } = await db.from('site_settings').select('value').eq('key', 'floatingArtistSelector').maybeSingle();
  if (error || data?.value === undefined || data?.value === null) {
    return DEFAULT_FLOATING_ARTIST_CONFIG;
  }
  return normalizeFloatingArtistSelectorConfig(data.value);
}

/** Extra padding on `<main>` so fixed dock does not cover content */
export function mainSpacerClassForDock(dock: FloatingDock): string {
  switch (dock) {
    case 'bottom':
      return 'pb-[max(7rem,env(safe-area-inset-bottom))] md:pb-[max(5.5rem,env(safe-area-inset-bottom))]';
    case 'top':
      return 'pt-[max(5.5rem,env(safe-area-inset-top))]';
    case 'left':
      return 'pl-[max(5.5rem,env(safe-area-inset-left))]';
    case 'right':
      return 'pr-[max(5.5rem,env(safe-area-inset-right))]';
    default:
      return '';
  }
}
