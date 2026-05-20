'use client';

/**
 * Phase 4B pilot — cross-layer section:
 * Admin config → normalize (homepage-sections) → props
 *   • Visual/layout: getTimelineStyles (4A)
 *   • Motion: useSectionMotion + toWhileInViewBinding (Phase 2)
 *   • Theme tokens: SectionThemeWrapper → CSS vars (Phase 3)
 */
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useViewState } from '@/context/ViewStateContext';
import { useTranslations, useLocale } from 'next-intl';
import type { HomepageSectionConfig, PageMotionConfig, PageThemeConfig } from '@/lib/homepage-sections';
import { SectionThemeWrapper } from '@/components/ui/SectionThemeWrapper';
import { toWhileInViewBinding, useSectionMotion } from '@/lib/visual';
import {
    getTimelineActorColor,
    getTimelineCategoryStyle,
    getTimelineStyles,
    resolveTimelineTitle,
} from './timeline.styles';

type TimelineEvent = {
    id: string;
    year: number;
    category: string;
    actor: string;
    icon?: string;
    title?: string;
    title_thai?: string;
    description?: string;
    description_thai?: string;
};

export function TimelineSection({
    initialEvents,
    config,
    pageMotion,
    pageTheme,
}: {
    initialEvents?: TimelineEvent[];
    config?: Pick<HomepageSectionConfig, 'limit' | 'layout' | 'theme' | 'title' | 'motion' | 'themeTokens'>;
    pageMotion?: PageMotionConfig;
    pageTheme?: PageThemeConfig;
}) {
    const { state } = useViewState();
    const t = useTranslations();
    const language = useLocale();
    const styles = getTimelineStyles({ layout: config?.layout, theme: config?.theme });
    const titleLines = resolveTimelineTitle(t('timeline.title'), config?.title);
    const sectionMotion = useSectionMotion(pageMotion, config?.motion);
    const headerMotion = toWhileInViewBinding(sectionMotion);

    const eventsByYear = useMemo(() => {
        const items = initialEvents ?? [];
        const filtered = items.filter(e => {
            if (state === 'both' || state === 'lunar') return true;
            return e.actor === state || e.actor === 'both';
        });

        return filtered.reduce((acc, ev) => {
            const year = ev.year;
            if (!acc[year]) acc[year] = [];
            acc[year].push(ev);
            return acc;
        }, {} as Record<number, TimelineEvent[]>);
    }, [state, initialEvents]);

    const allYears = Object.keys(eventsByYear).map(Number).sort((a, b) => b - a);
    const years = config?.limit ? allYears.slice(0, config.limit) : allYears;

    return (
        <SectionThemeWrapper
            as="section"
            id="timeline"
            className={styles.sectionClass}
            pageTheme={pageTheme}
            sectionTheme={config?.themeTokens}
        >
            <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-6xl">
                <motion.div
                    initial={headerMotion.initial}
                    whileInView={headerMotion.whileInView}
                    viewport={headerMotion.viewport}
                    transition={headerMotion.transition}
                    className={styles.headerClass}
                >
                    <p className={styles.sublineClass}>
                        {t('timeline.sub')}
                    </p>
                    <h2 className={styles.titleClass}>
                        {titleLines.map((line, index) => (
                            <span key={`${line}-${index}`}>
                                {line}
                                {index < titleLines.length - 1 ? <br className="md:hidden" /> : null}
                            </span>
                        ))}
                    </h2>
                </motion.div>

                <div className={styles.rootClass}>
                    <div className={styles.centerLineClass} />

                    {years.length === 0 ? (
                        <div className={styles.emptyStateClass}>
                            <p className={styles.emptyStateTextClass}>{t('timeline.empty')}</p>
                        </div>
                    ) : (
                        years.map((year) => {
                            const yearMotion = toWhileInViewBinding(sectionMotion);

                            return (
                            <div key={year} className="mb-20">
                                <motion.div
                                    initial={yearMotion.initial}
                                    whileInView={yearMotion.whileInView}
                                    viewport={yearMotion.viewport}
                                    transition={yearMotion.transition}
                                    className="flex justify-center mb-12"
                                >
                                    <span className={styles.yearPillClass}>
                                        {year}
                                    </span>
                                </motion.div>

                                <div className="space-y-12">
                                    {eventsByYear[year].map((event: TimelineEvent, index: number) => {
                                        const isLeft = index % 2 === 0;
                                        const style = getTimelineCategoryStyle(event.category);
                                        const eventMotion = toWhileInViewBinding(sectionMotion, index);
                                        return (
                                            <motion.div
                                                key={event.id}
                                                initial={eventMotion.initial}
                                                whileInView={eventMotion.whileInView}
                                                viewport={eventMotion.viewport}
                                                transition={eventMotion.transition}
                                                className={styles.rowClass(isLeft)}
                                            >
                                                <div className={styles.textAlignClass(isLeft)}>
                                                    <div className={styles.cardClass(isLeft)}>
                                                        <div className="absolute top-0 left-0 w-1 h-full opacity-10 group-hover:opacity-100 transition-opacity" style={{ background: getTimelineActorColor(event.actor) }} />

                                                        <div className={styles.iconRowClass(isLeft)}>
                                                            <span className="text-3xl grayscale-[0.4] group-hover:grayscale-0 transition-all duration-500">{event.icon}</span>
                                                            <span className={`text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full border shadow-sm
                                  ${style.bg} ${style.text} ${style.border}`}>
                                                                {t(`timeline.categories.${event.category}` as 'timeline.categories.debut')}
                                                            </span>
                                                        </div>

                                                        <h3 className={styles.eventTitleClass}>
                                                            {language === 'th' ? event.title_thai : event.title}
                                                        </h3>

                                                        <p className="text-muted text-sm md:text-base font-body leading-relaxed opacity-80">
                                                            {language === 'th' && event.description_thai ? event.description_thai : event.description}
                                                        </p>

                                                        <div className={styles.actorBadgeClass(isLeft)}>
                                                            <div
                                                                className="w-2 h-2 rounded-full shadow-sm"
                                                                style={{ background: getTimelineActorColor(event.actor) }}
                                                            />
                                                            <span className="text-muted text-xs font-bold uppercase tracking-[0.2em] opacity-60">
                                                                {event.actor === 'both' ? t('state.namtanfilm') : event.actor}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div
                                                    className={styles.centerDotClass}
                                                    style={{ background: getTimelineActorColor(event.actor) }}
                                                >
                                                    <div className="w-2 h-2 rounded-full bg-[var(--color-bg)] shadow-inner" />
                                                </div>

                                                <div className={styles.spacerClass} />
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                            );
                        })
                    )}
                </div>
            </div>
        </SectionThemeWrapper>
    );
}
