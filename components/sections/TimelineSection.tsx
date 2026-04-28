'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useViewState } from '@/context/ViewStateContext';
import { useTranslations, useLocale } from 'next-intl';
import { timelineEvents as defaultEvents, TimelineEvent } from '@/data/timeline';

export function TimelineSection() {
    const { state, reducedMotion } = useViewState();
    const t = useTranslations();
    const language = useLocale();
    const [events, setEvents] = useState<TimelineEvent[]>(defaultEvents);

    useEffect(() => {
        const saved = localStorage.getItem('ntf_timeline_events');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setEvents(parsed);
                }
            } catch {}
        }
    }, []);

    // Filter events
    const filteredEvents = events.filter((event) => {
        if (state === 'both') return event.actor === 'both' || event.actor === 'namtan' || event.actor === 'film';
        if (state === 'lunar') return true;
        return event.actor === state || event.actor === 'both';
    });

    // Group events by year
    const eventsByYear = filteredEvents.reduce((acc, event) => {
        if (!acc[event.year]) acc[event.year] = [];
        acc[event.year].push(event);
        return acc;
    }, {} as Record<number, TimelineEvent[]>);

    const years = Object.keys(eventsByYear).map(Number).sort((a, b) => a - b);

    const getActorColor = (actor: string) => {
        if (actor === 'both') return 'linear-gradient(135deg, var(--namtan-teal), var(--film-gold))';
        if (actor === 'namtan') return 'var(--namtan-teal)';
        return 'var(--film-gold)';
    };

    const getCategoryStyle = (category: string) => {
        switch (category) {
            case 'debut': return { bg: 'bg-purple-500/20', text: 'text-purple-600' };
            case 'work': return { bg: 'bg-[#6cbfd0]/20', text: 'text-[#6cbfd0]' };
            case 'award': return { bg: 'bg-[#fbdf74]/20', text: 'text-[#fbdf74]' };
            case 'event': return { bg: 'bg-green-500/20', text: 'text-green-600' };
            case 'milestone': return { bg: 'bg-pink-500/20', text: 'text-pink-600' };
            default: return { bg: 'bg-[#87867f]/10', text: 'text-[#5e5d59]' };
        }
    };

    return (
        <section id="timeline" className="py-24 transition-colors duration-300">
            <div className="container mx-auto px-6 md:px-12 lg:px-20">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: reducedMotion ? 0 : 0.6 }}
                    className="text-center mb-16"
                >
                    <p className="text-[var(--color-text-muted)] text-sm tracking-[0.3em] uppercase mb-3 font-light">
                        {t('timeline.sub')}
                    </p>
                    <h2 className={`text-[var(--color-text-primary)] text-4xl md:text-5xl font-display tracking-wide ${language === 'th' ? 'font-thai' : ''}`}>
                        {t('timeline.title')}
                    </h2>
                </motion.div>

                {/* Timeline */}
                <div className="relative max-w-4xl mx-auto">
                    {/* Central Line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[var(--color-border)] to-transparent
            -translate-x-1/2 hidden md:block" />

                    {years.map((year, yearIndex) => (
                        <div key={year} className="mb-16">
                            {/* Year Label */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: reducedMotion ? 0 : 0.5 }}
                                className="flex justify-center mb-8"
                            >
                                <span className="px-6 py-2 backdrop-blur-sm border border-[var(--color-border)]
                  rounded-full text-[var(--color-text-primary)] text-xl font-light tracking-widest"
                                      style={{ background: 'var(--color-surface)' }}>
                                    {year}
                                </span>
                            </motion.div>

                            {/* Events */}
                            <div className="space-y-6">
                                {eventsByYear[year].map((event, index) => {
                                    const isLeft = index % 2 === 0;
                                    const style = getCategoryStyle(event.category);

                                    return (
                                        <motion.div
                                            key={event.id}
                                            initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: reducedMotion ? 0 : 0.5, delay: index * 0.1 }}
                                            className={`flex items-center gap-4 md:gap-8
                        ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                                        >
                                            {/* Content Card */}
                                            <div className={`flex-1 ${isLeft ? 'md:text-right' : 'md:text-left'}`}>
                                                <div className={`inline-block p-5 rounded-2xl backdrop-blur-sm
                          border hover:shadow-md border-[var(--color-border)] transition-all duration-300
                          group max-w-md
                          ${isLeft ? 'md:ml-auto' : 'md:mr-auto'}`}
                                                     style={{ background: 'var(--color-surface)' }}
                                                >
                                                    {/* Icon & Category */}
                                                    <div className={`flex items-center gap-3 mb-3
                            ${isLeft ? 'md:justify-end' : 'md:justify-start'}`}>
                                                        <span className="text-2xl">{event.icon}</span>
                                                        <span className={`text-[9px] tracking-wider uppercase px-2 py-1 rounded-full
                              ${style.bg} ${style.text}`}>
                                                            {event.category === 'debut' && 'เดบิวต์'}
                                                            {event.category === 'work' && 'ผลงาน'}
                                                            {event.category === 'award' && 'รางวัล'}
                                                            {event.category === 'event' && 'อีเวนต์'}
                                                            {event.category === 'milestone' && 'ก้าวสำคัญ'}
                                                        </span>
                                                    </div>

                                                    {/* Title */}
                                                    <h3 className="text-[var(--color-text-primary)] text-lg font-medium mb-1 font-thai tracking-wide">
                                                        {event.titleThai}
                                                    </h3>

                                                    {/* Description */}
                                                    <p className="text-[var(--color-text-secondary)] text-sm font-light font-thai">
                                                        {event.description}
                                                    </p>

                                                    {/* Actor Badge */}
                                                    <div className={`mt-4 flex items-center gap-2
                            ${isLeft ? 'md:justify-end' : 'md:justify-start'}`}>
                                                        <div
                                                            className="w-2 h-2 rounded-full"
                                                            style={{ background: getActorColor(event.actor) }}
                                                        />
                                                        <span className="text-[var(--color-text-muted)] text-[10px] uppercase tracking-wider">
                                                            {event.actor === 'both' && 'NamtanFilm'}
                                                            {event.actor === 'namtan' && 'Namtan'}
                                                            {event.actor === 'film' && 'Film'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Center Dot (Desktop) */}
                                            <div
                                                className="hidden md:flex w-4 h-4 rounded-full border-2 border-[var(--color-border)]
                          items-center justify-center flex-shrink-0"
                                                style={{ background: getActorColor(event.actor) }}
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-bg)]" />
                                            </div>

                                            {/* Spacer */}
                                            <div className="hidden md:block flex-1" />
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
