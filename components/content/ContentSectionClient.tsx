'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useViewState } from '@/context/ViewStateContext';
import { useTranslations, useLocale } from 'next-intl';
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
        gradient: 'from-[#6cbfd0] to-[#fbdf74]',
    },
    namtan: {
        titleKey: 'content.namtanJourney',
        subKey: 'content.filmography',
        gradient: 'from-[#6cbfd0] to-[#8ed0dd]',
    },
    film: {
        titleKey: 'content.filmJourney',
        subKey: 'content.filmography',
        gradient: 'from-[#fbdf74] to-[#fce89a]',
    },
    lunar: {
        titleKey: 'content.lunarSpace',
        subKey: 'content.memories',
        gradient: 'from-[#6cbfd0] to-[#fbdf74]',
    },
};

// Category definitions for grouping content
const contentCategories = [
    { id: 'series' as const, title: 'Series & Drama', titleThai: 'ละคร/ซีรีส์', icon: '▶' },
    { id: 'variety' as const, title: 'Variety Shows', titleThai: 'รายการวาไรตี้', icon: '★' },
    { id: 'event' as const, title: 'Events', titleThai: 'กิจกรรม', icon: '◈' },
    { id: 'magazine' as const, title: 'Magazine', titleThai: 'นิตยสาร', icon: '◇' },
    { id: 'award' as const, title: 'Awards', titleThai: 'รางวัล', icon: '★' },
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

    // For series, variety, event, magazine - they have similar base structure
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
  const language = useLocale();

    const filteredContent = useMemo(() => {
        return initialContent.filter(item => {
            if (state === 'both') return item.actors.length === 2;
            if (state === 'lunar') return item.contentType === 'event';
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
            className="min-h-screen pt-12 pb-24 transition-colors duration-300"
            style={{ background: 'linear-gradient(to bottom, var(--color-bg), var(--color-panel), var(--color-bg))' }}
        >
            {/* Section Header */}
            <div className="px-6 md:px-12 lg:px-20 mb-12">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={state}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: reducedMotion ? 0 : 0.4 }}
                    >
                        <div className="flex items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div
                                    className={`w-1.5 h-20 rounded-full bg-gradient-to-b ${info.gradient}`}
                                />
                                <div>
                                    <p className="text-[var(--color-text-muted)] text-sm tracking-[0.3em] uppercase mb-2 font-light">
                                        {t(info.subKey)}
                                    </p>
                                    <h2 className={`text-[var(--color-text-primary)] text-4xl md:text-5xl font-light tracking-wide ${language === 'th' ? 'font-thai' : ''}`}>
                                        {t(info.titleKey)}
                                    </h2>
                                </div>
                            </div>
                            
                            <a href="/works" className="hidden md:flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-medium text-[var(--color-text-primary)] transition-all hover:scale-105 active:scale-95">
                                {language === 'th' ? 'ดูผลงานทั้งหมด' : 'View All Works'} →
                            </a>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Content Rows */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={state}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reducedMotion ? 0 : 0.3 }}
                >
                    {contentByCategory.map((cat, index) => (
                        <ContentRow
                            key={`${state}-${cat.id}`}
                            title={cat.title}
                            titleThai={cat.titleThai}
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
                            className="flex flex-col items-center justify-center py-20 text-center"
                        >
                            <div className="text-6xl mb-4">▶</div>
                            <h3 className="text-xl font-light text-[var(--color-text-secondary)] font-thai">ไม่พบผลงาน</h3>
                            <p className="text-[var(--color-text-muted)] mt-2 font-thai">ลองเลือกดูแบบอื่น</p>
                        </motion.div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Return Button */}
            <AnimatePresence>
                {state !== 'both' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="flex justify-center pt-12"
                    >
                        <button
                            onClick={() => transitionTo('both')}
                            className="group flex items-center gap-3 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] text-sm tracking-wider
                         transition-all duration-300 border border-[var(--color-border)] hover:border-namtan-primary/40
                         px-8 py-4 rounded-full font-thai"
                        style={{ background: 'transparent' }}
                        >
                            <span className="group-hover:-translate-x-1 transition-transform">←</span>
                            <span>กลับไปหน้าผลงานคู่</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
