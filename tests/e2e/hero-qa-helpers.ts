import { expect, type Page, type TestInfo } from '@playwright/test';

export interface HeroQaManualItem {
  id: string;
  reason: string;
}

export const manualRequiredItems: HeroQaManualItem[] = [];

export function registerManualRequired(id: string, reason: string): void {
  if (manualRequiredItems.some((item) => item.id === id)) return;
  manualRequiredItems.push({ id, reason });
}

export function readAdminCredentials() {
  const email = process.env.HERO_QA_ADMIN_EMAIL?.trim();
  const password = process.env.HERO_QA_ADMIN_PASSWORD?.trim();
  if (!email || !password) return null;
  return { email, password };
}

function safeName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9-_]+/g, '-');
}

export async function captureStep(page: Page, testInfo: TestInfo, step: string): Promise<void> {
  const filename = `${safeName(testInfo.project.name)}--${safeName(testInfo.title)}--${safeName(step)}.png`;
  const outputPath = testInfo.outputPath(filename);
  await page.screenshot({ path: outputPath, fullPage: true });
  await testInfo.attach(`screenshot:${step}`, {
    path: outputPath,
    contentType: 'image/png',
  });
}

export async function loginAsAdmin(page: Page, locale: 'th' | 'en' = 'th'): Promise<void> {
  const credentials = readAdminCredentials();
  if (!credentials) {
    throw new Error('Missing HERO_QA_ADMIN_EMAIL or HERO_QA_ADMIN_PASSWORD');
  }

  await page.goto(`/${locale}/auth/login`);
  await page.getByTestId('auth-email-input').fill(credentials.email);
  await page.getByTestId('auth-password-input').fill(credentials.password);
  await page.getByTestId('auth-submit-button').click();

  await page.waitForURL(/\/(th|en)(\/)?$/, { timeout: 30_000 });
}

export async function goToHeroAdmin(page: Page): Promise<void> {
  await page.goto('/admin/hero-slides');
  await expect(page.getByTestId('hero-admin-page')).toBeVisible();
  await page.getByTestId('hero-tab-banner').click();
  await expect(page.getByTestId('hero-save-button')).toBeVisible();
}

export async function setMode(page: Page, mode: 'cinematic' | 'slide' | 'video' | 'image'): Promise<void> {
  await page.getByTestId(`hero-mode-option-${mode}`).click();
  await expect(page.getByTestId('hero-preview-frame')).toHaveAttribute('data-mode', mode);
}

export async function saveHeroBanner(page: Page): Promise<void> {
  const saveButton = page.getByTestId('hero-save-button');
  await expect(saveButton).toBeEnabled();
  await saveButton.click();
  await expect(page.getByTestId('hero-admin-toast')).toBeVisible();
  await expect(page.getByTestId('hero-admin-toast')).toHaveAttribute('data-ok', 'true');
}

export async function assertRuntimeMode(page: Page, mode: 'cinematic' | 'slide' | 'video' | 'image'): Promise<void> {
  const runtimeRoot = page.getByTestId('hero-runtime-root').first();
  await expect(runtimeRoot).toBeVisible();
  await expect(runtimeRoot).toHaveAttribute('data-hero-mode', mode);
}

export async function updateHeroConfigViaApi(
  page: Page,
  payload: Record<string, unknown>,
): Promise<void> {
  const response = await page.request.put('/api/admin/settings', {
    data: {
      key: 'heroBanner',
      value: payload,
    },
  });
  expect(response.ok()).toBeTruthy();
}

