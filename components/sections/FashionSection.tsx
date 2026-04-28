'use client';

import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { useViewState } from '@/context/ViewStateContext';

const FASHION_ITEMS = [
  { id: 1, label: 'Vogue Thailand Cover', date: 'มี.ค. 2026', artist: 'namtan', tag: 'Magazine' },
  { id: 2, label: 'Louis Vuitton Show', date: 'ก.พ. 2026', artist: 'film', tag: 'Brand Event' },
  { id: 3, label: 'Harper\'s Bazaar Shoot', date: 'ม.ค. 2026', artist: 'both', tag: 'Magazine' },
  { id: 4, label: 'ELLE Style Awards Look', date: 'ธ.ค. 2025', artist: 'namtan', tag: 'Red Carpet' },
  { id: 5, label: 'GQ Thailand Feature', date: 'พ.ย. 2025', artist: 'film', tag: 'Magazine' },
  { id: 6, label: 'Kazz Magazine', date: 'ต.ค. 2025', artist: 'both', tag: 'Magazine' },
];

const ARTIST_COLORS: Record<string, string> = {
  namtan: 'var(--namtan-teal)',
  film: 'var(--film-gold)',
  both: 'var(--namtan-teal)',
};

export function FashionSection() {
  const { state } = useViewState();

  const filtered = FASHION_ITEMS.filter(item => {
    if (state === 'both' || state === 'lunar') return true;
    return item.artist === state || item.artist === 'both';
  });

  return (
    <section id="fashion" className="py-16 md:py-24">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div>
            <h2 className="text-2xl md:text-3xl font-medium text-[var(--color-text)]">
              👗 Fashion & Style
            </h2>
            <p className="text-[var(--color-muted)] text-sm mt-1">
              ชุดและลุคเด่นล่าสุด
            </p>
          </div>
          <Link
            href="/artist/both"
            className="text-sm text-[#6cbfd0] hover:underline hidden sm:block"
          >
            ดูทั้งหมด →
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 flex flex-col gap-2 hover:border-[var(--color-border-hover)] transition-colors"
            >
              <span
                className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full w-fit"
                style={{
                  background: `${ARTIST_COLORS[item.artist]}20`,
                  color: ARTIST_COLORS[item.artist],
                }}
              >
                {item.tag}
              </span>
              <p className="text-sm font-medium text-[var(--color-text-primary)] leading-tight">
                {item.label}
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">{item.date}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
