import type { Metadata, Viewport } from 'next';
import { Inter, Noto_Sans_Thai } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { AnalyticsTracker } from '@/components/ui/AnalyticsTracker';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';

// ── Self-hosted fonts via next/font (zero layout shift) ──
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-noto-thai',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://namtanfilm.vercel.app'),
  title: {
    default: 'NamtanFilm | แฟนเพจคู่จิ้น น้ำตาล × ฟิล์ม',
    template: '%s | NamtanFilm',
  },
  description: 'เว็บไซต์แฟนเมดสำหรับคู่จิ้นขวัญใจ น้ำตาล ทิพนารี และ ฟิล์ม รัชชานนท์ — รวมผลงาน แกลเลอรี่ ไทม์ไลน์ สถิติ และกิจกรรมแฟนคลับ',
  keywords: ['น้ำตาล', 'ฟิล์ม', 'NamtanFilm', 'คู่จิ้น', 'Namtan Tipnaree', 'Film Rachanun', 'Lunar', 'แฟนคลับ', 'ซีรีส์วาย', 'BL'],
  authors: [{ name: 'NamtanFilm Fan Community' }],
  creator: 'NamtanFilm Fan Community',
  publisher: 'NamtanFilm Fan Community',
  manifest: '/manifest.json',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'NamtanFilm | คู่จิ้นขวัญใจ น้ำตาล × ฟิล์ม',
    description: 'เว็บไซต์แฟนเมดสำหรับคู่จิ้นขวัญใจ น้ำตาล × ฟิล์ม — รวมผลงาน แกลเลอรี่ ไทม์ไลน์ สถิติ และกิจกรรมแฟนคลับ',
    type: 'website',
    locale: 'th_TH',
    siteName: 'NamtanFilm',
    images: [
      {
        url: '/icons/icon-512x512.png',
        width: 512,
        height: 512,
        alt: 'NamtanFilm Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NamtanFilm | คู่จิ้นขวัญใจ',
    description: 'เว็บไซต์แฟนเมดสำหรับ น้ำตาล × ฟิล์ม',
    images: ['/icons/icon-512x512.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NamtanFilm',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: dark)',  color: '#0A0A0F' },
    { media: '(prefers-color-scheme: light)', color: '#F8F9FF' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning className={`${inter.variable} ${notoSansThai.variable}`}>
      <head>
        {/* PWA meta tags */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.svg" />
        <link rel="icon" type="image/svg+xml" sizes="32x32" href="/icons/favicon-32x32.svg" />
        <link rel="icon" type="image/svg+xml" sizes="16x16" href="/icons/favicon-16x16.svg" />
      </head>
      <body className="min-h-screen overflow-x-hidden transition-colors duration-300">
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <AnalyticsTracker />
              {children}
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
