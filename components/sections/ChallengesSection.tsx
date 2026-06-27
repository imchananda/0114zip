'use client';

/**
 * Phase 6 — cross-layer section (pattern from Schedule/Content pilots):
 *   • Visual: getChallengesStyles (challenges.styles.ts)
 *   • Motion: useSectionMotion + toWhileInViewBinding
 *   • Theme: SectionThemeWrapper → CSS vars
 */
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import type { HomepageSectionConfig, PageMotionConfig, PageThemeConfig } from '@/lib/homepage-sections';
import { SectionThemeWrapper } from '@/components/ui/SectionThemeWrapper';
import { toWhileInViewBinding, useSectionMotion } from '@/lib/visual';
import { getChallengesStyles, resolveChallengesLimit } from './challenges.styles';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  participants: number;
  daysLeft: number;
  color: string;
  emoji: string;
}

const PLACEHOLDER_CHALLENGES: Challenge[] = [
  { id: '1', title: 'NamtanFilm Photo Challenge', description: 'โพสต์รูปคู่ #NamtanFilm ลงโซเชียล', type: 'Photo', participants: 1240, daysLeft: 5, color: 'var(--namtan-teal)', emoji: '📷' },
  { id: '2', title: 'Thai Drama Trivia', description: 'ทายซีนจากละคร หลินคุณนาย', type: 'Quiz', participants: 876, daysLeft: 2, color: 'var(--film-gold)', emoji: '🎬' },
  { id: '3', title: 'Fan Art Contest', description: 'วาดภาพ Namtan × Film ส่งเข้าประกวด', type: 'Art', participants: 432, daysLeft: 12, color: '#a78bfa', emoji: '🎨' },
];

export function ChallengesSection({
  initialChallenges,
  config,
  pageMotion,
  pageTheme,
}: {
  initialChallenges?: Challenge[];
  config?: Pick<HomepageSectionConfig, 'limit' | 'layout' | 'motion' | 'themeTokens'>;
  pageMotion?: PageMotionConfig;
  pageTheme?: PageThemeConfig;
} = {}) {
  const t = useTranslations();
  const styles = getChallengesStyles({ layout: config?.layout });
  const sectionMotion = useSectionMotion(pageMotion, config?.motion);
  const headerSubMotion = toWhileInViewBinding(sectionMotion);
  const headerTitleMotion = toWhileInViewBinding(sectionMotion, 1);

  const limit = resolveChallengesLimit(config?.limit);
  const challenges = (initialChallenges ?? PLACEHOLDER_CHALLENGES).slice(0, limit);
  const isList = styles.resolvedLayout === 'list';

  return (
    <SectionThemeWrapper
      as="section"
      id="challenges"
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
              {t('challenges.sub')}
            </motion.p>
            <motion.h2
              initial={headerTitleMotion.initial}
              whileInView={headerTitleMotion.whileInView}
              viewport={headerTitleMotion.viewport}
              transition={headerTitleMotion.transition}
              className={styles.titleClass}
            >
              {t('challenges.titleLine1')} <br className="md:hidden" />
              {t('challenges.titleLine2')}
            </motion.h2>
          </div>
          <Link href="/challenges" className={styles.exploreLinkClass}>
            {t('challenges.viewAll')}{' '}
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        <div className={styles.gridClass}>
          {challenges.length === 0 ? (
            <div className={styles.emptyStateClass}>
              <p className={styles.emptyStateTextClass}>
                {t('challenges.empty') ?? 'No active challenges at the moment'}
              </p>
              <Link href="/challenges" className={styles.emptyActionClass}>
                {t('challenges.viewAll') ?? 'View All Challenges'}
              </Link>
            </div>
          ) : (
            challenges.map((c, i) => {
              const cardMotion = toWhileInViewBinding(sectionMotion, i);
              const isUrgent = (c.daysLeft || 0) <= 3;

              return (
                <motion.div
                  key={c.id}
                  initial={cardMotion.initial}
                  whileInView={cardMotion.whileInView}
                  viewport={cardMotion.viewport}
                  transition={cardMotion.transition}
                  className={styles.cardClass}
                >
                  <div className={styles.emojiCornerClass}>
                    <span className={styles.emojiCornerIconClass}>{c.emoji}</span>
                  </div>

                  {isList ? (
                    <div className={styles.emojiMobileClass}>{c.emoji}</div>
                  ) : null}

                  <div className={styles.cardBodyClass}>
                    <span
                      className={styles.typeBadgeClass}
                      style={{ background: `${c.color}15`, color: c.color }}
                    >
                      {c.type}
                    </span>
                    <h3 className={styles.cardTitleClass}>{c.title}</h3>
                    <p className={styles.cardDescriptionClass}>{c.description}</p>
                  </div>

                  <div className={styles.statsRowClass}>
                    <span className="flex items-center gap-2">
                      <span className="text-base">👥</span>{' '}
                      {(c.participants || 0).toLocaleString()} {t('challenges.joined')}
                    </span>
                    <span className={`flex items-center gap-2 ${isUrgent ? styles.urgentDaysClass : ''}`}>
                      <span className="text-base">⏱️</span> {c.daysLeft || 0} {t('challenges.daysLeft')}
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </SectionThemeWrapper>
  );
}
