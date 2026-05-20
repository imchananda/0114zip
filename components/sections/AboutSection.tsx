'use client';

/**
 * Phase 6 — cross-layer section (pattern from Profile/Awards pilots):
 *   • Visual: getAboutStyles (aboutSection.styles.ts)
 *   • Motion: useSectionMotion + toWhileInViewBinding
 *   • Theme: SectionThemeWrapper → CSS vars
 */
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { actors } from '@/data/actors';
import type { HomepageSectionConfig, PageMotionConfig, PageThemeConfig } from '@/lib/homepage-sections';
import { SectionThemeWrapper } from '@/components/ui/SectionThemeWrapper';
import { toWhileInViewBinding, useSectionMotion } from '@/lib/visual';
import { getAboutStyles } from './aboutSection.styles';

export function AboutSection({
  ntWorks = 0,
  flWorks = 0,
  totalAwards = 0,
  config,
  pageMotion,
  pageTheme,
}: {
  ntWorks?: number;
  flWorks?: number;
  totalAwards?: number;
  config?: Pick<HomepageSectionConfig, 'layout' | 'theme' | 'motion' | 'themeTokens'>;
  pageMotion?: PageMotionConfig;
  pageTheme?: PageThemeConfig;
} = {}) {
  const t = useTranslations();
  const styles = getAboutStyles({ layout: config?.layout, theme: config?.theme });
  const sectionMotion = useSectionMotion(pageMotion, config?.motion, { allowCinematic: true });
  const headerMotion = toWhileInViewBinding(sectionMotion);
  const coupleCardMotion = toWhileInViewBinding(sectionMotion, 1);
  const namtanCardMotion = toWhileInViewBinding(sectionMotion, 4);
  const filmCardMotion = toWhileInViewBinding(sectionMotion, 5);
  const disclaimerMotion = toWhileInViewBinding(sectionMotion, 6);

  const stats = [
    { labelKey: 'about.worksCount', value: (ntWorks + flWorks) || '20+', icon: '🎬' },
    { labelKey: 'about.awards', value: totalAwards || '15+', icon: '🏆' },
    { labelKey: 'about.fans', value: '1.2M+', icon: '💕' },
  ];

  return (
    <SectionThemeWrapper
      as="section"
      id="about"
      className={styles.sectionClass}
      pageTheme={pageTheme}
      sectionTheme={config?.themeTokens}
    >
      <div className={styles.bgDecorationClass}>LUNA</div>

      <div className={styles.containerClass}>
        <motion.div
          initial={headerMotion.initial}
          whileInView={headerMotion.whileInView}
          viewport={headerMotion.viewport}
          transition={headerMotion.transition}
          className={styles.headerWrapClass}
        >
          <p className={styles.sublineClass}>{t('about.sub')}</p>
          <h2 className={styles.titleClass}>{t('about.title')}</h2>
        </motion.div>

        <div className={styles.contentWrapClass}>
          {styles.showCoupleCard && (
            <motion.div
              initial={coupleCardMotion.initial}
              whileInView={coupleCardMotion.whileInView}
              viewport={coupleCardMotion.viewport}
              transition={coupleCardMotion.transition}
              className={styles.coupleCardClass}
            >
              <div className={styles.coupleGradientClass}>
                <div className="absolute top-0 left-0 w-full h-full bg-nf-gradient" />
              </div>

              <div className="relative z-10">
                <h3 className={styles.coupleTitleClass}>
                  Namtan <span className="nf-gradient-text opacity-70">×</span> Film
                </h3>
                <p className={styles.coupleSubtitleClass}>{t('about.couple')}</p>

                <div className={styles.statsGridClass}>
                  {stats.map((stat, index) => {
                    const statMotion = toWhileInViewBinding(sectionMotion, 2 + index);
                    return (
                      <motion.div
                        key={stat.labelKey}
                        initial={statMotion.initial}
                        whileInView={statMotion.whileInView}
                        viewport={statMotion.viewport}
                        transition={statMotion.transition}
                        className={styles.statItemClass}
                      >
                        <div className={styles.statIconClass}>{stat.icon}</div>
                        <div className={styles.statValueClass}>{stat.value}</div>
                        <div className={styles.statLabelClass}>{t(stat.labelKey)}</div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className={styles.quoteWrapClass}>
                  <div className={`${styles.quoteMarkClass} ${styles.quoteMarkLeftClass}`}>“</div>
                  <p className={styles.descriptionClass}>{t('about.description')}</p>
                  <div className={`${styles.quoteMarkClass} ${styles.quoteMarkRightClass}`}>“</div>
                </div>
              </div>
            </motion.div>
          )}

          {styles.showActorCards && (
            <div className={styles.actorGridClass}>
              <motion.div
                initial={namtanCardMotion.initial}
                whileInView={namtanCardMotion.whileInView}
                viewport={namtanCardMotion.viewport}
                transition={namtanCardMotion.transition}
                className={styles.actorCardClass()}
              >
                <div className={styles.actorTopBarClass('namtan')} />
                <div className={styles.actorHeaderRowClass}>
                  <div className={styles.actorAvatarClass('namtan')}>🦋</div>
                  <div>
                    <h4 className={styles.actorNameClass('namtan')}>{actors.namtan.nickname}</h4>
                    <p className={styles.actorNameThClass}>{actors.namtan.nameThai}</p>
                  </div>
                </div>
                <p className={styles.actorTaglineClass('namtan')}>{actors.namtan.taglineThai}</p>
                {actors.namtan.social && (
                  <div className={styles.socialLinksClass}>
                    {actors.namtan.social.instagram && (
                      <a
                        href={`https://instagram.com/${actors.namtan.social.instagram}`}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.socialLinkClass('namtan')}
                      >
                        Instagram
                      </a>
                    )}
                    {actors.namtan.social.twitter && (
                      <a
                        href={`https://x.com/${actors.namtan.social.twitter}`}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.socialLinkClass('namtan')}
                      >
                        X (Twitter)
                      </a>
                    )}
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={filmCardMotion.initial}
                whileInView={filmCardMotion.whileInView}
                viewport={filmCardMotion.viewport}
                transition={filmCardMotion.transition}
                className={styles.actorCardClass()}
              >
                <div className={styles.actorTopBarClass('film')} />
                <div className={styles.actorHeaderRowClass}>
                  <div className={styles.actorAvatarClass('film')}>✨</div>
                  <div>
                    <h4 className={styles.actorNameClass('film')}>{actors.film.nickname}</h4>
                    <p className={styles.actorNameThClass}>{actors.film.nameThai}</p>
                  </div>
                </div>
                <p className={styles.actorTaglineClass('film')}>{actors.film.taglineThai}</p>
                {actors.film.social && (
                  <div className={styles.socialLinksClass}>
                    {actors.film.social.instagram && (
                      <a
                        href={`https://instagram.com/${actors.film.social.instagram}`}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.socialLinkClass('film')}
                      >
                        Instagram
                      </a>
                    )}
                    {actors.film.social.twitter && (
                      <a
                        href={`https://x.com/${actors.film.social.twitter}`}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.socialLinkClass('film')}
                      >
                        X (Twitter)
                      </a>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          )}

          <motion.div
            initial={disclaimerMotion.initial}
            whileInView={disclaimerMotion.whileInView}
            viewport={disclaimerMotion.viewport}
            transition={disclaimerMotion.transition}
            className={styles.disclaimerWrapClass}
          >
            <div className={styles.disclaimerBoxClass}>
              <p className={styles.disclaimerTextClass}>{t('about.disclaimer')}</p>
              <p className={styles.imageRightsClass}>{t('about.imageRights')}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </SectionThemeWrapper>
  );
}
