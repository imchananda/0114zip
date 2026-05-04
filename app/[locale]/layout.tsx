import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import { fetchFloatingArtistSelectorConfig } from '@/lib/floating-artist-config';
import { FloatingArtistSelectorProvider } from '@/components/navigation/FloatingArtistSelectorProvider';

/** Align with `/api/admin/settings` — pick up Floating Artist config changes without a full redeploy */
export const revalidate = 300;

function isValidLocale(locale: string): locale is (typeof routing.locales)[number] {
  return routing.locales.includes(locale as (typeof routing.locales)[number]);
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  if (!isValidLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const floatingArtistConfig = await fetchFloatingArtistSelectorConfig();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <FloatingArtistSelectorProvider config={floatingArtistConfig}>
        {children}
      </FloatingArtistSelectorProvider>
    </NextIntlClientProvider>
  );
}
