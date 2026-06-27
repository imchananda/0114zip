'use client';

/**
 * Phase 6 — cross-layer section (pattern from Schedule/Challenges pilots):
 *   • Visual: getAwardsStyles (awardsPreview.styles.ts)
 *   • Motion: useSectionMotion + toWhileInViewBinding
 *   • Theme: SectionThemeWrapper → CSS vars
 */
import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useViewState } from '@/context/ViewStateContext';
import type { HomepageSectionConfig, PageMotionConfig, PageThemeConfig } from '@/lib/homepage-sections';
import { SectionThemeWrapper } from '@/components/ui/SectionThemeWrapper';
import { toWhileInViewBinding, useSectionMotion } from '@/lib/visual';
import type { HomeAwardPreviewItem } from '@/lib/homepage-data';
import { getAwardsStyles, resolveAwardsLimit } from './awardsPreview.styles';

type AwardItem = HomeAwardPreviewItem;

function getActorAccent(actors: string[]): string {
  if (actors.length > 1 || actors.includes('both')) return 'var(--nf-gradient)';
  if (actors[0] === 'namtan') return 'var(--namtan-teal)';
  return 'var(--film-gold)';
}

export function AwardsPreview({
  initialAwards,
  config,
  pageMotion,
  pageTheme,
}: {
  initialAwards?: AwardItem[];
  config?: Pick<HomepageSectionConfig, 'limit' | 'motion' | 'themeTokens'>;
  pageMotion?: PageMotionConfig;
  pageTheme?: PageThemeConfig;
} = {}) {
  const t = useTranslations();
  const { state } = useViewState();
  const styles = getAwardsStyles();
  const sectionMotion = useSectionMotion(pageMotion, config?.motion);
  const headerSubMotion = toWhileInViewBinding(sectionMotion);
  const headerTitleMotion = toWhileInViewBinding(sectionMotion, 1);

  const items = initialAwards || [];
  const limit = resolveAwardsLimit(config?.limit);

  const filteredAwards = items
    .filter((award) => {
      if (state === 'both' || state === 'lunar') return true;
      return award.actors.includes(state) || award.actors.includes('both');
    })
    .slice(0, limit);

  const getActorLabel = (actors: string[]) => {
    if (actors.length > 1 || actors.includes('both')) return t('state.namtanfilm');
    if (actors[0] === 'namtan') return t('state.namtan');
    if (actors[0] === 'film') return t('state.film');
    return actors[0] ?? '';
  };

  return (
    <SectionThemeWrapper
      as="section"
      id="awards"
      className={styles.sectionClass}
      pageTheme={pageTheme}
      sectionTheme={config?.themeTokens}
    >
      <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12">
        <div className={styles.headerClass}>
          <div>
            <motion.p
              initial={headerSubMotion.initial}
              whileInView={headerSubMotion.whileInView}
              viewport={headerSubMotion.viewport}
              transition={headerSubMotion.transition}
              className={styles.sublineClass}
            >
              {t('awardsPreview.sub')}
            </motion.p>
            <motion.h2
              initial={headerTitleMotion.initial}
              whileInView={headerTitleMotion.whileInView}
              viewport={headerTitleMotion.viewport}
              transition={headerTitleMotion.transition}
              className={styles.titleClass}
            >
              {t('awardsPreview.titleLine1')} <br className="md:hidden" />
              {t('awardsPreview.titleLine2')}
            </motion.h2>
          </div>
          <Link href="/awards" className={styles.viewAllLinkClass}>
            {t('awardsPreview.viewAll')}{' '}
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        <div className={styles.gridClass}>
          {filteredAwards.length === 0 ? (
            <div className={styles.emptyStateClass}>
              <p className={styles.emptyStateTextClass}>{t('awardsPreview.empty')}</p>
              <Link href="/awards" className={styles.emptyActionClass}>
                {t('awardsPreview.emptyAction')}
              </Link>
            </div>
          ) : (
            filteredAwards.map((award, i) => {
              const cardMotion = toWhileInViewBinding(sectionMotion, i);
              const isBoth = award.actors.length > 1 || award.actors.includes('both');
              const accent = getActorAccent(award.actors);

              return (
                <motion.div
                  key={award.id}
                  initial={cardMotion.initial}
                  whileInView={cardMotion.whileInView}
                  viewport={cardMotion.viewport}
                  transition={cardMotion.transition}
                >
                  <Link href="/awards" className={styles.cardOuterClass}>
                    <div className={styles.cardClass}>
                      <div className={styles.accentBarClass} style={{ background: accent }} />

                      <div className={styles.cardHeaderRowClass}>
                        <span className={styles.trophyIconClass}>🏆</span>
                        <span className={styles.yearBadgeClass}>{award.year}</span>
                      </div>

                      <h3 className={styles.cardTitleClass}>{award.award_name || award.title}</h3>
                      <p className={styles.cardDescriptionClass}>
                        {award.ceremony || award.description}
                      </p>

                      <div className={styles.cardFooterClass}>
                        <span
                          className={styles.actorBadgeClass}
                          style={{
                            background: isBoth ? 'var(--nf-gradient)' : 'transparent',
                            color: isBoth ? 'var(--deep-dark)' : 'var(--muted)',
                          }}
                        >
                          {getActorLabel(award.actors)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </SectionThemeWrapper>
  );
}
