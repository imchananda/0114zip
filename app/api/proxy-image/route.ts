import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_HOSTS = [
  'upload.wikimedia.org',
  'commons.wikimedia.org',
  'encrypted-tbn0.gstatic.com',
  'i.ibb.co',
  'i.postimg.cc',
  'images.unsplash.com',
];

function isAllowedHost(hostname: string): boolean {
  if (ALLOWED_HOSTS.includes(hostname)) return true;
  return hostname === 'fbcdn.net' || hostname.endsWith('.fbcdn.net');
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'missing url' }, { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: 'invalid url' }, { status: 400 });
  }

  if (!isAllowedHost(parsed.hostname)) {
    return NextResponse.json({ error: 'host not allowed' }, { status: 403 });
  }

  const referer = parsed.hostname.includes('wikimedia')
    ? 'https://en.wikipedia.org/'
    : parsed.hostname.includes('fbcdn')
      ? 'https://www.facebook.com/'
      : '';

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NamtanFilmFansite/1.0)',
        Referer: referer,
        Accept: 'image/*,*/*',
      },
      next: { revalidate: 86400 }, // cache 24h
    });

    if (!res.ok) return NextResponse.json({ error: 'upstream error' }, { status: 502 });

    const contentType = res.headers.get('content-type') ?? 'image/png';
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
      },
    });
  } catch {
    return NextResponse.json({ error: 'fetch failed' }, { status: 502 });
  }
}
