const PROXY_HOSTS = new Set([
  'upload.wikimedia.org',
  'commons.wikimedia.org',
  'encrypted-tbn0.gstatic.com',
]);

function isFacebookCdnHost(hostname: string): boolean {
  return hostname === 'fbcdn.net' || hostname.endsWith('.fbcdn.net');
}

function shouldProxyHostname(hostname: string): boolean {
  return PROXY_HOSTS.has(hostname) || isFacebookCdnHost(hostname);
}

/** True when URL points at Facebook CDN (hotlink often returns 403). Prefer Supabase upload in admin. */
export function isFacebookCdnUrl(url: string): boolean {
  if (!url || url.startsWith('/') || url.startsWith('data:') || url.startsWith('blob:')) {
    return false;
  }
  try {
    return isFacebookCdnHost(new URL(url.replace(/^http:\/\//, 'https://')).hostname);
  } catch {
    return false;
  }
}

/** Normalize external image URLs for next/image (proxy blocked or CORS-sensitive hosts). */
export function resolveImageSrc(url: string): string {
  if (!url || url.startsWith('/') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  try {
    const normalized = url.replace(/^http:\/\//, 'https://');
    const parsed = new URL(normalized);
    if (shouldProxyHostname(parsed.hostname)) {
      return `/api/proxy-image?url=${encodeURIComponent(parsed.toString())}`;
    }
    return parsed.toString();
  } catch {
    return url;
  }
}
