'use client';

import { motion } from 'framer-motion';
import { useViewState } from '@/context/ViewStateContext';
import { useTranslations, useLocale } from 'next-intl';
import { actors } from '@/data/actors';

export function AboutSection() {
    const { reducedMotion } = useViewState();
    const t = useTranslations();
  const language = useLocale();

    const socialLinks = [
        { name: 'Twitter', url: '#', icon: '𝕏' },
        { name: 'Instagram', url: '#', icon: '📷' },
        { name: 'TikTok', url: '#', icon: '🎵' },
    ];

    const stats = [
        { labelKey: 'about.worksCount', value: '5+', icon: '🎬' },
        { labelKey: 'about.awards', value: '3', icon: '🏆' },
        { labelKey: 'about.fans', value: '∞', icon: '💕' },
    ];

    return (
        <section id="about" className="py-24 transition-colors duration-300"
             style={{ background: 'linear-gradient(to bottom, var(--color-bg), var(--color-panel))' }}>
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
                        {t('about.sub')}
                    </p>
                    <h2 className={`text-[var(--color-text-primary)] text-4xl md:text-5xl font-light tracking-wide ${language === 'th' ? 'font-thai' : ''}`}>
                        {t('about.title')}
                    </h2>
                </motion.div>

                {/* Main Content */}
                <div className="max-w-4xl mx-auto">
                    {/* Couple Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: reducedMotion ? 0 : 0.6 }}
                        className="relative overflow-hidden rounded-2xl
              backdrop-blur-sm border border-[var(--color-border)] p-8 md:p-12 mb-12"
                        style={{ background: 'var(--color-surface)' }}
                    >
                        {/* Background Gradient */}
                        <div className="absolute inset-0 opacity-30">
                            <div
                                className="absolute top-0 left-0 w-1/2 h-full"
                                style={{ background: `linear-gradient(135deg, ${actors.namtan.color.primary}20, transparent)` }}
                            />
                            <div
                                className="absolute top-0 right-0 w-1/2 h-full"
                                style={{ background: `linear-gradient(225deg, ${actors.film.color.primary}20, transparent)` }}
                            />
                        </div>

                        <div className="relative z-10">
                            {/* Title */}
                            <h3 className="text-center text-3xl md:text-4xl font-light text-[var(--color-text-primary)] mb-2 tracking-wider">
                                Namtan <span className="text-white/50">×</span> Film
                            </h3>
                            <p className="text-center text-[var(--color-text-muted)] text-lg font-light mb-8 font-thai">
                                คู่จิ้นขวัญใจแฟนคลับ
                            </p>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 md:gap-8 mb-8">
                                {stats.map((stat, index) => (
                                    <motion.div
                                        key={stat.labelKey}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: reducedMotion ? 0 : 0.4, delay: index * 0.1 }}
                                        className="text-center"
                                    >
                                        <div className="text-3xl mb-2">{stat.icon}</div>
                                        <div className="text-[var(--color-text-primary)] text-2xl md:text-3xl font-light mb-1">{stat.value}</div>
                                        <div className={`text-[var(--color-text-muted)] text-sm ${language === 'th' ? 'font-thai' : ''}`}>{t(stat.labelKey)}</div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Description */}
                            <p className={`text-[var(--color-text-secondary)] text-center leading-relaxed font-light max-w-2xl mx-auto ${language === 'th' ? 'font-thai' : ''}`}>
                                {t('about.description')}
                            </p>
                        </div>
                    </motion.div>

                    {/* Actor Cards */}
                    <div className="grid md:grid-cols-2 gap-6 mb-12">
                        {/* Namtan */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: reducedMotion ? 0 : 0.5 }}
                            className="p-6 rounded-xl border border-[var(--color-border)] hover:border-namtan-primary/30
                transition-all duration-300 group"
                        style={{ background: 'var(--color-surface)' }}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl
                    group-hover:scale-110 transition-transform duration-300"
                                    style={{ backgroundColor: actors.namtan.color.primary + '30' }}
                                >
                                    💎
                                </div>
                                <div>
                                    <h4 className="text-[var(--color-text-primary)] text-lg font-light">{actors.namtan.nickname}</h4>
                                    <p className="text-namtan-primary text-sm font-thai">{actors.namtan.nameThai}</p>
                                </div>
                            </div>
                            <p className="text-[var(--color-text-muted)] text-sm font-light font-thai">{actors.namtan.taglineThai}</p>

                            {/* Social Links */}
                            {actors.namtan.social && (
                                <div className="flex gap-3 mt-4">
                                    {actors.namtan.social.instagram && (
                                        <a href={`https://instagram.com/${actors.namtan.social.instagram}`} target="_blank"
                                        className="text-[var(--color-text-muted)] hover:text-namtan-primary text-xs transition-colors font-medium border border-[var(--color-border)] px-2 py-0.5 rounded">
                                            IG
                                        </a>
                                    )}
                                    {actors.namtan.social.twitter && (
                                        <a href={`https://x.com/${actors.namtan.social.twitter}`} target="_blank"
                                            className="text-[var(--color-text-muted)] hover:text-namtan-primary text-xs transition-colors font-medium border border-[var(--color-border)] px-2 py-0.5 rounded">
                                            X
                                        </a>
                                    )}
                                    {actors.namtan.social.tiktok && (
                                        <a href={`https://tiktok.com/@${actors.namtan.social.tiktok}`} target="_blank"
                                            className="text-[var(--color-text-muted)] hover:text-namtan-primary text-xs transition-colors font-medium border border-[var(--color-border)] px-2 py-0.5 rounded">
                                            TikTok
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
                            transition={{ duration: reducedMotion ? 0 : 0.5 }}
                            className="p-6 rounded-xl border border-[var(--color-border)] hover:border-film-primary/30
                transition-all duration-300 group"
                        style={{ background: 'var(--color-surface)' }}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl
                    group-hover:scale-110 transition-transform duration-300"
                                    style={{ backgroundColor: actors.film.color.primary + '30' }}
                                >
                                    ⭐
                                </div>
                                <div>
                                    <h4 className="text-[var(--color-text-primary)] text-lg font-light">{actors.film.nickname}</h4>
                                    <p className="text-film-primary text-sm font-thai">{actors.film.nameThai}</p>
                                </div>
                            </div>
                            <p className="text-[var(--color-text-muted)] text-sm font-light font-thai">{actors.film.taglineThai}</p>

                            {/* Social Links */}
                            {actors.film.social && (
                                <div className="flex gap-3 mt-4">
                                    {actors.film.social.instagram && (
                                        <a href={`https://instagram.com/${actors.film.social.instagram}`} target="_blank"
                                        className="text-[var(--color-text-muted)] hover:text-film-primary text-xs transition-colors font-medium border border-[var(--color-border)] px-2 py-0.5 rounded">
                                            IG
                                        </a>
                                    )}
                                    {actors.film.social.twitter && (
                                        <a href={`https://x.com/${actors.film.social.twitter}`} target="_blank"
                                            className="text-[var(--color-text-muted)] hover:text-film-primary text-xs transition-colors font-medium border border-[var(--color-border)] px-2 py-0.5 rounded">
                                            X
                                        </a>
                                    )}
                                    {actors.film.social.tiktok && (
                                        <a href={`https://tiktok.com/@${actors.film.social.tiktok}`} target="_blank"
                                            className="text-[var(--color-text-muted)] hover:text-film-primary text-xs transition-colors font-medium border border-[var(--color-border)] px-2 py-0.5 rounded">
                                            TikTok
                                        </a>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Disclaimer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center"
                    >
                        <div className="inline-block px-6 py-4 rounded-xl border border-[var(--color-border)]"
                             style={{ background: 'var(--color-surface)' }}>
                            <p className="text-[var(--color-text-muted)] text-sm font-light font-thai">
                                🎬 เว็บไซต์นี้สร้างโดยแฟนคลับ ไม่ได้เกี่ยวข้องกับต้นสังกัดอย่างเป็นทางการ
                            </p>
                            <p className="text-[var(--color-text-muted)] text-xs mt-2 font-thai">
                                All images belong to their respective owners
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
