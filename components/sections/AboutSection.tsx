'use client';

import { motion } from 'framer-motion';
import { useViewState } from '@/context/ViewStateContext';
import { useTranslations } from 'next-intl';
import { actors } from '@/data/actors';

import { cn } from '@/lib/utils';

export function AboutSection({ 
    ntWorks = 0, 
    flWorks = 0, 
    totalAwards = 0,
    config
}: { 
    ntWorks?: number; 
    flWorks?: number; 
    totalAwards?: number;
    config?: { layout?: string; theme?: string };
} = {}) {
    const { reducedMotion } = useViewState();
    const t = useTranslations();

    const stats = [
        { labelKey: 'about.worksCount', value: (ntWorks + flWorks) || '20+', icon: '🎬' },
        { labelKey: 'about.awards', value: totalAwards || '15+', icon: '🏆' },
        { labelKey: 'about.fans', value: '1.2M+', icon: '💕' },
    ];

    const layout = config?.layout || 'all';
    const theme = config?.theme || 'default';

    const getThemeClasses = (type: 'card' | 'actorCard') => {
        if (theme === 'glass') {
            return 'bg-surface/30 backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-glass';
        }
        if (theme === 'minimal') {
            return 'bg-transparent border-none shadow-none';
        }
        // Default theme
        return 'bg-surface border border-theme/60 shadow-sm hover:shadow-2xl';
    };

    const showCoupleCard = layout === 'all' || layout === 'couple-only';
    const showActorCards = layout === 'all' || layout === 'individuals-only';

    return (
        <section id="about" className="py-24 md:py-32 bg-[var(--color-bg)] transition-colors duration-500 overflow-hidden relative">
            
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.03] pointer-events-none select-none font-display text-[25vw] whitespace-nowrap overflow-hidden translate-x-1/4 leading-none">
                LUNA
            </div>

            <div className="container mx-auto px-6 md:px-12 lg:px-20 relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: reducedMotion ? 0 : 0.6 }}
                    className="text-center mb-16 md:mb-24"
                >
                    <p className="text-overline text-accent font-bold mb-4 uppercase">
                        {t('about.sub')}
                    </p>
                    <h2 className="text-section font-display text-primary leading-tight">
                        {t('about.title')}
                    </h2>
                </motion.div>

                {/* Main Content */}
                <div className="max-w-5xl mx-auto">
                    {/* Couple Card */}
                    {showCoupleCard && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: reducedMotion ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
                            className={cn(
                                "relative overflow-hidden rounded-[2rem] p-10 md:p-16 mb-16 group transition-all duration-700",
                                getThemeClasses('card')
                            )}
                        >
                        {/* Interactive Background Gradient */}
                        <div className="absolute inset-0 opacity-[0.08] group-hover:opacity-[0.12] transition-opacity duration-700 pointer-events-none">
                            <div className="absolute top-0 left-0 w-full h-full bg-nf-gradient" />
                        </div>

                        <div className="relative z-10">
                            {/* Title */}
                            <h3 className="text-center text-4xl md:text-5xl font-display text-primary mb-3 tracking-tight">
                                Namtan <span className="nf-gradient-text opacity-70">×</span> Film
                            </h3>
                            <p className="text-center text-muted text-sm md:text-base tracking-[0.2em] uppercase font-medium mb-12 font-thai opacity-70">
                                {t('about.couple')}
                            </p>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-6 md:gap-12 mb-12">
                                {stats.map((stat, index) => (
                                    <motion.div
                                        key={stat.labelKey}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: reducedMotion ? 0 : 0.5, delay: 0.2 + index * 0.1 }}
                                        className="text-center group/stat"
                                    >
                                        <div className="text-3xl md:text-4xl mb-3 grayscale-[0.5] group-hover/stat:grayscale-0 transition-all duration-300">{stat.icon}</div>
                                        <div className="text-primary text-3xl md:text-4xl font-display font-light mb-1.5 tabular-nums">{stat.value}</div>
                                        <div className="text-muted text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] opacity-60">{t(stat.labelKey)}</div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Description */}
                            <div className="relative">
                                <div className="absolute -left-6 top-0 text-6xl text-accent opacity-10 font-display select-none">“</div>
                                <p className="text-primary/80 text-center text-base md:text-lg leading-relaxed font-body italic max-w-2xl mx-auto">
                                    {t('about.description')}
                                </p>
                                <div className="absolute -right-6 bottom-0 text-6xl text-accent opacity-10 font-display select-none rotate-180">“</div>
                            </div>
                        </div>
                    </motion.div>
                    )}

                    {/* Actor Cards */}
                    {showActorCards && (
                        <div className="grid md:grid-cols-2 gap-8 mb-16">
                            {/* Namtan */}
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: reducedMotion ? 0 : 0.7 }}
                                className={cn(
                                    "p-10 rounded-3xl transition-all duration-500 group relative overflow-hidden",
                                    getThemeClasses('actorCard')
                                )}
                            >
                            <div className="absolute top-0 left-0 w-full h-1 bg-namtan-primary opacity-40 group-hover:opacity-100 transition-opacity" />
                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-namtan-primary/10 flex items-center justify-center text-2xl shadow-sm shadow-namtan-primary/5 group-hover:scale-110 transition-transform duration-500">
                                    🦋
                                </div>
                                <div>
                                    <h4 className="text-primary text-2xl font-display font-light group-hover:text-namtan-primary transition-colors">{actors.namtan.nickname}</h4>
                                    <p className="text-muted text-[10px] uppercase font-bold tracking-[0.25em] mt-1">{actors.namtan.nameThai}</p>
                                </div>
                            </div>
                            <p className="text-primary/70 text-sm md:text-base font-body leading-relaxed border-l-2 border-namtan-primary/20 pl-4 py-1 italic">{actors.namtan.taglineThai}</p>

                            {/* Social Links */}
                            {actors.namtan.social && (
                                <div className="flex flex-wrap gap-2 mt-8">
                                    {actors.namtan.social.instagram && (
                                        <a href={`https://instagram.com/${actors.namtan.social.instagram}`} target="_blank"
                                        className="text-muted hover:text-namtan-primary text-[10px] font-bold uppercase tracking-widest transition-all border border-theme/60 px-4 py-2 rounded-full hover:bg-namtan-primary/5">
                                            Instagram
                                        </a>
                                    )}
                                    {actors.namtan.social.twitter && (
                                        <a href={`https://x.com/${actors.namtan.social.twitter}`} target="_blank"
                                            className="text-muted hover:text-namtan-primary text-[10px] font-bold uppercase tracking-widest transition-all border border-theme/60 px-4 py-2 rounded-full hover:bg-namtan-primary/5">
                                            X (Twitter)
                                        </a>
                                    )}
                                </div>
                            )}
                        </motion.div>

                            {/* Film */}
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: reducedMotion ? 0 : 0.7 }}
                                className={cn(
                                    "p-10 rounded-3xl transition-all duration-500 group relative overflow-hidden",
                                    getThemeClasses('actorCard')
                                )}
                            >
                            <div className="absolute top-0 left-0 w-full h-1 bg-film-primary opacity-40 group-hover:opacity-100 transition-opacity" />
                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-film-primary/10 flex items-center justify-center text-2xl shadow-sm shadow-film-primary/5 group-hover:scale-110 transition-transform duration-500">
                                    ✨
                                </div>
                                <div>
                                    <h4 className="text-primary text-2xl font-display font-light group-hover:text-film-primary transition-colors">{actors.film.nickname}</h4>
                                    <p className="text-muted text-[10px] uppercase font-bold tracking-[0.25em] mt-1">{actors.film.nameThai}</p>
                                </div>
                            </div>
                            <p className="text-primary/70 text-sm md:text-base font-body leading-relaxed border-l-2 border-film-primary/20 pl-4 py-1 italic">{actors.film.taglineThai}</p>

                            {/* Social Links */}
                            {actors.film.social && (
                                <div className="flex flex-wrap gap-2 mt-8">
                                    {actors.film.social.instagram && (
                                        <a href={`https://instagram.com/${actors.film.social.instagram}`} target="_blank"
                                        className="text-muted hover:text-film-primary text-[10px] font-bold uppercase tracking-widest transition-all border border-theme/60 px-4 py-2 rounded-full hover:bg-film-primary/5">
                                            Instagram
                                        </a>
                                    )}
                                    {actors.film.social.twitter && (
                                        <a href={`https://x.com/${actors.film.social.twitter}`} target="_blank"
                                            className="text-muted hover:text-film-primary text-[10px] font-bold uppercase tracking-widest transition-all border border-theme/60 px-4 py-2 rounded-full hover:bg-film-primary/5">
                                            X (Twitter)
                                        </a>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </div>
                    )}

                    {/* Disclaimer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center"
                    >
                        <div className="inline-block px-10 py-6 rounded-2xl border border-theme/40 bg-surface/50 backdrop-blur-sm shadow-sm">
                            <p className="text-muted text-xs md:text-sm font-medium tracking-wide font-thai opacity-60">
                                {t('about.disclaimer')}
                            </p>
                            <p className="text-muted text-[10px] mt-2 font-bold uppercase tracking-widest opacity-40">
                                {t('about.imageRights')}
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
