'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useViewState } from '@/context/ViewStateContext';
import { useTranslations, useLocale } from 'next-intl';

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

export function TimelineSection({ initialEvents }: { initialEvents?: TimelineEvent[] }) {
    const { state, reducedMotion } = useViewState();
    const t = useTranslations();
    const language = useLocale();

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

    const years = Object.keys(eventsByYear).map(Number).sort((a, b) => b - a);

    const getActorColor = (actor: string) => {
        if (actor === 'both') return 'var(--nf-gradient)';
        if (actor === 'namtan') return 'var(--namtan-teal)';
        return 'var(--film-gold)';
    };

    const getCategoryStyle = (category: string) => {
        switch (category) {
            case 'debut': return { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-500/20' };
            case 'work': return { bg: 'bg-namtan-primary/10', text: 'text-namtan-primary', border: 'border-namtan-primary/20' };
            case 'award': return { bg: 'bg-film-primary/10', text: 'text-film-primary', border: 'border-film-primary/20' };
            case 'event': return { bg: 'bg-green-500/10', text: 'text-green-600', border: 'border-green-500/20' };
            case 'milestone': return { bg: 'bg-pink-500/10', text: 'text-pink-600', border: 'border-pink-500/20' };
            default: return { bg: 'bg-panel', text: 'text-muted', border: 'border-theme/40' };
        }
    };

    return (
        <section id="timeline" className="py-24 md:py-32 bg-[var(--color-bg)] transition-colors duration-500 relative">
            <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-6xl">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: reducedMotion ? 0 : 0.6 }}
                    className="text-center mb-16 md:mb-24"
                >
                    <p className="text-overline text-accent font-bold mb-4 uppercase tracking-[0.4em]">
                        {t('timeline.sub')}
                    </p>
                    <h2 className="text-section font-display text-primary leading-tight font-light">
                        {t('timeline.title')}
                    </h2>
                </motion.div>

                {/* Timeline */}
                <div className="relative max-w-5xl mx-auto">
                    {/* Central Line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-theme/60 to-transparent
            -translate-x-1/2 hidden md:block" />

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
                                    <span className="px-8 py-2 bg-surface backdrop-blur-md border border-theme/60
                      rounded-full text-primary text-2xl font-display font-light tracking-[0.2em] shadow-sm">
                                        {year}
                                    </span>
                                </motion.div>

                                {/* Events */}
                                <div className="space-y-12">
                                    {eventsByYear[year].map((event: TimelineEvent, index: number) => {
                                        const isLeft = index % 2 === 0;
                                        const style = getCategoryStyle(event.category);
                                        return (
                                            <motion.div
                                                key={event.id}
                                                initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: reducedMotion ? 0 : 0.8, ease: [0.22, 1, 0.36, 1], delay: index * 0.05 }}
                                                className={`flex items-center gap-8 md:gap-16
                            ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                                            >
                                                {/* Content Card */}
                                                <div className={`flex-1 ${isLeft ? 'md:text-right' : 'md:text-left'}`}>
                                                    <div className={`group relative inline-block p-8 md:p-10 rounded-3xl bg-surface
                              border border-theme/60 hover:border-accent/40 hover:shadow-2xl transition-all duration-500
                              max-w-lg overflow-hidden
                              ${isLeft ? 'md:ml-auto' : 'md:mr-auto'}`}
                                                    >
                                                        <div className="absolute top-0 left-0 w-1 h-full opacity-10 group-hover:opacity-100 transition-opacity" style={{ background: getActorColor(event.actor) }} />
                                                        
                                                        {/* Icon & Category */}
                                                        <div className={`flex items-center gap-4 mb-6
                                ${isLeft ? 'md:justify-end' : 'md:justify-start'}`}>
                                                            <span className="text-3xl grayscale-[0.4] group-hover:grayscale-0 transition-all duration-500">{event.icon}</span>
                                                            <span className={`text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full border shadow-sm
                                  ${style.bg} ${style.text} ${style.border}`}>
                                                                {t(`timeline.categories.${event.category}` as 'timeline.categories.debut')}
                                                            </span>
                                                        </div>

                                                        {/* Title */}
                                                        <h3 className="text-primary text-xl md:text-2xl font-display font-light mb-3 leading-snug group-hover:text-accent transition-colors">
                                                            {language === 'th' ? event.title_thai : event.title}
                                                        </h3>

                                                        {/* Description */}
                                                        <p className="text-muted text-sm md:text-base font-body leading-relaxed opacity-80">
                                                            {language === 'th' && event.description_thai ? event.description_thai : event.description}
                                                        </p>

                                                        {/* Actor Badge */}
                                                        <div className={`mt-8 flex items-center gap-2
                                ${isLeft ? 'md:justify-end' : 'md:justify-start'}`}>
                                                            <div
                                                                className="w-2 h-2 rounded-full shadow-sm"
                                                                style={{ background: getActorColor(event.actor) }}
                                                            />
                                                            <span className="text-muted text-xs font-bold uppercase tracking-[0.2em] opacity-60">
                                                                {event.actor === 'both' ? t('state.namtanfilm') : event.actor}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Center Dot (Desktop) */}
                                                <div
                                                    className="hidden md:flex w-6 h-6 rounded-full border-2 border-theme
                              items-center justify-center flex-shrink-0 z-10 shadow-sm transition-transform duration-500 hover:scale-125"
                                                    style={{ background: getActorColor(event.actor) }}
                                                >
                                                    <div className="w-2 h-2 rounded-full bg-[var(--color-bg)] shadow-inner" />
                                                </div>

                                                {/* Spacer */}
                                                <div className="hidden md:block flex-1" />
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
