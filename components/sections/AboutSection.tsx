'use client';

import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import type { HomepageSectionConfig, PageMotionConfig, PageThemeConfig } from '@/lib/homepage-sections';
import { SectionThemeWrapper } from '@/components/ui/SectionThemeWrapper';
import { toWhileInViewBinding, useSectionMotion } from '@/lib/visual';
import { getAboutStyles } from './aboutSection.styles';
import { Link } from '@/i18n/routing';

interface CustomAboutSettings {
  statement_en?: string;
  statement_th?: string;
  description_en?: string;
  description_th?: string;
  bwImage?: string;
  colorImage?: string;
  cardBadge_en?: string;
  cardBadge_th?: string;
  cardTitle_en?: string;
  cardTitle_th?: string;
  cardSub_en?: string;
  cardSub_th?: string;
  cta_en?: string;
  cta_th?: string;
}

export function AboutSection({
  ntWorks = 0,
  flWorks = 0,
  totalAwards = 0,
  config,
  pageMotion,
  pageTheme,
  customSettings,
}: {
  ntWorks?: number;
  flWorks?: number;
  totalAwards?: number;
  config?: Pick<HomepageSectionConfig, 'layout' | 'theme' | 'motion' | 'themeTokens'>;
  pageMotion?: PageMotionConfig;
  pageTheme?: PageThemeConfig;
  customSettings?: CustomAboutSettings;
} = {}) {
  const t = useTranslations();
  const locale = useLocale();
  const styles = getAboutStyles({ layout: config?.layout, theme: config?.theme });
  const sectionMotion = useSectionMotion(pageMotion, config?.motion, { allowCinematic: true });

  // Resolve dynamic database settings with static local i18n overrides
  const statement = locale === 'th'
    ? customSettings?.statement_th || t('about.statement')
    : customSettings?.statement_en || t('about.statement');

  const description = locale === 'th'
    ? customSettings?.description_th || t('about.description')
    : customSettings?.description_en || t('about.description');

  const bwImage = customSettings?.bwImage || '/images/banners/banner_bw.png';
  const colorImage = customSettings?.colorImage || '/images/banners/banner.png';

  const cardBadge = locale === 'th'
    ? customSettings?.cardBadge_th || t('about.card_badge')
    : customSettings?.cardBadge_en || t('about.card_badge');

  const cardTitle = locale === 'th'
    ? customSettings?.cardTitle_th || t('about.card_title')
    : customSettings?.cardTitle_en || t('about.card_title');

  const cardSub = locale === 'th'
    ? customSettings?.cardSub_th || t('about.card_sub')
    : customSettings?.cardSub_en || t('about.card_sub');

  const cardCta = locale === 'th'
    ? customSettings?.cta_th || t('about.cta')
    : customSettings?.cta_en || t('about.cta');

  // Motion bindings for staggered entrances
  const mastheadLeftMotion = toWhileInViewBinding(sectionMotion, 0);
  const statementMotion = toWhileInViewBinding(sectionMotion, 1);
  const descMotion = toWhileInViewBinding(sectionMotion, 2);
  const bwImageMotion = toWhileInViewBinding(sectionMotion, 3);
  const cardMotion = toWhileInViewBinding(sectionMotion, 5);


  const stats = [
    { 
      labelKey: 'about.worksCount', 
      value: (ntWorks + flWorks) || '20+', 
      descKey: 'about.stats_works_desc' 
    },
    { 
      labelKey: 'about.awards', 
      value: totalAwards || '15+', 
      descKey: 'about.stats_awards_desc' 
    },
    { 
      labelKey: 'about.fans', 
      value: '1.2M+', 
      descKey: 'about.stats_fans_desc' 
    },
  ];

  return (
    <SectionThemeWrapper
      as="section"
      id="about"
      className={styles.sectionClass}
      pageTheme={pageTheme}
      sectionTheme={config?.themeTokens}
    >
      {/* Editorial Watermark Backdrop */}
      <div className={styles.bgDecorationClass}>LUNA</div>

      <div className={styles.containerClass}>
        
        {/* ── 1. Top Masthead Statement ────────────────────────────── */}
        <div className={styles.mastheadRowClass}>
          
          <motion.div
            initial={mastheadLeftMotion.initial}
            whileInView={mastheadLeftMotion.whileInView}
            viewport={mastheadLeftMotion.viewport}
            transition={mastheadLeftMotion.transition}
            className={styles.mastheadLeftClass}
          >
            <span className={styles.mastheadLabelClass}>{t('about.masthead_label')}</span>
            <span className={styles.mastheadSubClass}>{t('about.masthead_sub')}</span>
          </motion.div>

          <motion.h2
            initial={statementMotion.initial}
            whileInView={statementMotion.whileInView}
            viewport={statementMotion.viewport}
            transition={statementMotion.transition}
            className={styles.statementClass}
          >
            <span className={styles.statementQuoteMarkClass}>“</span>
            {statement}
          </motion.h2>

        </div>

        {/* ── 2. Asymmetric 3-Column Content Grid ───────────────────── */}
        <div className={styles.asymmetricGridClass}>
          
          {/* Column A: Description & Massive Landscape B&W Image */}
          <div className={styles.leftColClass}>
            
            <motion.p
              initial={descMotion.initial}
              whileInView={descMotion.whileInView}
              viewport={descMotion.viewport}
              transition={descMotion.transition}
              className={styles.descriptionClass}
            >
              {description}
            </motion.p>

            <motion.div
              initial={bwImageMotion.initial}
              whileInView={bwImageMotion.whileInView}
              viewport={bwImageMotion.viewport}
              transition={bwImageMotion.transition}
              className={styles.bwImageWrapClass}
            >
              <Image
                src={bwImage}
                alt="NamtanFilm Classic Portrait"
                fill
                priority
                quality={90}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className={styles.bwImageClass}
              />
            </motion.div>

          </div>

          {/* Column B: Infographic Testimonial Stats Stack */}
          <div className={styles.centerColClass}>
            {stats.map((stat, index) => {
              const itemMotion = toWhileInViewBinding(sectionMotion, 4 + index * 0.15);
              return (
                <motion.div
                  key={stat.labelKey}
                  initial={itemMotion.initial}
                  whileInView={itemMotion.whileInView}
                  viewport={itemMotion.viewport}
                  transition={itemMotion.transition}
                  className={styles.statItemClass}
                >
                  <span className={styles.statValueClass}>{stat.value}</span>
                  <span className={styles.statLabelClass}>{t(stat.labelKey)}</span>
                  <span className={styles.statDescClass}>{t(stat.descKey)}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Column C: Floating Boutique Visual Card & CTA */}
          <div className={styles.rightColClass}>
            
            <motion.div
              initial={cardMotion.initial}
              whileInView={cardMotion.whileInView}
              viewport={cardMotion.viewport}
              transition={cardMotion.transition}
              className="w-full flex flex-col items-end"
            >
              <Link href="/works" className={styles.boutiqueCardClass}>
                
                {/* Badge status bubble */}
                <div className={styles.cardBadgeClass}>
                  <span className={styles.cardBadgeDotClass} />
                  <span>{cardBadge}</span>
                </div>

                {/* Color couple fashion shot */}
                <div className={styles.cardImageWrapClass}>
                  <Image
                    src={colorImage}
                    alt="NamtanFilm Color Visual"
                    fill
                    quality={90}
                    sizes="(max-width: 768px) 100vw, 30vw"
                    className={styles.cardImageClass}
                  />
                </div>

                {/* Card footer description and circular arrow button */}
                <div className={styles.cardFooterClass}>
                  <div className={styles.cardFooterTextClass}>
                    <h3 className={styles.cardTitleClass}>{cardTitle}</h3>
                    <p className={styles.cardSubClass}>{cardSub}</p>
                  </div>
                  <div className={styles.circleBtnClass}>
                    <ArrowUpRight className="w-5 h-5 shrink-0" />
                  </div>
                </div>

              </Link>
              
              {/* Secondary underlined link below the card */}
              <Link href="/works" className={styles.underlinedCtaClass}>
                {cardCta} ↗
              </Link>

            </motion.div>

          </div>

        </div>

      </div>
    </SectionThemeWrapper>
  );
}
