'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { useViewState } from '@/context/ViewStateContext';
import { actors as defaultActors } from '@/data/actors';

export function ProfileSection() {
    const t = useTranslations();
    const language = useLocale();
    const { state } = useViewState();
    const [actors, setActors] = useState(defaultActors);

    useEffect(() => {
        const saved = localStorage.getItem('ntf_actor_profiles');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const namtanData = parsed.find((p: any) => p.id === 'namtan');
                const filmData = parsed.find((p: any) => p.id === 'film');

                if (namtanData && filmData) {
                    setActors({
                        ...defaultActors,
                        namtan: {
                            ...defaultActors.namtan,
                            nickname: namtanData.nickname,
                            nicknameThai: namtanData.nickname_th,
                            name: namtanData.full_name,
                            nameThai: namtanData.full_name_th,
                            bio: {
                                ...defaultActors.namtan.bio,
                                fullName: namtanData.full_name,
                                fullNameThai: namtanData.full_name_th,
                                birthDate: namtanData.birth_date,
                                birthDateThai: namtanData.birth_date_th,
                                birthPlace: namtanData.birth_place,
                                birthPlaceThai: namtanData.birth_place_th,
                                education: namtanData.education,
                                educationThai: namtanData.education_th,
                            },
                            social: { instagram: namtanData.instagram, twitter: namtanData.twitter }
                        },
                        film: {
                            ...defaultActors.film,
                            nickname: filmData.nickname,
                            nicknameThai: filmData.nickname_th,
                            name: filmData.full_name,
                            nameThai: filmData.full_name_th,
                            bio: {
                                ...defaultActors.film.bio,
                                fullName: filmData.full_name,
                                fullNameThai: filmData.full_name_th,
                                birthDate: filmData.birth_date,
                                birthDateThai: filmData.birth_date_th,
                                birthPlace: filmData.birth_place,
                                birthPlaceThai: filmData.birth_place_th,
                                education: filmData.education,
                                educationThai: filmData.education_th,
                            },
                            social: { instagram: filmData.instagram, twitter: filmData.twitter }
                        }
                    });
                }
            } catch {}
        }
    }, []);

    const showNamtan = state === 'both' || state === 'namtan' || state === 'lunar';
    const showFilm = state === 'both' || state === 'film' || state === 'lunar';

    return (
        <section id="profile" className="py-16 md:py-24 bg-[var(--color-bg)]">
            <div className="container mx-auto px-6 md:px-12 max-w-5xl">

                <div className="flex flex-col md:flex-row gap-12 md:gap-16">
                    {/* Namtan - Left Side */}
                    {showNamtan && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="flex-1"
                        >
                            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 md:p-10 shadow-[0_0_0_1px_var(--color-border)] h-full">
                                {/* Color accent */}
                                <div
                                    className="w-12 h-1 mb-6 rounded-full"
                                    style={{ backgroundColor: 'var(--namtan-teal)' }}
                                />

                                {/* Name */}
                                <h3 className={`text-3xl md:text-4xl font-display text-[var(--color-text-primary)] mb-2 tracking-wide`}>
                                    {language === 'th' ? actors.namtan.nicknameThai : actors.namtan.nickname}
                                </h3>
                                <p className={`text-[var(--color-text-muted)] text-sm mb-8 ${language === 'th' ? 'font-thai' : ''}`}>
                                    {language === 'th' ? actors.namtan.nameThai : actors.namtan.name}
                                </p>

                                {/* Bio */}
                                <div className={`space-y-6 ${language === 'th' ? 'font-thai' : ''}`}>
                                    <div>
                                        <span className="text-[var(--color-text-muted)] text-[10px] uppercase tracking-[0.2em] block mb-1">
                                            {t('actor.realName')}
                                        </span>
                                        <span className="text-[var(--color-text-primary)] text-sm">
                                            {language === 'th' ? actors.namtan.bio?.fullNameThai : actors.namtan.bio?.fullName}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[var(--color-text-muted)] text-[10px] uppercase tracking-[0.2em] block mb-1">
                                            {t('actor.birthDate')}
                                        </span>
                                        <span className="text-[var(--color-text-primary)] text-sm">
                                            {language === 'th' ? actors.namtan.bio?.birthDateThai : actors.namtan.bio?.birthDate}
                                        </span>
                                    </div>
                                    {actors.namtan.bio?.birthPlace && (
                                        <div>
                                            <span className="text-[var(--color-text-muted)] text-[10px] uppercase tracking-[0.2em] block mb-1">
                                                {t('actor.birthPlace')}
                                            </span>
                                            <span className="text-[var(--color-text-primary)] text-sm">
                                                {language === 'th' ? actors.namtan.bio?.birthPlaceThai : actors.namtan.bio?.birthPlace}
                                            </span>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-[var(--color-text-muted)] text-[10px] uppercase tracking-[0.2em] block mb-1">
                                            {t('actor.education')}
                                        </span>
                                        <span className="text-[var(--color-text-primary)] text-sm leading-relaxed block">
                                            {language === 'th' ? actors.namtan.bio?.educationThai : actors.namtan.bio?.education}
                                        </span>
                                    </div>
                                </div>

                                {/* Social Links */}
                                {actors.namtan.social && (
                                    <div className="flex gap-4 mt-10 pt-6 border-t border-[var(--color-border)]">
                                        {actors.namtan.social.instagram && (
                                            <a
                                                href={`https://instagram.com/${actors.namtan.social.instagram}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[var(--color-text-secondary)] hover:text-[#6cbfd0] text-sm font-medium transition-colors"
                                            >
                                                IG: @{actors.namtan.social.instagram}
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Film - Right Side */}
                    {showFilm && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="flex-1"
                        >
                            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 md:p-10 shadow-[0_0_0_1px_var(--color-border)] h-full md:text-right">
                                {/* Color accent */}
                                <div
                                    className="w-12 h-1 mb-6 rounded-full inline-block"
                                    style={{ backgroundColor: 'var(--film-gold)' }}
                                />

                                {/* Name */}
                                <h3 className={`text-3xl md:text-4xl font-display text-[var(--color-text-primary)] mb-2 tracking-wide`}>
                                    {language === 'th' ? actors.film.nicknameThai : actors.film.nickname}
                                </h3>
                                <p className={`text-[var(--color-text-muted)] text-sm mb-8 ${language === 'th' ? 'font-thai' : ''}`}>
                                    {language === 'th' ? actors.film.nameThai : actors.film.name}
                                </p>

                                {/* Bio */}
                                <div className={`space-y-6 ${language === 'th' ? 'font-thai' : ''}`}>
                                    <div>
                                        <span className="text-[var(--color-text-muted)] text-[10px] uppercase tracking-[0.2em] block mb-1">
                                            {t('actor.realName')}
                                        </span>
                                        <span className="text-[var(--color-text-primary)] text-sm">
                                            {language === 'th' ? actors.film.bio?.fullNameThai : actors.film.bio?.fullName}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[var(--color-text-muted)] text-[10px] uppercase tracking-[0.2em] block mb-1">
                                            {t('actor.birthDate')}
                                        </span>
                                        <span className="text-[var(--color-text-primary)] text-sm">
                                            {language === 'th' ? actors.film.bio?.birthDateThai : actors.film.bio?.birthDate}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[var(--color-text-muted)] text-[10px] uppercase tracking-[0.2em] block mb-1">
                                            {t('actor.education')}
                                        </span>
                                        <span className="text-[var(--color-text-primary)] text-sm leading-relaxed block">
                                            {language === 'th' ? actors.film.bio?.educationThai : actors.film.bio?.education}
                                        </span>
                                    </div>
                                    {actors.film.bio?.description && (
                                        <div className="pt-2">
                                            <span className="text-[var(--color-text-secondary)] text-[13px] leading-relaxed block">
                                                {language === 'th' ? actors.film.bio?.descriptionThai : actors.film.bio?.description}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Social Links */}
                                {actors.film.social && (
                                    <div className="flex gap-4 mt-10 pt-6 border-t border-[var(--color-border)] md:justify-end">
                                        {actors.film.social.instagram && (
                                            <a
                                                href={`https://instagram.com/${actors.film.social.instagram}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[var(--color-text-secondary)] hover:text-[#fbdf74] text-sm font-medium transition-colors"
                                            >
                                                IG: @{actors.film.social.instagram}
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </section>
    );
}
