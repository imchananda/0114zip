'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { createSupabaseBrowser } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

// ── Share Result Component ────────────────────────────────────
function ShareResult({
  title, score, total, isVote, slug,
}: {
  title: string;
  score?: number;
  total?: number;
  isVote?: boolean;
  slug: string;
}) {
  const [copied, setCopied] = useState(false);

  const pageUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/challenges/${slug}`
    : `/challenges/${slug}`;

  // Always invitation text — share the challenge itself
  const inviteText = `🎮 มาเล่น Challenge "${title}" กับฉันสิ! ทุกคนเล่นได้เลย ไม่ต้องสมัครสมาชิก 💙💛 NamtanFilm`;

  const encodedText = encodeURIComponent(inviteText);
  const encodedUrl  = encodeURIComponent(pageUrl);

  const shareLinks = [
    {
      id: 'share-twitter',
      label: 'X (Twitter)',
      emoji: '𝕏',
      bg: '#000',
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    },
    {
      id: 'share-facebook',
      label: 'Facebook',
      emoji: 'f',
      bg: '#1877F2',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
    },
    {
      id: 'share-line',
      label: 'LINE',
      emoji: 'L',
      bg: '#06C755',
      href: `https://social-plugins.line.me/lineit/share?url=${encodedUrl}&text=${encodedText}`,
    },
  ];

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `NamtanFilm — ${title}`, text: inviteText, url: pageUrl });
      } catch { /* user cancelled */ }
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`${inviteText}\n${pageUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-6">
      <p className="text-xs text-[var(--color-muted)] mb-3">📣 ชวนเพื่อนมาเล่น Challenge นี้!</p>

      {/* Social buttons */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {shareLinks.map((s) => (
          <a
            key={s.id}
            id={s.id}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            title={`แชร์ไปที่ ${s.label}`}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-white text-xs font-bold transition-all hover:scale-105 hover:shadow-lg"
            style={{ backgroundColor: s.bg }}
          >
            <span className="text-sm">{s.emoji}</span>
            {s.label}
          </a>
        ))}

        {/* Native Share (mobile) */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            id="share-native"
            onClick={handleNativeShare}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-purple-600 text-white text-xs font-bold hover:scale-105 transition-all"
          >
            📤 แชร์
          </button>
        )}

        {/* Copy Link */}
        <button
          id="share-copy"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[var(--color-border)] text-[var(--color-muted)] text-xs font-medium hover:border-[#1E88E5]/50 hover:text-[var(--color-text)] transition-all"
        >
          {copied ? '✅ คัดลอกแล้ว!' : '🔗 คัดลอกลิงก์'}
        </button>
      </div>

      {/* Share text preview */}
      <p className="text-xs text-[var(--color-muted)] mt-3 px-4 italic opacity-70 line-clamp-2">
        &ldquo;{inviteText}&rdquo;
      </p>
    </div>
  );
}

interface Question {
  id: string;
  question?: string;
  option?: string;
  options?: string[];
  answer?: number;
  votes?: number;
}

interface Challenge {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: 'quiz' | 'vote' | 'trivia';
  reward_points: number;
  questions: Question[];
}

export default function ChallengePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const supabase = createSupabaseBrowser();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [alreadyDone, setAlreadyDone] = useState(false);

  // Quiz state
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState<number[]>([]); // selected option index per question
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('challenges')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (!data) { router.push('/challenges'); return; }
      setChallenge(data as Challenge);

      if (user) {
        const { data: entry } = await supabase
          .from('challenge_entries')
          .select('id')
          .eq('challenge_id', data.id)
          .eq('user_id', user.id)
          .single();
        if (entry) setAlreadyDone(true);
      }
      setLoading(false);
    };
    load();
  }, [slug, user, supabase, router]);

  const handleSelectOption = (idx: number) => {
    if (selected !== null) return; // already answered
    setSelected(idx);
  };

  const handleNext = () => {
    if (!challenge || selected === null) return;

    const q = challenge.questions[currentQ];
    const newAnswers = [...answered, selected];
    let newScore = score;

    if (challenge.type === 'quiz' && q.answer === selected) {
      newScore++;
      setScore(newScore);
    }

    setAnswered(newAnswers);

    if (currentQ < challenge.questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelected(null);
    } else {
      // Last question — submit
      submitEntry(newAnswers, newScore);
    }
  };

  const submitEntry = async (answers: number[], finalScore: number) => {
    if (!challenge) return;
    setSubmitting(true);

    if (user) {
      // Logged-in: save entry and award points
      await supabase.from('challenge_entries').upsert({
        challenge_id: challenge.id,
        user_id: user.id,
        answers: { answers },
        score: finalScore,
      });

      const { data: profileData } = await supabase
        .from('users')
        .select('points')
        .eq('id', user.id)
        .single();

      if (profileData) {
        const newPoints = (profileData.points || 0) + challenge.reward_points;
        const newLevel = Math.floor(newPoints / 100) + 1;
        await supabase
          .from('users')
          .update({ points: newPoints, level: newLevel })
          .eq('id', user.id);
        await refreshProfile();
      }
    }
    // Guest: just show result without saving

    setFinished(true);
    setSubmitting(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
      <div className="text-[var(--color-muted)]">กำลังโหลด...</div>
    </div>
  );

  if (!challenge) return null;

  const q = challenge.questions[currentQ];
  const totalQ = challenge.questions.length;
  const isQuiz = challenge.type === 'quiz';
  const isVote = challenge.type === 'vote';

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pt-20 px-4 pb-16">
      <div className="max-w-xl mx-auto">
        {/* Back */}
        <Link href="/challenges" className="inline-flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] mb-6">
          ← กลับ Challenges
        </Link>

        {/* Title */}
        <h1 className="text-xl font-bold text-[var(--color-text)] mb-2">{challenge.title}</h1>
        {challenge.description && (
          <p className="text-sm text-[var(--color-muted)] mb-6">{challenge.description}</p>
        )}

        {/* Already done */}
        {alreadyDone ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8 text-center">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-lg font-semibold text-green-400">คุณทำ Challenge นี้ไปแล้ว!</p>
            <p className="text-sm text-[var(--color-muted)] mt-1">ขอบคุณที่ร่วมสนุกครับ</p>
            <Link href="/challenges">
              <button className="mt-6 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#1E88E5] to-[#FDD835] text-gray-900 font-semibold text-sm">
                ไปดู Challenge อื่น
              </button>
            </Link>
          </div>
        ) : finished ? (
          /* Finished Results */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 text-center"
          >
            <p className="text-5xl mb-4">{isVote ? '🗳️' : score === totalQ ? '🏆' : score >= totalQ / 2 ? '🎉' : '💪'}</p>
            {isQuiz && (
              <>
                <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#1E88E5] to-[#FDD835]">
                  {score}/{totalQ}
                </p>
                <p className="text-[var(--color-muted)] text-sm mt-1">คะแนน</p>
              </>
            )}
            {isVote && <p className="text-xl font-bold text-[var(--color-text)]">ขอบคุณที่โหวต!</p>}

            {/* Points badge — only for logged-in */}
            {user ? (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#FDD835]/10 rounded-full">
                <span className="text-[#FDD835] font-bold">+{challenge.reward_points}</span>
                <span className="text-sm text-[var(--color-muted)]">คะแนนสะสม</span>
              </div>
            ) : (
              /* Guest nudge */
              <div className="mt-4 mx-auto max-w-xs bg-[#1E88E5]/10 border border-[#1E88E5]/30 rounded-xl px-4 py-3 text-sm text-center">
                <p className="text-[var(--color-text)] font-medium mb-1">🎁 สมัครสมาชิกฟรีเพื่อรับแต้ม!</p>
                <p className="text-[var(--color-muted)] text-xs mb-2">ผลของคุณยังไม่ได้บันทึก — สมัครแล้วเล่นใหม่เพื่อรับ +{challenge.reward_points} คะแนน</p>
                <Link href="/auth/register">
                  <button className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#1E88E5] to-[#FDD835] text-gray-900 font-semibold text-xs">
                    สมัครสมาชิกฟรี
                  </button>
                </Link>
              </div>
            )}

            <div className="flex gap-3 mt-4 justify-center">
              <Link href="/challenges">
                <button className="px-5 py-2.5 rounded-full border border-[var(--color-border)] text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]">
                  Challenge อื่น
                </button>
              </Link>
              {user && (
                <Link href="/profile">
                  <button className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#1E88E5] to-[#FDD835] text-gray-900 font-semibold text-sm">
                    ดูโปรไฟล์
                  </button>
                </Link>
              )}
            </div>
          </motion.div>
        ) : (
          /* Quiz / Vote playing */
          <div>
            {/* Progress */}
            {totalQ > 1 && (
              <div className="mb-5">
                <div className="flex justify-between text-xs text-[var(--color-muted)] mb-1.5">
                  <span>คำถามที่ {currentQ + 1} / {totalQ}</span>
                  <span>{Math.round(((currentQ) / totalQ) * 100)}%</span>
                </div>
                <div className="h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#1E88E5] to-[#FDD835] rounded-full"
                    animate={{ width: `${(currentQ / totalQ) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQ}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 mb-4">
                  <p className="text-base font-semibold text-[var(--color-text)]">
                    {isVote ? (q.option || q.question) : q.question}
                  </p>
                  {isVote && (
                    <p className="text-xs text-[var(--color-muted)] mt-1">เลือก 1 ตัวเลือก</p>
                  )}
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {(isVote
                    ? challenge.questions.map((vq, idx) => ({ text: vq.option || '', idx }))
                    : (q.options || []).map((opt, idx) => ({ text: opt, idx }))
                  ).map(({ text, idx }) => {
                    const isSelected = selected === idx;
                    const isCorrect = isQuiz && selected !== null && q.answer === idx;
                    const isWrong = isQuiz && isSelected && q.answer !== idx;

                    return (
                      <button
                        key={idx}
                        id={`option-${idx}`}
                        onClick={() => isVote ? submitEntry([idx], 0) : handleSelectOption(idx)}
                        disabled={selected !== null && !isVote}
                        className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm transition-all ${
                          isCorrect
                            ? 'border-green-400 bg-green-500/15 text-green-300'
                            : isWrong
                            ? 'border-red-400 bg-red-500/15 text-red-300'
                            : isSelected
                            ? 'border-[#1E88E5] bg-[#1E88E5]/15 text-[var(--color-text)]'
                            : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[#1E88E5]/50'
                        } disabled:cursor-default`}
                      >
                        <span className="inline-flex items-center gap-2">
                          <span className="shrink-0 w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          {text}
                          {isCorrect && ' ✓'}
                          {isWrong && ' ✗'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Next button for quiz */}
                {isQuiz && selected !== null && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleNext}
                    disabled={submitting}
                    className="w-full mt-5 py-3 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#FDD835] text-gray-900 font-bold text-sm disabled:opacity-60"
                  >
                    {submitting ? 'กำลังบันทึก...' : currentQ < totalQ - 1 ? 'ข้อถัดไป →' : 'ส่งคำตอบ 🏁'}
                  </motion.button>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* ── Share Bar (always visible) ─────────────────────── */}
        <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
          <ShareResult
            title={challenge.title}
            score={finished && isQuiz ? score : undefined}
            total={isQuiz ? totalQ : undefined}
            isVote={isVote}
            slug={challenge.slug}
          />
        </div>

      </div>
    </div>
  );
}
