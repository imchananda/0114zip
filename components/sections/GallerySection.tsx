'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useViewState } from '@/context/ViewStateContext';
import { useLanguage } from '@/context/LanguageContext';
import { galleryImages, GalleryImage } from '@/data/gallery';
import { actors } from '@/data/actors';

export function GallerySection() {
    const { state, reducedMotion } = useViewState();
    const { t, language } = useLanguage();
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
    const [filter, setFilter] = useState<'all' | 'both' | 'namtan' | 'film'>('all');

    const filteredImages = useMemo(() => {
        if (filter === 'all') return galleryImages;
        return galleryImages.filter(img => img.category === filter);
    }, [filter]);

    const filters = [
        { key: 'all', labelKey: 'gallery.all', color: '#ffffff' },
        { key: 'both', labelKey: 'gallery.together', color: 'linear-gradient(90deg, rgba(105, 188, 220, 0.4), rgba(248, 232, 95, 0.4))' },
        { key: 'namtan', labelKey: 'gallery.namtan', color: actors.namtan.color.primary },
        { key: 'film', labelKey: 'gallery.film', color: actors.film.color.primary },
        { key: 'lunar', labelKey: 'gallery.lunar', color: actors.lunar.color.primary },
    ];

    return (
        <section id="gallery" className="py-24 transition-colors duration-300"
             style={{ background: 'linear-gradient(to bottom, var(--color-bg), var(--color-panel), var(--color-bg))' }}>
            <div className="container mx-auto px-6 md:px-12 lg:px-20">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: reducedMotion ? 0 : 0.6 }}
                    className="text-center mb-12"
                >
                    <p className="text-[var(--color-text-muted)] text-sm tracking-[0.3em] uppercase mb-3 font-light">
                        {t('gallery.sub')}
                    </p>
                    <h2 className={`text-[var(--color-text-primary)] text-4xl md:text-5xl font-light tracking-wide ${language === 'th' ? 'font-thai' : ''}`}>
                        {t('gallery.title')}
                    </h2>
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: reducedMotion ? 0 : 0.6, delay: 0.1 }}
                    className="flex justify-center gap-3 mb-12 flex-wrap"
                >
                    {filters.map(({ key, labelKey, color }) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key as typeof filter)}
                            className={`px-5 py-2 rounded-full text-sm tracking-wider transition-all duration-300
                ${filter === key
                                    ? 'text-[var(--color-text-primary)] border-namtan-primary/40'
                                    : 'text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text-secondary)]'
                                } border ${language === 'th' ? 'font-thai' : ''}`}
                            style={{
                                background: filter === key
                                    ? color.includes('gradient')
                                        ? color
                                        : `${color}20`
                                    : 'transparent'
                            }}
                        >
                            {t(labelKey)}
                        </button>
                    ))}
                </motion.div>

                {/* Masonry Grid */}
                <motion.div
                    layout
                    className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredImages.map((image, index) => (
                            <motion.div
                                key={image.id}
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: reducedMotion ? 0 : 0.4, delay: index * 0.05 }}
                                className="break-inside-avoid group cursor-pointer"
                                onClick={() => setSelectedImage(image)}
                            >
                                <div className="relative overflow-hidden rounded-lg bg-neutral-900">
                                    <img
                                        src={image.src}
                                        alt={image.alt}
                                        className={`w-full object-cover transition-all duration-500
                      group-hover:scale-110 group-hover:brightness-110
                      ${image.aspectRatio === 'portrait' ? 'aspect-[3/4]' : ''}
                      ${image.aspectRatio === 'square' ? 'aspect-square' : ''}
                      ${image.aspectRatio === 'landscape' ? 'aspect-[4/3]' : ''}`}
                                    />

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    {/* Category Badge */}
                                    <div
                                        className="absolute top-3 right-3 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100
                      transition-opacity duration-300"
                                        style={{
                                            background: image.category === 'both'
                                                ? '#ffffff'
                                                : image.category === 'namtan'
                                                    ? actors.namtan.color.primary
                                                    : image.category === 'film'
                                                        ? actors.film.color.primary
                                                        : actors.lunar.color.primary
                                        }}
                                    />

                                    {/* View Icon */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 
                    group-hover:opacity-100 transition-opacity duration-300">
                                        <span className="text-white text-2xl">+</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {/* Lightbox */}
                <AnimatePresence>
                    {selectedImage && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
                            onClick={() => setSelectedImage(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                transition={{ duration: reducedMotion ? 0 : 0.3 }}
                                className="relative max-w-4xl max-h-[90vh]"
                                onClick={e => e.stopPropagation()}
                            >
                                <img
                                    src={selectedImage.src}
                                    alt={selectedImage.alt}
                                    className="max-w-full max-h-[85vh] object-contain rounded-lg"
                                />

                                {/* Close Button */}
                                <button
                                    onClick={() => setSelectedImage(null)}
                                    className="absolute -top-12 right-0 text-white/60 hover:text-white
                    text-2xl transition-colors"
                                >
                                    ✕
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
