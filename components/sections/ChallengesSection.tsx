'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { useViewState } from '@/context/ViewStateContext';

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
  { id: '1', title: 'NamtanFilm Photo Challenge', description: 'โพสต์รูปคู่ #NamtanFilm ลงโซเชียล', type: 'Photo', participants: 1240, daysLeft: 5, color: '#6cbfd0', emoji: '📷' },
  { id: '2', title: 'Thai Drama Trivia', description: 'ทายซีนจากละคร หลินคุณนาย', type: 'Quiz', participants: 876, daysLeft: 2, color: '#fbdf74', emoji: '🎬' },
  { id: '3', title: 'Fan Art Contest', description: 'วาดภาพ Namtan × Film ส่งเข้าประกวด', type: 'Art', participants: 432, daysLeft: 12, color: '#a78bfa', emoji: '🎨' },
];

export function ChallengesSection({ initialChallenges }: { initialChallenges?: Challenge[] } = {}) {
  const { state } = useViewState();
  const [challenges, setChallenges] = useState<Challenge[]>(initialChallenges ?? PLACEHOLDER_CHALLENGES);

  useEffect(() => {
    if (initialChallenges !== undefined) return;
    fetch('/api/admin/challenges?status=active&limit=3')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setChallenges(data);
      })
      .catch(() => {});
  }, []);

  return (
    <section id="challenges" className="py-16 md:py-24">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div>
            <h2 className="text-2xl md:text-3xl font-medium text-[var(--color-text)]">
              🎮 Challenges
            </h2>
            <p className="text-[var(--color-muted)] text-sm mt-1">
              ร่วมสนุกกับกิจกรรมแฟนคลับ
            </p>
          </div>
          <Link href="/challenges" className="text-sm text-[#6cbfd0] hover:underline hidden sm:block">
            ดูทั้งหมด →
          </Link>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {challenges.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 flex flex-col gap-3 hover:border-[var(--color-border-hover)] transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-2xl">{c.emoji}</span>
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ background: `${c.color}20`, color: c.color }}
                >
                  {c.type}
                </span>
              </div>

              <div>
                <p className="font-semibold text-[var(--color-text-primary)] text-sm leading-tight mb-1">
                  {c.title}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                  {c.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] mt-auto pt-3 border-t border-[var(--color-border)]">
                <span>👥 {(c.participants ?? 0).toLocaleString()} คน</span>
                <span style={{ color: (c.daysLeft ?? 0) <= 3 ? '#ef4444' : 'inherit' }}>
                  ⏱ เหลือ {c.daysLeft ?? '?'} วัน
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 sm:hidden text-center">
          <Link href="/challenges" className="text-sm text-[#6cbfd0] hover:underline">
            ดูทั้งหมด →
          </Link>
        </div>
      </div>
    </section>
  );
}
