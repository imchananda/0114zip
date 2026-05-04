'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowser } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { Mascot } from '@/components/mascot/Mascot';

interface Challenge {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: 'quiz' | 'vote' | 'trivia';
  reward_points: number;
  questions: unknown[];
  end_date: string | null;
  cover_image: string | null;
  is_active: boolean;
}

const TYPE_CONFIG = {
  quiz: { label: 'ทายคำถาม', emoji: '🧠', color: '#6cbfd0' },
  vote: { label: 'โหวต', emoji: '🗳️', color: '#fbdf74' },
  trivia: { label: 'ไตรเวีย', emoji: '⭐', color: '#E91E63' },
};

export default function ChallengesPage() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const supabase = createSupabaseBrowser();

  useEffect(() => {
    const fetchData = async () => {
      const { data: challengeData } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (challengeData) setChallenges(challengeData as Challenge[]);

      if (user) {
        const { data: entries } = await supabase
          .from('challenge_entries')
          .select('challenge_id')
          .eq('user_id', user.id);
        if (entries) setCompletedIds(new Set(entries.map((e) => e.challenge_id)));
      }
      setLoading(false);
    };
    fetchData();
  }, [user, supabase]);

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const timeLeft = (endDate: string | null) => {
    if (!endDate) return null;
    const diff = new Date(endDate).getTime() - nowMs;
    if (diff <= 0) return 'หมดเวลา';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `เหลือ ${days} วัน`;
    const hrs = Math.floor(diff / (1000 * 60 * 60));
    return `เหลือ ${hrs} ชม.`;
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pt-20 px-4 pb-16">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-normal font-display text-[var(--color-text-primary)]">🎮 Challenges</h1>
            <p className="text-sm text-[var(--color-muted)] mt-1">ร่วมสนุก สะสมแต้ม รับรางวัล!</p>
          </div>
          <Link href="/" className="text-[var(--color-muted)] text-sm hover:text-[var(--color-text)]">← กลับ</Link>
        </div>

        {/* Login nudge */}
        {!user && (
          <div className="bg-gradient-to-r from-[#6cbfd0]/10 to-[#fbdf74]/10 border border-[#6cbfd0]/30 rounded-xl p-4 mb-6 text-center">
            <p className="text-sm text-[var(--color-muted)]">
              <Link href="/auth/login" className="text-[#6cbfd0] hover:underline font-medium">เข้าสู่ระบบ</Link>
              {' '}เพื่อร่วมสนุกและสะสมแต้ม 🏆
            </p>
          </div>
        )}

        {/* Challenge Cards */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-[var(--color-surface)] rounded-2xl h-40 animate-pulse" />
            ))}
          </div>
        ) : challenges.length === 0 ? (
          <div className="text-center py-16 text-[var(--color-muted)]">
            <Mascot state="sleeping" size={90} showCaption className="mx-auto mb-4" />
            <p className="text-lg font-medium">ยังไม่มีกิจกรรมเปิดอยู่ตอนนี้</p>
            <p className="text-sm mt-1">กลับมาเช็กใหม่เร็วๆ นี้นะครับ!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {challenges.map((ch, i) => {
              const cfg = TYPE_CONFIG[ch.type] || TYPE_CONFIG.quiz;
              const done = completedIds.has(ch.id);
              const remaining = timeLeft(ch.end_date);
              return (
                <motion.div
                  key={ch.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link href={`/challenges/${ch.slug}`}>
                    <div className={`relative bg-[var(--color-surface)] border rounded-2xl p-5 transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                      done
                        ? 'border-green-500/40 opacity-80'
                        : 'border-[var(--color-border)] hover:border-[#6cbfd0]/50'
                    }`}>
                      {/* Badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-medium px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: `${cfg.color}22`, color: cfg.color }}
                          >
                            {cfg.emoji} {cfg.label}
                          </span>
                          {done && (
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-500/20 text-green-400">
                              ✅ เสร็จแล้ว
                            </span>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-lg font-bold text-[#fbdf74]">+{ch.reward_points}</span>
                          <p className="text-[10px] text-[var(--color-muted)]">คะแนน</p>
                        </div>
                      </div>

                      <h2 className="text-base font-normal font-display text-[var(--color-text-primary)] mt-3">{ch.title}</h2>
                      {ch.description && (
                        <p className="text-sm text-[var(--color-muted)] mt-1 line-clamp-2">{ch.description}</p>
                      )}

                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xs text-[var(--color-muted)]">
                          {ch.questions.length > 0 ? `${ch.questions.length} คำถาม/ตัวเลือก` : ''}
                        </span>
                        {remaining && (
                          <span className="text-xs text-orange-400">{remaining}</span>
                        )}
                      </div>

                      {/* Arrow */}
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--color-muted)] opacity-40">
                        →
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
