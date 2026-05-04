'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useViewState } from '@/context/ViewStateContext';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ContentRow } from './ContentRow';
import { ViewState, ContentItem, Series, Variety, Event, Magazine, Award, DisplayItem } from '@/types';

interface SectionInfo {
    titleKey: string;
    subKey: string;
    gradient: string;
}

const sectionInfo: Record<ViewState, SectionInfo> = {
    both: {
        titleKey: 'content.togetherTitle',
        subKey: 'content.togetherSub',
        gradient: 'from-namtan-primary to-film-primary',
    },
    namtan: {
        titleKey: 'content.namtanJourney',
        subKey: 'content.filmography',
        gradient: 'from-namtan-primary to-namtan-primary/40',
    },
    film: {
        titleKey: 'content.filmJourney',
        subKey: 'content.filmography',
        gradient: 'from-film-primary to-film-primary/40',
    },
    lunar: {
        titleKey: 'content.lunarSpace',
        subKey: 'content.memories',
        gradient: 'from-namtan-primary to-film-primary',
    },
};

// Category definitions for grouping content
const contentCategories = [
    { id: 'series' as const, titleKey: 'content.categories.series', titleThaiKey: 'content.categoriesThai.series', icon: '▶' },
    { id: 'variety' as const, titleKey: 'content.categories.variety', titleThaiKey: 'content.categoriesThai.variety', icon: '★' },
    { id: 'event' as const, titleKey: 'content.categories.event', titleThaiKey: 'content.categoriesThai.event', icon: '◈' },
    { id: 'magazine' as const, titleKey: 'content.categories.magazine', titleThaiKey: 'content.categoriesThai.magazine', icon: '◇' },
    { id: 'award' as const, titleKey: 'content.categories.award', titleThaiKey: 'content.categoriesThai.award', icon: '★' },
];

interface ContentSectionClientProps {
    initialContent: ContentItem[];
}

// Helper to convert ContentItem to DisplayItem format for ContentRow
function contentToDisplayItem(item: ContentItem): DisplayItem {
    if (item.contentType === 'award') {
        const award = item as Award;
        return {
            id: award.id,
            title: award.awardName,
            titleThai: award.awardNameThai,
            year: award.year,
            image: award.image,
            actors: award.actors,
            contentType: 'award',
            link: award.link,
            description: award.description,
        };
    }

    const baseItem = item as Series | Variety | Event | Magazine;
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
        link: 'link' in baseItem ? (baseItem as Variety | Event | Magazine).link : undefined,
    };
}

export function ContentSectionClient({ initialContent }: ContentSectionClientProps) {
    const { state, transitionTo, reducedMotion } = useViewState();
    const t = useTranslations();

    const filteredContent = useMemo(() => {
        return initialContent.filter(item => {
            if (state === 'both' || state === 'lunar') return true;
            return item.actors.includes(state as 'namtan' | 'film');
        });
    }, [state, initialContent]);

    const contentByCategory = useMemo(() => {
        return contentCategories
            .map(cat => ({
                ...cat,
                works: filteredContent
                    .filter(item => item.contentType === cat.id)
                    .map(contentToDisplayItem),
            }))
            .filter(cat => cat.works.length > 0);
    }, [filteredContent]);

    const info = sectionInfo[state];

    return (
        <section
            id="works"
            className="py-24 md:py-32 bg-[var(--color-bg)] transition-colors duration-500 relative"
        >
            {/* Section Header */}
            <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-7xl mb-16 md:mb-24">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={state}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: reducedMotion ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="flex flex-col md:flex-row items-baseline justify-between gap-8 border-b border-theme/40 pb-8">
                            <div className="flex items-center gap-8">
                                <div
                                    className={`w-1.5 h-20 rounded-full bg-gradient-to-b ${info.gradient} shadow-sm shadow-accent/10`}
                                />
                                <div>
                                    <p className="text-overline text-accent font-bold mb-4 uppercase tracking-[0.4em]">
                                        {t(info.subKey)}
                                    </p>
                                    <h2 className="text-section font-display text-primary leading-tight font-light">
                                        {t(info.titleKey)}
                                    </h2>
                                </div>
                            </div>
                            
                            <Link href="/works" className="text-[10px] tracking-[0.25em] font-bold uppercase text-muted hover:text-accent transition-colors flex items-center gap-2 group">
                                {t('content.viewFullArchive')} <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </Link>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Content Rows */}
            <div className="space-y-12">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={state}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: reducedMotion ? 0 : 0.4 }}
                    >
                        {contentByCategory.map((cat, index) => (
                            <ContentRow
                                key={`${state}-${cat.id}`}
                                title={t(cat.titleKey)}
                                titleThai={t(cat.titleThaiKey)}
                                icon={cat.icon}
                                works={cat.works}
                                index={index}
                            />
                        ))}

                        {/* Empty State */}
                        {contentByCategory.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-32 text-center opacity-40"
                            >
                                <div className="text-6xl mb-6 grayscale">🎬</div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-muted">{t('content.noWorks')}</h3>
                                <p className="text-xs mt-3 opacity-60">{t('content.tryOther')}</p>
                                <Link href="/works" className="inline-flex mt-5 text-xs tracking-[0.2em] font-bold uppercase text-muted hover:text-accent transition-colors">
                                  {t('content.viewAllWorks')}
                                </Link>
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Return Button */}
            <AnimatePresence>
                {state !== 'both' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="flex justify-center pt-24"
                    >
                        <button
                            onClick={() => transitionTo('both')}
                            className="group flex items-center gap-3 text-muted hover:text-primary text-[10px] font-bold uppercase tracking-[0.3em]
                         transition-all duration-500 border border-theme/60 hover:border-accent/40
                         px-10 py-5 rounded-full shadow-sm hover:shadow-lg"
                        >
                            <span className="group-hover:-translate-x-1 transition-transform duration-500">←</span>
                            <span>{t('content.backToTogether')}</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
