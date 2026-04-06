'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { actors } from '@/data/actors';

export function ProfileSection() {
    const { t, language } = useLanguage();

    return (
        <section id="profile" className="relative min-h-screen w-full overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src="/images/profile/00.jpg"
                    alt="Namtan and Film"
                    className="w-full h-full object-cover object-center"
                />
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/60" />
                {/* Gradient overlays for text readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
            </div>

            {/* Section Header */}
            <div className="relative z-10 pt-20 md:pt-32 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="text-white/50 text-sm tracking-[0.3em] uppercase block mb-3">
                        {t('profile.sub')}
                    </span>
                    <h2 className={`text-3xl md:text-5xl font-light text-white tracking-wide ${language === 'th' ? 'font-thai' : 'font-display'}`}>
                        {t('profile.title')}
                    </h2>
                </motion.div>
            </div>

            {/* Profile Content */}
            <div className="relative z-10 flex flex-col md:flex-row min-h-[70vh] items-end pb-16 md:pb-24">
                {/* Namtan - Left Side */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex-1 px-6 md:px-12 lg:px-20 mb-8 md:mb-0"
                >
                    <div className="max-w-md">
                        {/* Color accent */}
                        <div
                            className="w-12 h-0.5 mb-6"
                            style={{ backgroundColor: actors.namtan.color.primary }}
                        />

                        {/* Name */}
                        <h3 className={`text-2xl md:text-4xl font-light text-white mb-2 tracking-wide ${language === 'th' ? 'font-thai' : 'font-display'}`}>
                            {language === 'th' ? actors.namtan.nicknameThai : actors.namtan.nickname}
                        </h3>
                        <p className={`text-white/50 text-sm mb-6 ${language === 'th' ? 'font-thai' : ''}`}>
                            {language === 'th' ? actors.namtan.nameThai : actors.namtan.name}
                        </p>

                        {/* Bio */}
                        <div className={`space-y-3 ${language === 'th' ? 'font-thai' : ''}`}>
                            <div>
                                <span className="text-white/40 text-xs uppercase tracking-wider block mb-1">
                                    {t('actor.realName')}
                                </span>
                                <span className="text-white/90 text-sm">
                                    {language === 'th' ? actors.namtan.bio?.fullNameThai : actors.namtan.bio?.fullName}
                                </span>
                            </div>
                            <div>
                                <span className="text-white/40 text-xs uppercase tracking-wider block mb-1">
                                    {t('actor.birthDate')}
                                </span>
                                <span className="text-white/90 text-sm">
                                    {language === 'th' ? actors.namtan.bio?.birthDateThai : actors.namtan.bio?.birthDate}
                                </span>
                            </div>
                            {actors.namtan.bio?.birthPlace && (
                                <div>
                                    <span className="text-white/40 text-xs uppercase tracking-wider block mb-1">
                                        {t('actor.birthPlace')}
                                    </span>
                                    <span className="text-white/90 text-sm">
                                        {language === 'th' ? actors.namtan.bio?.birthPlaceThai : actors.namtan.bio?.birthPlace}
                                    </span>
                                </div>
                            )}
                            <div>
                                <span className="text-white/40 text-xs uppercase tracking-wider block mb-1">
                                    {t('actor.education')}
                                </span>
                                <span className="text-white/90 text-sm leading-relaxed block">
                                    {language === 'th' ? actors.namtan.bio?.educationThai : actors.namtan.bio?.education}
                                </span>
                            </div>
                        </div>

                        {/* Social Links */}
                        {actors.namtan.social && (
                            <div className="flex gap-4 mt-6">
                                {actors.namtan.social.instagram && (
                                    <a
                                        href={`https://instagram.com/${actors.namtan.social.instagram}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-white/40 hover:text-white text-xs transition-colors"
                                    >
                                        @{actors.namtan.social.instagram}
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Film - Right Side */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="flex-1 px-6 md:px-12 lg:px-20 md:text-right"
                >
                    <div className="max-w-md md:ml-auto">
                        {/* Color accent */}
                        <div
                            className="w-12 h-0.5 mb-6 md:ml-auto"
                            style={{ backgroundColor: actors.film.color.primary }}
                        />

                        {/* Name */}
                        <h3 className={`text-2xl md:text-4xl font-light text-white mb-2 tracking-wide ${language === 'th' ? 'font-thai' : 'font-display'}`}>
                            {language === 'th' ? actors.film.nicknameThai : actors.film.nickname}
                        </h3>
                        <p className={`text-white/50 text-sm mb-6 ${language === 'th' ? 'font-thai' : ''}`}>
                            {language === 'th' ? actors.film.nameThai : actors.film.name}
                        </p>

                        {/* Bio */}
                        <div className={`space-y-3 ${language === 'th' ? 'font-thai' : ''}`}>
                            <div>
                                <span className="text-white/40 text-xs uppercase tracking-wider block mb-1">
                                    {t('actor.realName')}
                                </span>
                                <span className="text-white/90 text-sm">
                                    {language === 'th' ? actors.film.bio?.fullNameThai : actors.film.bio?.fullName}
                                </span>
                            </div>
                            <div>
                                <span className="text-white/40 text-xs uppercase tracking-wider block mb-1">
                                    {t('actor.birthDate')}
                                </span>
                                <span className="text-white/90 text-sm">
                                    {language === 'th' ? actors.film.bio?.birthDateThai : actors.film.bio?.birthDate}
                                </span>
                            </div>
                            <div>
                                <span className="text-white/40 text-xs uppercase tracking-wider block mb-1">
                                    {t('actor.education')}
                                </span>
                                <span className="text-white/90 text-sm leading-relaxed block">
                                    {language === 'th' ? actors.film.bio?.educationThai : actors.film.bio?.education}
                                </span>
                            </div>
                            {actors.film.bio?.description && (
                                <div className="pt-2">
                                    <span className="text-white/60 text-sm leading-relaxed block">
                                        {language === 'th' ? actors.film.bio?.descriptionThai : actors.film.bio?.description}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Social Links */}
                        {actors.film.social && (
                            <div className="flex gap-4 mt-6 md:justify-end">
                                {actors.film.social.instagram && (
                                    <a
                                        href={`https://instagram.com/${actors.film.social.instagram}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-white/40 hover:text-white text-xs transition-colors"
                                    >
                                        @{actors.film.social.instagram}
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Corner Decorations */}
            <div className="absolute top-8 left-8 w-12 h-12 border-l border-t border-white/10 z-10" />
            <div className="absolute top-8 right-8 w-12 h-12 border-r border-t border-white/10 z-10" />
            <div className="absolute bottom-8 left-8 w-12 h-12 border-l border-b border-white/10 z-10" />
            <div className="absolute bottom-8 right-8 w-12 h-12 border-r border-b border-white/10 z-10" />
        </section>
    );
}
