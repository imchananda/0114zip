import { test, expect } from '@playwright/test';
import {
  assertRuntimeMode,
  captureStep,
  goToHeroAdmin,
  loginAsAdmin,
  readAdminCredentials,
  registerManualRequired,
  updateHeroConfigViaApi,
} from './hero-qa-helpers';

const creds = readAdminCredentials();

test.describe('hero fallback and sanity matrix', () => {
  test.skip(!creds, 'Missing HERO_QA_ADMIN_EMAIL/HERO_QA_ADMIN_PASSWORD');

  test('[fallback] cinematic missing imageUrl falls back safely', async ({ page }, testInfo) => {
    await loginAsAdmin(page, 'th');
    await updateHeroConfigViaApi(page, { type: 'cinematic', imageUrl: '', showScrollHint: true });
    await page.goto('/th');
    await assertRuntimeMode(page, 'cinematic');
    await captureStep(page, testInfo, 'fallback-cinematic-missing-image');
  });

  test('[fallback] image invalid imageUrl falls back safely', async ({ page }, testInfo) => {
    await loginAsAdmin(page, 'th');
    await updateHeroConfigViaApi(page, { type: 'image', imageUrl: 'not-a-url', clickUrl: '/th/works' });
    await page.goto('/th');
    await assertRuntimeMode(page, 'image');
    await captureStep(page, testInfo, 'fallback-image-invalid-url');
  });

  test('[fallback] video invalid url shows fallback marker', async ({ page }, testInfo) => {
    await loginAsAdmin(page, 'th');
    await updateHeroConfigViaApi(page, { type: 'video', videoUrl: 'not-a-url', posterUrl: '' });
    await page.goto('/th');
    await assertRuntimeMode(page, 'video');
    await expect(page.getByTestId('hero-runtime-video-fallback')).toBeVisible();
    await captureStep(page, testInfo, 'fallback-video-invalid-url');
  });

  test('[fallback] slide with disabled slides resolves non-breaking mode', async ({ page }, testInfo) => {
    await loginAsAdmin(page, 'th');
    await updateHeroConfigViaApi(page, { type: 'slide', autoplayMs: 5000, showIndicators: true });
    await page.goto('/th');
    const runtimeRoot = page.getByTestId('hero-runtime-root').first();
    await expect(runtimeRoot).toBeVisible();
    await expect(runtimeRoot).toHaveAttribute('data-hero-mode', /cinematic|slide/);
    await captureStep(page, testInfo, 'fallback-slide-empty-safe-output');
  });

  test('[sanity] preview locale and viewport toggle', async ({ page }, testInfo) => {
    await loginAsAdmin(page, 'en');
    await goToHeroAdmin(page);
    await page.getByTestId('hero-preview-viewport-mobile').click();
    await expect(page.getByTestId('hero-preview-frame')).toHaveAttribute('data-viewport', 'mobile');
    await captureStep(page, testInfo, 'preview-mobile-en');
    await page.getByTestId('hero-preview-viewport-desktop').click();
    await expect(page.getByTestId('hero-preview-frame')).toHaveAttribute('data-viewport', 'desktop');
    await captureStep(page, testInfo, 'preview-desktop-en');
  });

  test.afterAll(() => {
    registerManualRequired('source-library-seeded', 'Library source automation requires deterministic seeded asset in target env.');
    registerManualRequired('source-upload-fixture', 'Upload flow is environment-dependent (storage policy/credentials); keep as manual unless fixture path and bucket permissions are stable.');
  });
});

