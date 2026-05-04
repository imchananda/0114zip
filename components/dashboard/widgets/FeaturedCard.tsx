import { motion } from 'framer-motion';
import { ContentDbItem, PLATFORM_META, imgSrc } from '../LiveDashboardTypes';

export function FeaturedCard({
  work, label, delay, gridClass,
}: {
  work: ContentDbItem | null;
  label: string;
  delay: number;
  gridClass: string;
}) {
  return (
    <motion.div
      className={`rounded-2xl overflow-hidden relative h-full group border border-theme/40 ${gridClass}`}
      style={{ background: 'var(--color-surface)' }}
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ delay }}
    >
      {work?.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imgSrc(work.image)}
          alt={work.title}
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40 group-hover:opacity-60 transition-opacity duration-700"
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background: work?.image
            ? 'linear-gradient(to top, var(--color-surface) 30%, transparent 100%)'
            : 'transparent',
        }}
      />
      <div className="relative z-10 p-6 flex flex-col h-full">
        <p className="text-[9px] tracking-[0.35em] uppercase text-muted mb-3 font-bold">{label}</p>
        {work ? (
          <div className="flex flex-col justify-between flex-1">
            <div className="mt-auto">
              <div className="font-display text-xl md:text-2xl leading-tight text-primary line-clamp-2">
                {work.title}
              </div>
              <p className="text-[10px] text-muted mt-2 leading-relaxed tracking-wide">
                {work.title_thai && <span className="font-thai">{work.title_thai}</span>}
                {work.title_thai && <br />}
                {work.year}
              </p>
            </div>
            {work.links && work.links.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {work.links.slice(0, 3).map(l => (
                  <a
                    key={l.platform}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[8px] px-2 py-0.5 rounded-full border border-theme/60
                      text-muted hover:text-primary hover:border-accent transition-all uppercase font-bold tracking-tighter"
                  >
                    {PLATFORM_META[l.platform]?.label ?? l.platform}
                  </a>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center opacity-20">
            <p className="text-[10px] text-muted text-center leading-relaxed font-bold uppercase tracking-widest">
              Set in Admin
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
