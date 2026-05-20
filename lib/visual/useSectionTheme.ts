'use client';

import { useTheme } from 'next-themes';
import { useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_PAGE_THEME,
  resolveSectionThemeTokens,
  themeTokensToStyle,
  type ColorMode,
  type PageThemeConfig,
  type ResolvedThemeTokens,
  type SectionThemeConfig,
} from './theme';

/**
 * Hydration-safe color mode for theme token resolution.
 * First paint uses `dark` to match ThemeProvider defaultTheme + SSR.
 */
export function useThemeColorMode(): ColorMode {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- first client paint must match SSR
    setMounted(true);
  }, []);

  if (!mounted) return 'dark';
  return resolvedTheme === 'light' ? 'light' : 'dark';
}

/** True when admin config differs from bare globals.css inheritance */
export function shouldApplySectionTheme(
  pageTheme: PageThemeConfig | undefined,
  sectionTheme: SectionThemeConfig | undefined,
): boolean {
  const page = pageTheme ?? DEFAULT_PAGE_THEME;

  if (page.preset !== 'default') return true;
  if (page.tokens && Object.keys(page.tokens).length > 0) return true;

  if (!sectionTheme) return false;
  if (sectionTheme.preset && sectionTheme.preset !== 'inherit') return true;
  if (sectionTheme.tokens && Object.keys(sectionTheme.tokens).length > 0) return true;

  return false;
}

/** Phase 3C — resolve page + section tokens for the active color mode */
export function useSectionTheme(
  pageTheme: PageThemeConfig | undefined,
  sectionTheme: SectionThemeConfig | undefined,
): {
  tokens: ResolvedThemeTokens;
  style: Record<string, string>;
  applyTheme: boolean;
  colorMode: ColorMode;
} {
  const colorMode = useThemeColorMode();

  return useMemo(() => {
    const page = pageTheme ?? DEFAULT_PAGE_THEME;
    const tokens = resolveSectionThemeTokens(page, sectionTheme, { colorMode });
    const applyTheme = shouldApplySectionTheme(pageTheme, sectionTheme);

    return {
      tokens,
      style: applyTheme ? themeTokensToStyle(tokens) : {},
      applyTheme,
      colorMode,
    };
  }, [pageTheme, sectionTheme, colorMode]);
}
