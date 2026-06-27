'use client';

/**
 * Phase 6 — cross-layer section (pattern from Awards/Challenges pilots):
 *   • Visual: getPrizeStyles (prizeSection.styles.ts)
 *   • Motion: useSectionMotion + toWhileInViewBinding
 *   • Theme: SectionThemeWrapper → CSS vars
 */
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import type { HomepageSectionConfig, PageMotionConfig, PageThemeConfig } from '@/lib/homepage-sections';
import { SectionThemeWrapper } from '@/components/ui/SectionThemeWrapper';
import { toWhileInViewBinding, useSectionMotion } from '@/lib/visual';
import { getPrizeStyles, resolvePrizesLimit } from './prizeSection.styles';

interface Prize {
  id: string;
  title: string;
  description: string;
  value: string;
  sponsor?: string;
  deadline: string;
  status: 'open' | 'closed' | 'announced';
  emoji: string;
}

const PLACEHOLDER_PRIZES: Prize[] = [
  { id: '1', title: 'Grand Meet & Greet', description: 'Exclusive 1-on-1 session with Namtan & Film', value: '2 Prizes', deadline: '30 APR 2026', status: 'open', emoji: '🎤' },
  { id: '2', title: 'Signed Photobook', description: 'Official photobook with hand-signed message from Namtan', value: '5 Prizes', deadline: '20 APR 2026', status: 'open', emoji: '📗' },
  { id: '3', title: 'VIP Concert Tickets', description: 'Front-row VIP seats for the upcoming anniversary concert', value: '3 Prizes', deadline: '15 APR 2026', status: 'open', emoji: '🎫' },
];

const STATUS_STYLE: Record<string, { color: string }> = {
  open: { color: '#22C55E' },
  closed: { color: '#EF4444' },
  announced: { color: 'var(--film-gold)' },
};

export function PrizeSection({
  initialPrizes,
  config,
  pageMotion,
  pageTheme,
}: {
  initialPrizes?: Prize[];
  config?: Pick<HomepageSectionConfig, 'limit' | 'theme' | 'motion' | 'themeTokens'>;
  pageMotion?: PageMotionConfig;
  pageTheme?: PageThemeConfig;
} = {}) {
  const t = useTranslations();
  const styles = getPrizeStyles({ theme: config?.theme });
  const sectionMotion = useSectionMotion(pageMotion, config?.motion);
  const headerSubMotion = toWhileInViewBinding(sectionMotion);
  const headerTitleMotion = toWhileInViewBinding(sectionMotion, 1);

  const limit = resolvePrizesLimit(config?.limit);
  const prizes = (initialPrizes ?? PLACEHOLDER_PRIZES).slice(0, limit);

  return (
    <SectionThemeWrapper
      as="section"
      id="prizes"
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
              {t('prizes.sub')}
            </motion.p>
            <motion.h2
              initial={headerTitleMotion.initial}
              whileInView={headerTitleMotion.whileInView}
              viewport={headerTitleMotion.viewport}
              transition={headerTitleMotion.transition}
              className={styles.titleClass}
            >
              {t('prizes.titleLine1')} <br className="md:hidden" />
              {t('prizes.titleLine2')}
            </motion.h2>
          </div>
          <Link href="/engage/prizes" className={styles.winNowLinkClass}>
            {t('prizes.winNow')}{' '}
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        <div className={styles.gridClass}>
          {prizes.length === 0 ? (
            <div className={styles.emptyStateClass}>
              <p className={styles.emptyStateTextClass}>{t('prizes.empty')}</p>
              <Link href="/engage/prizes" className={styles.emptyActionClass}>
                {t('prizes.emptyAction')}
              </Link>
            </div>
          ) : (
            prizes.map((prize, i) => {
              const style = STATUS_STYLE[prize.status] ?? STATUS_STYLE.open;
              const cardMotion = toWhileInViewBinding(sectionMotion, i);

              return (
                <motion.div
                  key={prize.id}
                  initial={cardMotion.initial}
                  whileInView={cardMotion.whileInView}
                  viewport={cardMotion.viewport}
                  transition={cardMotion.transition}
                  className={styles.cardClass}
                >
                  <div className={styles.emojiCornerClass}>
                    <span className={styles.emojiCornerIconClass}>{prize.emoji}</span>
                  </div>

                  <div>
                    <span
                      className={styles.statusBadgeClass}
                      style={{ background: `${style.color}15`, color: style.color }}
                    >
                      {t(`prizes.status.${prize.status}` as 'prizes.status.open')}
                    </span>
                    <h3 className={styles.cardTitleClass}>{prize.title}</h3>
                    <p className={styles.cardDescriptionClass}>{prize.description}</p>
                  </div>

                  <div className={styles.cardFooterClass}>
                    <div className={styles.metaRowClass}>
                      <span className="flex items-center gap-2">
                        <span className="text-base opacity-60">🎁</span> {prize.value}
                      </span>
                    </div>
                    <div className={styles.metaRowClass}>
                      <span className="flex items-center gap-2">
                        <span className="text-base opacity-60">⏰</span> {prize.deadline}
                      </span>
                    </div>
                  </div>

                  <div className={styles.hoverAccentBarClass} />
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </SectionThemeWrapper>
  );
}
