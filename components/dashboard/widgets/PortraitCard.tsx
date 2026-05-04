import { motion } from 'framer-motion';
import Image from 'next/image';
import { fmtEMV, imgSrc } from '../LiveDashboardTypes';

export function PortraitCard({
  label, labelShort, emv, color, photoUrl, fallbackSrc, mounted, delay, gridClass,
}: {
  label: string; labelShort: string; emv: number; color: string;
  photoUrl?: string | null; fallbackSrc: string;
  mounted: boolean; delay: number; gridClass: string;
}) {
  const src = photoUrl ? imgSrc(photoUrl) : fallbackSrc;

  return (
    <motion.div
      className={`rounded-2xl overflow-hidden relative h-full group ${gridClass}`}
      style={{ background: 'var(--color-bg)' }}
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
    >
      {/* Photo */}
      <Image
        src={src}
        alt={label}
        fill
        sizes="(max-width: 768px) 50vw, 30vw"
        className="object-cover object-top opacity-60 grayscale-[0.3] group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
        priority
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-deep-dark via-deep-dark/20 to-transparent" />
      
      {/* Top accent line */}
      <div className="absolute top-5 left-5">
        <div className="h-0.5 w-8 rounded-full shadow-sm" style={{ background: color }} />
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <p className="text-[9px] tracking-[0.3em] uppercase font-bold mb-1.5 opacity-60" style={{ color }}>
          {labelShort} · Latest EMV
        </p>
        <div className="font-display text-3xl md:text-4xl text-white leading-none tabular-nums font-light">
          {mounted ? fmtEMV(emv) : '฿—'}
        </div>
        <p className="text-[10px] mt-2 tracking-widest text-white/30 uppercase font-medium">{label}</p>
      </div>
    </motion.div>
  );
}
