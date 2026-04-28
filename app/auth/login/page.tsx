import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

const LOCALES = ['th', 'en', 'zh'];
const DEFAULT_LOCALE = 'th';

function getLocale(acceptLanguage: string | null): string {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  for (const part of acceptLanguage.split(',')) {
    const lang = part.split(';')[0].trim().toLowerCase();
    if (LOCALES.includes(lang)) return lang;
    const base = lang.split('-')[0];
    if (LOCALES.includes(base)) return base;
  }
  return DEFAULT_LOCALE;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const locale = getLocale((await headers()).get('accept-language'));
  const params = await searchParams;
  const query = new URLSearchParams(params).toString();
  redirect(`/${locale}/auth/login${query ? `?${query}` : ''}`);
}
