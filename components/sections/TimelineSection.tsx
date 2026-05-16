'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useViewState } from '@/context/ViewStateContext';
import { useTranslations, useLocale } from 'next-intl';
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
}: {
    initialEvents?: TimelineEvent[];
    config?: { limit?: number; layout?: string; theme?: string; title?: string };
}) {
    const { state, reducedMotion } = useViewState();
    const t = useTranslations();
    const language = useLocale();
    const styles = getTimelineStyles({ layout: config?.layout, theme: config?.theme });
    const titleLines = resolveTimelineTitle(t('timeline.title'), config?.title);

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
        <section id="timeline" className={styles.sectionClass}>
            <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-6xl">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: reducedMotion ? 0 : 0.6 }}
                    className={styles.headerClass}
                >
                    <p className="text-overline text-accent font-bold mb-4 uppercase tracking-[0.4em]">
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

                {/* Timeline */}
                <div className={styles.rootClass}>
                    {/* Central Line */}
                    <div className={styles.centerLineClass} />

                    {years.length === 0 ? (
                        <div className="text-center py-20 opacity-30">
                            <p className="text-sm font-bold uppercase tracking-widest">{t('timeline.empty')}</p>
                        </div>
                    ) : (
                        years.map((year) => (
                            <div key={year} className="mb-20">
                                {/* Year Label */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: reducedMotion ? 0 : 0.5 }}
                                    className="flex justify-center mb-12"
                                >
                                    <span className={styles.yearPillClass}>
                                        {year}
                                    </span>
                                </motion.div>

                                {/* Events */}
                                <div className="space-y-12">
                                    {eventsByYear[year].map((event: TimelineEvent, index: number) => {
                                        const isLeft = index % 2 === 0;
                                        const style = getTimelineCategoryStyle(event.category);
                                        return (
                                            <motion.div
                                                key={event.id}
                                                initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: reducedMotion ? 0 : 0.8, ease: [0.22, 1, 0.36, 1], delay: index * 0.05 }}
                                                className={styles.rowClass(isLeft)}
                                            >
                                                {/* Content Card */}
                                                <div className={styles.textAlignClass(isLeft)}>
                                                    <div className={styles.cardClass(isLeft)}>
                                                        <div className="absolute top-0 left-0 w-1 h-full opacity-10 group-hover:opacity-100 transition-opacity" style={{ background: getTimelineActorColor(event.actor) }} />
                                                        
                                                        {/* Icon & Category */}
                                                        <div className={styles.iconRowClass(isLeft)}>
                                                            <span className="text-3xl grayscale-[0.4] group-hover:grayscale-0 transition-all duration-500">{event.icon}</span>
                                                            <span className={`text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full border shadow-sm
                                  ${style.bg} ${style.text} ${style.border}`}>
                                                                {t(`timeline.categories.${event.category}` as 'timeline.categories.debut')}
                                                            </span>
                                                        </div>

                                                        {/* Title */}
                                                        <h3 className="text-primary text-xl md:text-2xl font-display font-normal mb-3 leading-snug group-hover:text-accent transition-colors">
                                                            {language === 'th' ? event.title_thai : event.title}
                                                        </h3>

                                                        {/* Description */}
                                                        <p className="text-muted text-sm md:text-base font-body leading-relaxed opacity-80">
                                                            {language === 'th' && event.description_thai ? event.description_thai : event.description}
                                                        </p>

                                                        {/* Actor Badge */}
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

                                                {/* Center Dot (Desktop) */}
                                                <div
                                                    className={styles.centerDotClass}
                                                    style={{ background: getTimelineActorColor(event.actor) }}
                                                >
                                                    <div className="w-2 h-2 rounded-full bg-[var(--color-bg)] shadow-inner" />
                                                </div>

                                                {/* Spacer */}
                                                <div className={styles.spacerClass} />
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
