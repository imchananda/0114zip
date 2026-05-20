'use client';

/**
 * Phase 6 — cross-layer section (pattern from Timeline/MediaTags pilots):
 *   • Visual: getContentStyles (content.styles.ts)
 *   • Motion: useSectionMotion + toWhileInViewBinding / toEnterMotionBinding
 *   • Theme: SectionThemeWrapper → CSS vars
 * ViewState AnimatePresence (state switch) is separate from admin section presets.
 */
import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useViewState } from '@/context/ViewStateContext';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { HomepageSectionConfig, PageMotionConfig, PageThemeConfig } from '@/lib/homepage-sections';
import { SectionThemeWrapper } from '@/components/ui/SectionThemeWrapper';
import { toEnterMotionBinding, toWhileInViewBinding, useSectionMotion } from '@/lib/visual';
import { ContentRow } from './ContentRow';
import { ViewState, ContentItem, Series, Variety, Event, DisplayItem } from '@/types';
import {
  getContentActorGradient,
  getContentStyles,
  resolveContentLimit,
} from './content.styles';

interface SectionInfo {
  titleKey: string;
  subKey: string;
}

const sectionInfo: Record<ViewState, SectionInfo> = {
  both: {
    titleKey: 'content.togetherTitle',
    subKey: 'content.togetherSub',
  },
  namtan: {
    titleKey: 'content.namtanJourney',
    subKey: 'content.filmography',
  },
  film: {
    titleKey: 'content.filmJourney',
    subKey: 'content.filmography',
  },
  lunar: {
    titleKey: 'content.lunarSpace',
    subKey: 'content.memories',
  },
};

const contentCategories = [
  { id: 'series' as const, titleKey: 'content.categories.series', titleThaiKey: 'content.categoriesThai.series', icon: '▶' },
  { id: 'variety' as const, titleKey: 'content.categories.variety', titleThaiKey: 'content.categoriesThai.variety', icon: '★' },
  { id: 'event' as const, titleKey: 'content.categories.event', titleThaiKey: 'content.categoriesThai.event', icon: '◈' },
];

interface ContentSectionClientProps {
  initialContent: ContentItem[];
  config?: Pick<HomepageSectionConfig, 'limit' | 'motion' | 'themeTokens'>;
  pageMotion?: PageMotionConfig;
  pageTheme?: PageThemeConfig;
}

function contentToDisplayItem(item: ContentItem): DisplayItem {
  const baseItem = item as Series | Variety | Event;
  return {
    id: baseItem.id,
    title: baseItem.title,
    titleThai: baseItem.titleThai,
    year: baseItem.year,
    image: baseItem.image,
    actors: baseItem.actors,
    contentType: baseItem.contentType,
    description: 'description' in baseItem ? baseItem.description : undefined,
    role: 'role' in baseItem ? (baseItem as Series).role : undefined,
    links: 'links' in baseItem ? (baseItem as Series).links : undefined,
    link: 'link' in baseItem ? (baseItem as Variety | Event).link : undefined,
  };
}

export function ContentSectionClient({
  initialContent,
  config,
  pageMotion,
  pageTheme,
}: ContentSectionClientProps) {
  const { state, transitionTo } = useViewState();
  const t = useTranslations();
  const styles = getContentStyles();
  const sectionMotion = useSectionMotion(pageMotion, config?.motion);
  const headerMotion = toWhileInViewBinding(sectionMotion);
  const statePanelMotion = toEnterMotionBinding(sectionMotion);
  const returnMotion = toWhileInViewBinding(sectionMotion, 2);

  const filteredContent = useMemo(() => {
    return initialContent.filter(item => {
      if (state === 'both' || state === 'lunar') return true;
      return item.actors.includes(state as 'namtan' | 'film');
    });
  }, [state, initialContent]);

  const contentByCategory = useMemo(() => {
    const limit = resolveContentLimit(config?.limit);
    return contentCategories
      .map(cat => {
        const works = filteredContent
          .filter(item => item.contentType === cat.id)
          .map(contentToDisplayItem);

        return {
          ...cat,
          works: works.slice(0, limit),
          hasMore: works.length > limit,
        };
      })
      .filter(cat => cat.works.length > 0);
  }, [filteredContent, config?.limit]);

  const info = sectionInfo[state];

  return (
    <SectionThemeWrapper
      as="section"
      id="works"
      className={styles.sectionClass}
      pageTheme={pageTheme}
      sectionTheme={config?.themeTokens}
    >
      <motion.div
        initial={headerMotion.initial}
        whileInView={headerMotion.whileInView}
        viewport={headerMotion.viewport}
        transition={headerMotion.transition}
        className={styles.headerContainerClass}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            initial={statePanelMotion.initial}
            animate={statePanelMotion.animate}
            exit={statePanelMotion.exit}
            transition={statePanelMotion.transition}
            className={styles.headerRowClass}
          >
            <div className={styles.headerInnerClass}>
              <div
                className={styles.accentBarClass}
                style={{ background: getContentActorGradient(state) }}
              />
              <div>
                <p className={styles.sublineClass}>{t(info.subKey)}</p>
                <h2 className={styles.titleClass}>{t(info.titleKey)}</h2>
              </div>
            </div>

            <Link href="/works" className={styles.exploreLinkClass}>
              {t('content.viewFullArchive')}{' '}
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <div className={styles.rowsWrapperClass}>
        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            initial={statePanelMotion.initial}
            animate={statePanelMotion.animate}
            exit={statePanelMotion.exit}
            transition={statePanelMotion.transition}
          >
            {contentByCategory.map((cat, index) => (
              <ContentRow
                key={`${state}-${cat.id}`}
                title={t(cat.titleKey)}
                titleThai={t(cat.titleThaiKey)}
                icon={cat.icon}
                works={cat.works}
                hasMore={cat.hasMore}
                rowMotion={toWhileInViewBinding(sectionMotion, index)}
                cardMotion={(cardIndex) => toWhileInViewBinding(sectionMotion, index * 4 + cardIndex)}
                moreCardMotion={toWhileInViewBinding(sectionMotion, index * 4 + cat.works.length)}
              />
            ))}

            {contentByCategory.length === 0 && (
              <div className={styles.emptyStateClass}>
                <div className={styles.emptyStateIconClass}>🎬</div>
                <h3 className={styles.emptyStateTitleClass}>{t('content.noWorks')}</h3>
                <p className={styles.emptyStateBodyClass}>{t('content.tryOther')}</p>
                <Link href="/works" className={styles.emptyActionClass}>
                  {t('content.viewAllWorks')}
                </Link>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {state !== 'both' && (
          <motion.div
            initial={returnMotion.initial}
            whileInView={returnMotion.whileInView}
            viewport={returnMotion.viewport}
            transition={returnMotion.transition}
            className={styles.returnWrapperClass}
          >
            <button
              type="button"
              onClick={() => transitionTo('both')}
              className={styles.returnButtonClass}
            >
              <span className="group-hover:-translate-x-1 transition-transform duration-500">←</span>
              <span>{t('content.backToTogether')}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </SectionThemeWrapper>
  );
}
