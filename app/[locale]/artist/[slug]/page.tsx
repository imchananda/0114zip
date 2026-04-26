import { notFound } from 'next/navigation';
import { ContentItem, Platform, ViewState } from '@/types';
import { supabase } from '@/lib/supabase';
import { ArtistTabs } from '@/components/artist/ArtistTabs';

const VALID_SLUGS: ViewState[] = ['namtan', 'film', 'both', 'lunar'];

interface ContentRow {
  id: string;
  title: string;
  title_thai?: string | null;
  year?: number | null;
  image?: string | null;
  actors?: string[] | null;
  content_type?: string | null;
  description?: string | null;
  link?: string | null;
  role?: string | null;
  links?: unknown;
}

function isPlatform(value: string): value is Platform {
  return ['youtube', 'netflix', 'wetv', 'iqiyi', 'viu', 'ch3', 'gmm', 'other'].includes(value);
}

function normalizeContentType(contentType?: string | null): ContentItem['contentType'] {
  if (contentType === 'variety' || contentType === 'event' || contentType === 'magazine' || contentType === 'award') {
    return contentType;
  }
  return 'series';
}

function normalizeActors(actors?: string[] | null): ('namtan' | 'film')[] {
  return (actors ?? []).filter((a): a is 'namtan' | 'film' => a === 'namtan' || a === 'film');
}

function normalizeLinks(links: unknown): { platform: Platform; url: string }[] | undefined {
  if (!Array.isArray(links)) return undefined;
  const normalized = links
    .filter((l): l is { platform?: unknown; url?: unknown } => !!l && typeof l === 'object')
    .map((l) => ({
      platform: typeof l.platform === 'string' && isPlatform(l.platform) ? l.platform : 'other',
      url: typeof l.url === 'string' ? l.url : '',
    }))
    .filter((l) => l.url.length > 0);
  return normalized.length > 0 ? normalized : undefined;
}

export default async function ArtistPage({
  params
}: {
  params: Promise<{ slug: string, locale: string }>
}) {
  const { slug: slugParam } = await params;
  const slug = slugParam as ViewState;
  
  if (!VALID_SLUGS.includes(slug)) {
    notFound();
  }

  // Fetch content server-side from Supabase
  const { data } = await supabase
    .from('content_items')
    .select('*')
    .eq('visible', true)
    .order('sort_order', { ascending: true })
    .order('year', { ascending: false }) as { data: ContentRow[] | null };

  const allContent: ContentItem[] = (data ?? []).map((d) => {
    const contentType = normalizeContentType(d.content_type);
    const base = {
      id: d.id,
      title: d.title,
      titleThai: d.title_thai ?? undefined,
      year: d.year ?? new Date().getFullYear(),
      image: d.image || '/images/placeholders/content.jpg',
      actors: normalizeActors(d.actors),
    };

    if (contentType === 'award') {
      return {
        contentType: 'award',
        id: d.id,
        awardName: d.title,
        ceremony: d.description || 'Award',
        year: d.year ?? new Date().getFullYear(),
        actors: normalizeActors(d.actors),
        image: d.image || '/images/placeholders/content.jpg',
        link: d.link ?? undefined,
        description: d.description ?? undefined,
      };
    }

    if (contentType === 'magazine') {
      return {
        ...base,
        contentType: 'magazine',
        magazineName: d.title,
        issue: undefined,
        description: d.description ?? undefined,
        link: d.link ?? undefined,
      };
    }

    if (contentType === 'event') {
      return {
        ...base,
        contentType: 'event',
        eventType: 'other',
        description: d.description ?? undefined,
        link: d.link ?? undefined,
      };
    }

    if (contentType === 'variety') {
      return {
        ...base,
        contentType: 'variety',
        link: d.link ?? undefined,
      };
    }

    return {
      ...base,
      contentType: 'series',
      role: d.role ?? undefined,
      description: d.description ?? undefined,
      links: normalizeLinks(d.links),
    };
  });

  return (
    <ArtistTabs 
      slug={slug} 
      allContent={allContent} 
    />
  );
}
