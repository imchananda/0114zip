import type { HomePageData } from '@/lib/homepage-data';
import type { EngData } from '@/components/dashboard/LiveDashboardTypes';
import type { ContentItem, Platform } from '@/types';

export type BrandSectionBrand = {
  id: number;
  artists: string[];
  brand_name: string;
  brand_logo: string | null;
  category: string | null;
  collab_type: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  media_items: { type: string; title: string; url?: string }[] | null;
};

export type TimelineEvent = {
  id: string;
  year: number;
  category: string;
  actor: string;
  icon?: string;
  title?: string;
  title_thai?: string;
  description?: string;
  description_thai?: string;
};

export type ScheduleEvent = {
  id: string;
  title: string;
  title_thai?: string;
  event_type: 'event' | 'show' | 'concert' | 'fanmeet' | 'live' | 'release';
  date: string;
  venue?: string;
  actors: string[];
  link?: string;
};

export type ChallengeItem = {
  id: string;
  title: string;
  description: string;
  type: string;
  participants: number;
  daysLeft: number;
  color: string;
  emoji: string;
};

export type PrizeItem = {
  id: string;
  title: string;
  description: string;
  value: string;
  sponsor?: string;
  deadline: string;
  status: 'open' | 'closed' | 'announced';
  emoji: string;
};

export type MediaPost = {
  id: string;
  event_id: string | null;
  platform: string;
  title: string | null;
  caption: string | null;
  post_url: string;
  thumbnail: string | null;
  artist: string;
  post_date: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  goal_views: number;
  goal_likes: number;
  goal_comments: number;
  goal_shares: number;
  goal_saves: number;
  hashtags: string[];
  is_focus: boolean;
  is_visible: boolean;
};

export type MediaEvent = {
  id: string;
  title: string;
  hashtags: string[];
  is_active: boolean;
  media_posts: MediaPost[];
};

const SAFE_EMOJI = {
  challenge: '🎯',
  prize: '🎁',
} as const;

export function normalizeEngData(data: HomePageData['engData']): EngData {
  const latestSnapshots: EngData['latestSnapshots'] = {
    namtan: data.latestSnapshots.namtan ?? {},
    film: data.latestSnapshots.film ?? {},
    luna: data.latestSnapshots.luna ?? {},
  };

  const igPosts: EngData['igPosts'] = {
    namtan: data.igPosts.namtan ?? [],
    film: data.igPosts.film ?? [],
    luna: data.igPosts.luna ?? [],
  };

  const brandCollabs = (data.brandCollabs ?? []).map((collab) => ({
    brand_name: '',
    category: undefined,
    collab_type: undefined,
    artists: (collab.artists ?? []).filter(
      (artist): artist is 'namtan' | 'film' | 'luna' => artist === 'namtan' || artist === 'film' || artist === 'luna',
    ),
  }));

  return {
    latestSnapshots,
    igPosts,
    brandCollabs,
  };
}

export function normalizeTimelineItems(items: HomePageData['timelineItems']): TimelineEvent[] {
  return (items ?? [])
    .filter((item) => typeof item.id === 'string' && Number.isFinite(item.year))
    .map((item) => ({
      id: item.id,
      year: item.year,
      category: item.category,
      actor: item.actor,
      icon: item.icon,
      title: item.title,
      title_thai: item.title_thai,
      description: item.description,
    }));
}

export function normalizeScheduleEvents(items: HomePageData['scheduleEvents']): ScheduleEvent[] {
  const allowedTypes: ScheduleEvent['event_type'][] = ['event', 'show', 'concert', 'fanmeet', 'live', 'release'];

  return (items ?? [])
    .filter((item) => typeof item.id === 'string' && typeof item.title === 'string')
    .map((item) => ({
      id: item.id,
      title: item.title,
      title_thai: item.title_thai,
      event_type: allowedTypes.includes(item.event_type as ScheduleEvent['event_type'])
        ? (item.event_type as ScheduleEvent['event_type'])
        : 'event',
      date: item.date,
      venue: item.venue,
      actors: item.actors ?? [],
      link: item.link ?? undefined,
    }));
}

export function normalizeChallenges(items: HomePageData['challenges']): ChallengeItem[] {
  return (items ?? [])
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => ({
      id: typeof item.id === 'string' ? item.id : crypto.randomUUID(),
      title: typeof item.title === 'string' ? item.title : 'Untitled Challenge',
      description: typeof item.description === 'string' ? item.description : '',
      type: typeof item.type === 'string' ? item.type : 'General',
      participants: typeof item.participants === 'number' ? item.participants : 0,
      daysLeft: typeof item.daysLeft === 'number' ? item.daysLeft : 0,
      color: typeof item.color === 'string' ? item.color : '#6cbfd0',
      emoji: typeof item.emoji === 'string' ? item.emoji : SAFE_EMOJI.challenge,
    }));
}

export function normalizePrizes(items: HomePageData['prizes']): PrizeItem[] {
  return (items ?? [])
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => ({
      id: typeof item.id === 'string' ? item.id : crypto.randomUUID(),
      title: typeof item.title === 'string' ? item.title : 'Untitled Prize',
      description: typeof item.description === 'string' ? item.description : '',
      value: typeof item.value === 'string' ? item.value : '-',
      sponsor: typeof item.sponsor === 'string' ? item.sponsor : undefined,
      deadline: typeof item.deadline === 'string' ? item.deadline : '-',
      status:
        item.status === 'open' || item.status === 'closed' || item.status === 'announced'
          ? item.status
          : 'open',
      emoji: typeof item.emoji === 'string' ? item.emoji : SAFE_EMOJI.prize,
    }));
}

export function normalizeActors(actors: string[]): Array<'namtan' | 'film'> {
  return actors.filter((actor): actor is 'namtan' | 'film' => actor === 'namtan' || actor === 'film');
}

export function toPlatform(platform: string): Platform {
  const allowed: Platform[] = ['youtube', 'netflix', 'wetv', 'iqiyi', 'viu', 'ch3', 'gmm', 'other'];
  return allowed.includes(platform as Platform) ? (platform as Platform) : 'other';
}

export function normalizeContentItems(items: HomePageData['allContent']): ContentItem[] {
  return (items ?? [])
    .filter((item) => typeof item.id === 'string' && typeof item.title === 'string')
    .map((item) => {
      const actors = normalizeActors(item.actors ?? []);
      const year = item.year ?? new Date().getFullYear();
      const image = item.image ?? '';
      const titleThai = item.title_thai;

      if (item.content_type === 'award') {
        return {
          contentType: 'award',
          id: item.id,
          awardName: item.award_name ?? item.title,
          awardNameThai: titleThai,
          ceremony: item.ceremony ?? '',
          year,
          actors,
          description: item.description,
          image,
        } as ContentItem;
      }

      if (item.content_type === 'magazine') {
        return {
          contentType: 'magazine',
          id: item.id,
          title: item.title,
          titleThai,
          year,
          actors,
          image,
          magazineName: item.magazine_name ?? '',
          issue: item.issue,
          description: item.description,
        } as ContentItem;
      }

      if (item.content_type === 'event') {
        return {
          contentType: 'event',
          id: item.id,
          title: item.title,
          titleThai,
          year,
          actors,
          image,
          eventType: 'other',
          description: item.description,
          link: item.links?.[0]?.url,
        } as ContentItem;
      }

      if (item.content_type === 'variety' || item.content_type === 'music') {
        return {
          contentType: 'variety',
          id: item.id,
          title: item.title,
          titleThai,
          year,
          actors,
          image,
          link: item.links?.[0]?.url,
        } as ContentItem;
      }

      return {
        contentType: 'series',
        id: item.id,
        title: item.title,
        titleThai,
        year,
        actors,
        image,
        description: item.description,
        links: (item.links ?? []).map((link) => ({ platform: toPlatform(link.platform), url: link.url })),
      } as ContentItem;
    });
}

export function normalizeMediaEvents(items: HomePageData['mediaEvents']): MediaEvent[] {
  return (items ?? [])
    .filter((item) => typeof item.id === 'string' && typeof item.title === 'string')
    .map((item) => ({
      id: item.id,
      title: item.title,
      hashtags: Array.isArray(item.hashtags) ? item.hashtags.filter((tag): tag is string => typeof tag === 'string') : [],
      is_active: Boolean(item.is_active),
      media_posts: Array.isArray(item.media_posts)
        ? item.media_posts
            .filter((post): post is Record<string, unknown> => !!post && typeof post === 'object')
            .map((post) => ({
              id: typeof post.id === 'string' ? post.id : crypto.randomUUID(),
              event_id: typeof post.event_id === 'string' ? post.event_id : null,
              platform: typeof post.platform === 'string' ? post.platform : 'other',
              title: typeof post.title === 'string' ? post.title : null,
              caption: typeof post.caption === 'string' ? post.caption : null,
              post_url: typeof post.post_url === 'string' ? post.post_url : '',
              thumbnail: typeof post.thumbnail === 'string' ? post.thumbnail : null,
              artist: typeof post.artist === 'string' ? post.artist : 'both',
              post_date: typeof post.post_date === 'string' ? post.post_date : '',
              views: typeof post.views === 'number' ? post.views : 0,
              likes: typeof post.likes === 'number' ? post.likes : 0,
              comments: typeof post.comments === 'number' ? post.comments : 0,
              shares: typeof post.shares === 'number' ? post.shares : 0,
              saves: typeof post.saves === 'number' ? post.saves : 0,
              goal_views: typeof post.goal_views === 'number' ? post.goal_views : 0,
              goal_likes: typeof post.goal_likes === 'number' ? post.goal_likes : 0,
              goal_comments: typeof post.goal_comments === 'number' ? post.goal_comments : 0,
              goal_shares: typeof post.goal_shares === 'number' ? post.goal_shares : 0,
              goal_saves: typeof post.goal_saves === 'number' ? post.goal_saves : 0,
              hashtags: Array.isArray(post.hashtags) ? post.hashtags.filter((tag): tag is string => typeof tag === 'string') : [],
              is_focus: Boolean(post.is_focus),
              is_visible: post.is_visible !== false,
            }))
        : [],
    }));
}
