'use client';

import type { CSSProperties, ElementType, HTMLAttributes, ReactNode } from 'react';
import type { PageThemeConfig, SectionThemeConfig } from '@/lib/homepage-sections';
import { useSectionTheme } from '@/lib/visual/useSectionTheme';

type SectionThemeWrapperProps<T extends ElementType> = {
  as?: T;
  pageTheme?: PageThemeConfig;
  sectionTheme?: SectionThemeConfig;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
} & Omit<HTMLAttributes<HTMLElement>, 'style'>;

/**
 * Injects resolved admin theme tokens as CSS variables on a section wrapper.
 * Skips inline vars when config is fully inherited default (uses global :root).
 */
export function SectionThemeWrapper<T extends ElementType = 'div'>({
  as,
  pageTheme,
  sectionTheme,
  children,
  className,
  style,
  ...rest
}: SectionThemeWrapperProps<T>) {
  const Component = (as ?? 'div') as ElementType;
  const { style: themeStyle } = useSectionTheme(pageTheme, sectionTheme);

  return (
    <Component
      className={className}
      style={{ ...themeStyle, ...style }}
      {...rest}
    >
      {children}
    </Component>
  );
}
