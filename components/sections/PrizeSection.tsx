'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { useViewState } from '@/context/ViewStateContext';

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
  { id: '1', title: 'Grand Meet & Greet', description: 'ได้พบ Namtan & Film ตัวต่อตัว', value: '2 รางวัล', deadline: '30 เม.ย. 2026', status: 'open', emoji: '🎤' },
  { id: '2', title: 'Signed Photobook', description: 'โฟโต้บุ๊คลายเซ็นต์จริงจาก Namtan', value: '5 รางวัล', deadline: '20 เม.ย. 2026', status: 'open', emoji: '📗' },
  { id: '3', title: 'VIP Concert Tickets', description: 'บัตรคอนเสิร์ต VIP ชั้น 1 จำนวน 2 ที่นั่ง', value: '3 รางวัล', deadline: '15 เม.ย. 2026', status: 'open', emoji: '🎫' },
];

const STATUS_STYLE: Record<string, { label: string; bg: string; text: string }> = {
  open:       { label: 'เปิดรับ', bg: 'bg-green-500/10', text: 'text-green-500' },
  closed:     { label: 'ปิดรับ', bg: 'bg-red-500/10', text: 'text-red-400' },
  announced:  { label: 'ประกาศผล', bg: 'bg-[#fbdf74]/10', text: 'text-[#fbdf74]' },
};

export function PrizeSection() {
  const { state } = useViewState();
  const [prizes, setPrizes] = useState<Prize[]>(PLACEHOLDER_PRIZES);

  useEffect(() => {
    fetch('/api/admin/prizes?status=open&limit=3')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setPrizes(data);
      })
      .catch(() => {});
  }, []);

  return (
    <section id="prizes" className="py-16 md:py-24">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div>
            <h2 className="text-2xl md:text-3xl font-medium text-[var(--color-text)]">
              🎁 Prizes &amp; Giveaways
            </h2>
            <p className="text-[var(--color-muted)] text-sm mt-1">
              ของรางวัลพิเศษสำหรับแฟนคลับ
            </p>
          </div>
          <Link href="/engage/prizes" className="text-sm text-[#fbdf74] hover:underline hidden sm:block">
            ดูทั้งหมด →
          </Link>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {prizes.map((prize, i) => {
            const style = STATUS_STYLE[prize.status] ?? STATUS_STYLE.open;
            return (
              <motion.div
                key={prize.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 flex flex-col gap-3 hover:border-[var(--color-border-hover)] transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-3xl">{prize.emoji}</span>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                    {style.label}
                  </span>
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-[var(--color-text-primary)] text-sm leading-tight mb-1">
                    {prize.title}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                    {prize.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] pt-3 border-t border-[var(--color-border)]">
                  <span>🎁 {prize.value}</span>
                  <span>⏰ {prize.deadline}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 sm:hidden text-center">
          <Link href="/engage/prizes" className="text-sm text-[#fbdf74] hover:underline">
            ดูทั้งหมด →
          </Link>
        </div>
      </div>
    </section>
  );
}
