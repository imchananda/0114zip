import { MetadataRoute } from 'next';

const BASE_URL = 'https://namtanfilm.com';
const LOCALES = ['th', 'en'] as const;
const DEFAULT_LOCALE = 'th';

function localizedUrl(path: string, locale: string): string {
  const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`;
  return `${BASE_URL}${prefix}${path}`;
}

type ChangeFreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

interface RouteConfig {
  path: string;
  changeFrequency: ChangeFreq;
  priority: number;
}

const routes: RouteConfig[] = [
  { path: '/',             changeFrequency: 'daily',   priority: 1.0 },
  { path: '/schedule',     changeFrequency: 'daily',   priority: 0.9 },
  { path: '/works',        changeFrequency: 'weekly',  priority: 0.9 },
  { path: '/timeline',     changeFrequency: 'weekly',  priority: 0.8 },
  { path: '/awards',       changeFrequency: 'monthly', priority: 0.8 },
  { path: '/community',    changeFrequency: 'always',  priority: 0.8 },
  { path: '/stats',        changeFrequency: 'daily',   priority: 0.7 },
  { path: '/engage/media', changeFrequency: 'weekly',  priority: 0.6 },
  { path: '/engage/links', changeFrequency: 'monthly', priority: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const route of routes) {
    for (const locale of LOCALES) {
      entries.push({
        url: localizedUrl(route.path, locale),
        lastModified: now,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      });
    }
  }

  return entries;
}
