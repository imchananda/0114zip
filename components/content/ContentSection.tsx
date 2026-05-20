import { ContentSectionClient } from './ContentSectionClient';
import type { HomepageSectionConfig, PageMotionConfig, PageThemeConfig } from '@/lib/homepage-sections';
import { ContentItem } from '@/types';

export function ContentSection({
  initialContent,
  config,
  pageMotion,
  pageTheme,
}: {
  initialContent?: ContentItem[];
  config?: Pick<HomepageSectionConfig, 'limit' | 'motion' | 'themeTokens'>;
  pageMotion?: PageMotionConfig;
  pageTheme?: PageThemeConfig;
}) {
  return (
    <ContentSectionClient
      initialContent={initialContent ?? []}
      config={config}
      pageMotion={pageMotion}
      pageTheme={pageTheme}
    />
  );
}
