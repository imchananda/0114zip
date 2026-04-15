import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

const supportedLocales = ['th', 'en', 'zh'];
const defaultLocale = 'th';

function getPreferredLocale(acceptLanguage: string | null) {
  if (!acceptLanguage) return defaultLocale;

  const localeCandidates = acceptLanguage
    .split(',')
    .map((part) => part.split(';')[0].trim().toLowerCase());

  for (const candidate of localeCandidates) {
    if (supportedLocales.includes(candidate)) {
      return candidate;
    }

    const baseLocale = candidate.split('-')[0];
    if (supportedLocales.includes(baseLocale)) {
      return baseLocale;
    }
  }

  return defaultLocale;
}

export default async function RootPage() {
  const acceptLanguage = (await headers()).get('accept-language');
  const locale = getPreferredLocale(acceptLanguage);

  redirect(`/${locale}`);
}
