#!/usr/bin/env node

import { performance } from 'node:perf_hooks';

function parseArg(name, fallback) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1 || idx === process.argv.length - 1) return fallback;
  return process.argv[idx + 1];
}

function parsePositional(index, fallback) {
  const value = process.argv[2 + index];
  if (!value || value.startsWith('--')) return fallback;
  return value;
}

function toAbsoluteUrl(urlOrPath, baseOrigin) {
  if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) return urlOrPath;
  const path = urlOrPath.startsWith('/') ? urlOrPath : `/${urlOrPath}`;
  return `${baseOrigin}${path}`;
}

function extractAssetUrls(html, baseOrigin) {
  const assets = new Set();
  const attrRegex = /<(script|link)\b[^>]*?\b(?:src|href)=["']([^"']+)["'][^>]*>/gi;
  let match;

  while ((match = attrRegex.exec(html)) !== null) {
    const tag = match[1]?.toLowerCase();
    const raw = match[2];
    if (!raw || raw.startsWith('data:')) continue;
    if (tag === 'link' && !/rel=["'](?:stylesheet|preload|modulepreload)["']/i.test(match[0])) continue;

    const absolute = toAbsoluteUrl(raw, baseOrigin);
    try {
      const u = new URL(absolute);
      if (u.origin === baseOrigin) assets.add(`${u.pathname}${u.search}`);
    } catch {
      // ignore malformed URL
    }
  }

  return [...assets];
}

async function measureOnce(url) {
  const start = performance.now();
  const response = await fetch(url, {
    headers: { 'cache-control': 'no-cache' },
  });

  const reader = response.body?.getReader();
  let firstChunkAt = performance.now();
  let bytes = 0;

  if (reader) {
    const first = await reader.read();
    firstChunkAt = performance.now();
    if (!first.done && first.value) bytes += first.value.byteLength;

    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      if (chunk.value) bytes += chunk.value.byteLength;
    }
  } else {
    const text = await response.text();
    bytes = Buffer.byteLength(text);
  }

  const end = performance.now();
  return {
    status: response.status,
    ttfbMs: firstChunkAt - start,
    totalMs: end - start,
    bytes,
  };
}

async function main() {
  const target = parseArg('url', parsePositional(0, process.env.PERF_URL || 'http://localhost:3000/th'));
  const warmup = Number.parseInt(parseArg('warmup', parsePositional(1, '1')), 10);
  const runs = Number.parseInt(parseArg('runs', parsePositional(2, '5')), 10);

  if (!Number.isFinite(runs) || runs < 1) {
    throw new Error('--runs must be a positive integer');
  }

  const targetUrl = new URL(target);
  const baseOrigin = targetUrl.origin;

  console.log(`Measuring ${target} (warmup=${warmup}, runs=${runs})`);

  for (let i = 0; i < warmup; i += 1) {
    await measureOnce(target);
  }

  const results = [];
  for (let i = 0; i < runs; i += 1) {
    const result = await measureOnce(target);
    results.push(result);
    console.log(`Run ${i + 1}: status=${result.status} ttfb=${result.ttfbMs.toFixed(1)}ms total=${result.totalMs.toFixed(1)}ms bytes=${result.bytes}`);
  }

  const html = await fetch(target).then((r) => r.text());
  const assets = extractAssetUrls(html, baseOrigin);

  const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const ttfb = results.map((r) => r.ttfbMs);
  const total = results.map((r) => r.totalMs);
  const bytes = results.map((r) => r.bytes);

  console.log('\nSummary');
  console.log(`- Avg TTFB: ${avg(ttfb).toFixed(1)}ms`);
  console.log(`- Avg Total Load: ${avg(total).toFixed(1)}ms`);
  console.log(`- Avg HTML Bytes: ${Math.round(avg(bytes))}`);
  console.log(`- Estimated Asset Refs (same-origin): ${assets.length}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
