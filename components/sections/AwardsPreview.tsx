'use client';

import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useViewState } from '@/context/ViewStateContext';

type AwardItem = {
  id: string;
  year?: number;
  title?: string;
  award_name?: string;
  ceremony?: string;
  description?: string;
  actors: string[];
};

export function AwardsPreview({ initialAwards, config }: { initialAwards?: AwardItem[]; config?: { limit?: number } }) {
  const t = useTranslations();
  const { state } = useViewState();

  const items = initialAwards || [];

  const filteredAwards = items.filter((award) => {
    if (state === 'both' || state === 'lunar') return true;
    return award.actors.includes(state) || award.actors.includes('both');
  }).slice(0, config?.limit ?? 6);

  const getActorLabel = (actors: string[]) => {
    if (actors.length > 1 || actors.includes('both')) return t('state.namtanfilm');
    if (actors[0] === 'namtan') return t('state.namtan');
    if (actors[0] === 'film') return t('state.film');
    return actors[0] ?? '';
  };

  return (
    <section className="py-24 md:py-32 bg-[var(--color-bg)] transition-colors duration-500 relative">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        <div className="flex flex-col md:flex-row items-baseline justify-between mb-12 md:mb-16 pb-6 border-b border-theme/40">
          <div>
            <motion.p 
              initial={{ opacity: 0, y: 5 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-overline text-accent font-bold mb-4 uppercase tracking-[0.4em]"
            >
              {t('awardsPreview.sub')}
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-section text-primary leading-tight font-light"
            >
              {t('awardsPreview.titleLine1')} <br className="md:hidden" />{t('awardsPreview.titleLine2')}
            </motion.h2>
          </div>
          <Link href="/awards" className="text-xs tracking-[0.2em] font-bold uppercase text-muted hover:text-accent transition-colors flex items-center gap-2 group mt-6 md:mt-0">
            {t('awardsPreview.viewAll')} <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {/* Trophy showcase */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredAwards.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-surface border border-theme/60 rounded-[2rem] opacity-60">
               <p className="text-sm font-bold uppercase tracking-widest">{t('awardsPreview.empty')}</p>
               <Link href="/awards" className="inline-flex mt-5 text-xs tracking-[0.2em] font-bold uppercase text-muted hover:text-accent transition-colors">
                 {t('awardsPreview.emptyAction')}
               </Link>
            </div>
          ) : (
            filteredAwards.map((award, i) => (
              <motion.div
                key={award.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
              >
                <Link href="/awards" className="block group h-full">
                  <div className="bg-surface border border-theme/60 rounded-3xl p-8 group-hover:border-accent/40 transition-all duration-500 group-hover:shadow-xl flex flex-col h-full relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full opacity-20 group-hover:opacity-100 transition-opacity" 
                      style={{ background: award.actors.length > 1 ? 'var(--nf-gradient)' : (award.actors[0] === 'namtan' ? 'var(--namtan-teal)' : 'var(--film-gold)') }} />
                    
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-3xl grayscale-[0.4] group-hover:grayscale-0 transition-all duration-500">🏆</span>
                      <span className="text-[10px] px-3 py-1 rounded-full bg-green-500/10 text-green-600 font-bold uppercase tracking-widest border border-green-500/20">
                        {award.year}
                      </span>
                    </div>

                    <h3 className="text-xl font-display text-primary mb-3 leading-snug group-hover:text-accent transition-colors duration-300">
                      {award.award_name || award.title}
                    </h3>
                    <p className="text-xs text-muted font-thai font-medium tracking-wide mb-8 opacity-70">
                      {award.ceremony || award.description}
                    </p>

                    <div className="mt-auto pt-6 border-t border-theme/30">
                      <span
                        className="text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-[0.2em] border border-theme/60 shadow-sm"
                        style={{ 
                          background: award.actors.length > 1 ? 'var(--nf-gradient)' : 'transparent',
                          color: award.actors.length > 1 ? 'var(--deep-dark)' : 'var(--muted)'
                        }}
                      >
                        {getActorLabel(award.actors)}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
