import { test, expect } from '@playwright/test';
import {
  assertRuntimeMode,
  captureStep,
  goToHeroAdmin,
  loginAsAdmin,
  readAdminCredentials,
  saveHeroBanner,
  setMode,
} from './hero-qa-helpers';

const creds = readAdminCredentials();

test.describe('hero mode matrix', () => {
  test.skip(!creds, 'Missing HERO_QA_ADMIN_EMAIL/HERO_QA_ADMIN_PASSWORD');

  for (const locale of ['th', 'en'] as const) {
    test(`[mode][${locale}] cinematic parity`, async ({ page }, testInfo) => {
      await loginAsAdmin(page, locale);
      await goToHeroAdmin(page);
      await setMode(page, 'cinematic');
      await page.getByTestId('hero-source-url-input').fill('https://images.unsplash.com/photo-1517816428104-797678c7cf0c?auto=format&fit=crop&w=1400&q=80');
      await captureStep(page, testInfo, 'admin-preview-cinematic');
      await saveHeroBanner(page);
      await page.goto(`/${locale}`);
      await assertRuntimeMode(page, 'cinematic');
      await captureStep(page, testInfo, 'homepage-cinematic');
    });

    test(`[mode][${locale}] slide parity`, async ({ page }, testInfo) => {
      await loginAsAdmin(page, locale);
      await goToHeroAdmin(page);
      await setMode(page, 'slide');
      await page.getByTestId('hero-slide-autoplay-input').fill('5000');
      await captureStep(page, testInfo, 'admin-preview-slide');
      await saveHeroBanner(page);
      await page.goto(`/${locale}`);
      await assertRuntimeMode(page, 'slide');
      await captureStep(page, testInfo, 'homepage-slide');
    });

    test(`[mode][${locale}] video parity`, async ({ page }, testInfo) => {
      await loginAsAdmin(page, locale);
      await goToHeroAdmin(page);
      await setMode(page, 'video');
      await page.getByTestId('hero-video-url-input').fill('https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4');
      await page.getByTestId('hero-video-poster-url-input').fill('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80');
      await captureStep(page, testInfo, 'admin-preview-video');
      await saveHeroBanner(page);
      await page.goto(`/${locale}`);
      await assertRuntimeMode(page, 'video');
      await captureStep(page, testInfo, 'homepage-video');
    });

    test(`[mode][${locale}] image parity`, async ({ page }, testInfo) => {
      await loginAsAdmin(page, locale);
      await goToHeroAdmin(page);
      await setMode(page, 'image');
      await page.getByTestId('hero-source-url-input').fill('https://images.unsplash.com/photo-1493244040629-496f6d136cc3?auto=format&fit=crop&w=1400&q=80');
      await page.getByTestId('hero-image-click-url-input').fill('/en/works');
      await captureStep(page, testInfo, 'admin-preview-image');
      await saveHeroBanner(page);
      await page.goto(`/${locale}`);
      await assertRuntimeMode(page, 'image');
      await captureStep(page, testInfo, 'homepage-image');
    });
  }

  test('[source] cinematic url source persistence', async ({ page }, testInfo) => {
    await loginAsAdmin(page, 'th');
    await goToHeroAdmin(page);
    await setMode(page, 'cinematic');
    const source = 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1400&q=80';
    await page.getByTestId('hero-source-url-input').fill(source);
    await saveHeroBanner(page);
    await page.reload();
    await expect(page.getByTestId('hero-source-url-input')).toHaveValue(source);
    await captureStep(page, testInfo, 'admin-source-url-persisted');
  });
});

