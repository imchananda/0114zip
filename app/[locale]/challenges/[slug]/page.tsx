'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { createSupabaseBrowser } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

// ── Share Result Component ────────────────────────────────────
function ShareResult({
  title, score, total, isVote, isDare, slug,
}: {
  title: string;
  score?: number;
  total?: number;
  isVote?: boolean;
  isDare?: boolean;
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
    } else {
      navigator.clipboard.writeText(`${inviteText} ${pageUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="text-center">
      <p className="text-sm font-medium text-[var(--color-text)] mb-3">ชวนเพื่อนมาเล่นด้วยกัน!</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {shareLinks.map((link) => (
          <a
            key={link.id}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 rounded-full text-white transition-transform hover:scale-110 shadow-lg"
            style={{ background: link.bg }}
            title={link.label}
          >
            {link.emoji === '𝕏' ? (
              <span className="font-bold font-body text-[1.1rem]">𝕏</span>
            ) : link.emoji === 'f' ? (
              <span className="font-bold text-[1.1rem] leading-none shrink-0 translate-y-[1px]">f</span>
            ) : (
              <span className="font-semibold text-sm leading-none shrink-0 translate-y-[1px]">L</span>
            )}
          </a>
        ))}
        {/* Copy or Native share toggle fallback */}
        <button
          onClick={handleNativeShare}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] transition-all hover:bg-[#6cbfd0]/10 hover:text-[#6cbfd0] hover:border-[#6cbfd0]/30"
          title="Share or Copy Link"
        >
          {copied ? '✅' : '🔗'}
        </button>
      </div>
      {copied && <p className="text-[#6cbfd0] text-xs mt-2">คัดลอกลิงก์แล้ว!</p>}
    </div>
  );
}

// ── Main Challenge Component ──────────────────────────────────
interface Question {
  id: string;
  question: string;
  options?: string[]; // for quiz
  answer?: number;    // for quiz index
  option?: string;    // for vote
}

interface Challenge {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  type: string;
  questions: Question[];
  reward_points: number;
}

export default function ChallengeDetailPage() {
  const { slug } = useParams() as { slug: string };
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const supabase = createSupabaseBrowser();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [alreadyDone, setAlreadyDone] = useState(false);

  // Quiz state
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState<number[]>([]); 
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Dare state
  const [dareImage, setDareImage] = useState<File | null>(null);
  const [darePreview, setDarePreview] = useState<string | null>(null);

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
      submitEntry(newAnswers, newScore);
    }
  };

  const handleDareImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('ขนาดไฟล์เกิน 2MB กรุณาเลือกไฟล์ที่เล็กกว่านี้');
        return;
      }
      setDareImage(file);
      setDarePreview(URL.createObjectURL(file));
    }
  };

  const handleDareSubmit = async () => {
    if (!challenge || !dareImage) return;

    // Must be logged in to submit dares usually, but we check and show alert
    if (!user) {
      alert("กรุณาสมัครสมาชิกและล็อกอินก่อนส่งรูปทำภารกิจ!");
      router.push('/auth/login');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Upload to dares bucket
      const ext = dareImage.name.split('.').pop();
      const filename = `${user.id}/${Date.now()}.${ext}`;
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('dares')
        .upload(filename, dareImage, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw new Error("Upload failed: " + uploadError.message);

      const { data: { publicUrl } } = supabase.storage.from('dares').getPublicUrl(uploadData.path);

      // 2. Submit Entry
      await submitEntry([{ imageUrl: publicUrl }], challenge.reward_points);
      
    } catch (err: any) {
      alert(err.message);
      setSubmitting(false);
    }
  };

  const submitEntry = async (answers: any, finalScore: number) => {
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
    
    setFinished(true);
    setSubmitting(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
      <div className="text-[var(--color-muted)]">กำลังโหลด...</div>
    </div>
  );

  if (!challenge) return null;

  const isQuiz = challenge.type === 'quiz';
  const isVote = challenge.type === 'vote';
  const isDare = challenge.type === 'dare';
  
  const q = isQuiz || isVote ? challenge.questions[currentQ] : null;
  const totalQ = isQuiz || isVote ? challenge.questions.length : 1;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pt-20 px-4 pb-16">
      <div className="max-w-xl mx-auto">
        {/* Back */}
        <Link href="/challenges" className="inline-flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] mb-6">
          ← กลับ Challenges
        </Link>

        {/* Title */}
        <h1 className="text-xl font-normal font-display text-[var(--color-text-primary)] mb-2">{challenge.title}</h1>
        {challenge.description && (
          <p className="text-sm text-[var(--color-muted)] mb-6">{challenge.description}</p>
        )}

        {/* Already done */}
        {alreadyDone ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8 text-center">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-lg font-semibold text-green-400">คุณทำ Challenge นี้สำเร็จแล้ว!</p>
            <p className="text-sm text-[var(--color-muted)] mt-1">ขอบคุณที่ร่วมสนุกครับ</p>
            <Link href="/challenges">
              <button className="mt-6 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#6cbfd0] to-[#fbdf74] text-[#141413] font-semibold text-sm">
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
            <p className="text-5xl mb-4">{isVote ? '🗳️' : isDare ? '📸' : score === totalQ ? '🏆' : score >= totalQ / 2 ? '🎉' : '💪'}</p>
            
            {isQuiz && (
              <>
                <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#6cbfd0] to-[#fbdf74]">
                  {score}/{totalQ}
                </p>
                <p className="text-[var(--color-muted)] text-sm mt-1">คะแนน</p>
              </>
            )}
            
            {isVote && <p className="text-xl font-bold text-[var(--color-text)]">ขอบคุณที่ร่วมโหวต!</p>}
            
            {isDare && <p className="text-xl font-bold text-green-400">ส่งการบ้านสำเร็จ!</p>}

            {/* Points badge — only for logged-in */}
            {user ? (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#fbdf74]/10 rounded-full border border-[#fbdf74]/20">
                <span className="text-[#fbdf74] font-bold">+{challenge.reward_points}</span>
                <span className="text-sm text-[var(--color-text)]">คะแนนสะสม</span>
              </div>
            ) : (
              /* Guest nudge */
              <div className="mt-4 mx-auto max-w-xs bg-[#6cbfd0]/10 border border-[#6cbfd0]/30 rounded-xl px-4 py-3 text-sm text-center">
                <p className="text-[var(--color-text)] font-medium mb-1">🎁 สมัครสมาชิกฟรีเพื่อรับแต้ม!</p>
                <p className="text-[var(--color-muted)] text-xs mb-2">ผลของคุณยังไม่ได้บันทึก — สมัครแล้วเล่นใหม่เพื่อรับ +{challenge.reward_points} คะแนน</p>
                <Link href="/auth/register">
                  <button className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#6cbfd0] to-[#fbdf74] text-[#141413] font-semibold text-xs">
                    สมัครสมาชิกฟรี
                  </button>
                </Link>
              </div>
            )}

            <div className="flex gap-3 mt-4 justify-center">
              <Link href="/challenges">
                <button className="px-5 py-2.5 rounded-full border border-[var(--color-border)] text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors">
                  Challenge อื่น
                </button>
              </Link>
              {user && (
                <Link href="/profile">
                  <button className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#6cbfd0] to-[#fbdf74] text-[#141413] font-semibold text-sm transition-transform hover:scale-105">
                    ดูโปรไฟล์
                  </button>
                </Link>
              )}
            </div>
          </motion.div>
        ) : (
          /* Playing UI */
          <div>
            {isDare ? (
              /* DARE UI */
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-[#6cbfd0]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">📸</span>
                  </div>
                  <h3 className="text-lg font-medium text-[var(--color-text)]">อัปโหลดภาพภารกิจของคุณ</h3>
                  <p className="text-xs text-[var(--color-muted)] mt-1">ขนาดสูงสุด 2MB ต่อภาพ</p>
                </div>

                <div className="space-y-4">
                  {darePreview ? (
                    <div className="relative rounded-xl overflow-hidden bg-black/40 border border-[var(--color-border)] aspect-video md:aspect-auto md:h-64 flex items-center justify-center">
                      <img src={darePreview} alt="Preview" className="max-w-full max-h-full object-contain" />
                      <button 
                        onClick={() => { setDareImage(null); setDarePreview(null); }}
                        className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-red-500/80 text-white rounded-full transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-[var(--color-border)] rounded-xl hover:bg-white/5 hover:border-namtan-primary transition-colors cursor-pointer p-6 text-center">
                      <span className="text-3xl mb-2">📤</span>
                      <span className="text-sm font-medium text-[var(--color-text)] mb-1">คลิกเพื่ออัปโหลด หรือลากไฟล์มาวาง</span>
                      <span className="text-xs text-[var(--color-muted)]">รองรับ JPG, PNG</span>
                      <input type="file" accept="image/*" onChange={handleDareImageChange} className="hidden" />
                    </label>
                  )}

                  <button
                    onClick={handleDareSubmit}
                    disabled={!dareImage || submitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-namtan-primary to-[#fbdf74] text-[#141413] font-bold text-sm disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {submitting ? 'กำลังส่งข้อมูล...' : 'ส่งผลงาน 🚀'}
                  </button>
                </div>
              </motion.div>
            ) : (
              /* QUIZ / VOTE UI */
              <>
                {totalQ > 1 && (
                  <div className="mb-5">
                    <div className="flex justify-between text-xs text-[var(--color-muted)] mb-1.5">
                      <span>คำถามที่ {currentQ + 1} / {totalQ}</span>
                      <span>{Math.round(((currentQ) / totalQ) * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#6cbfd0] to-[#fbdf74] rounded-full"
                        animate={{ width: `${(currentQ / totalQ) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {q && (
                    <motion.div
                      key={currentQ}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 mb-4">
                        <p className="text-base font-semibold text-[var(--color-text)] leading-relaxed">
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
                              onClick={() => isVote ? submitEntry([{ choice: idx }], 0) : handleSelectOption(idx)}
                              disabled={selected !== null && !isVote}
                              className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm transition-all ${
                                isCorrect
                                  ? 'border-green-400 bg-green-500/15 text-green-300'
                                  : isWrong
                                  ? 'border-red-400 bg-red-500/15 text-red-300'
                                  : isSelected
                                  ? 'border-[#6cbfd0] bg-[#6cbfd0]/15 text-[var(--color-text)]'
                                  : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[#6cbfd0]/50'
                              } disabled:cursor-default shadow-sm`}
                            >
                              <span className="inline-flex items-center gap-3">
                                <span className={`shrink-0 w-7 h-7 rounded-full border flex items-center justify-center text-xs font-medium ${
                                  isSelected || isCorrect || isWrong ? 'border-current' : 'border-[var(--color-border)] text-[var(--color-muted)]'
                                }`}>
                                  {String.fromCharCode(65 + idx)}
                                </span>
                                {text}
                                {isCorrect && <span className="ml-auto text-green-400 text-base font-bold">✓</span>}
                                {isWrong && <span className="ml-auto text-red-400 text-base font-bold">✗</span>}
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
                          className="w-full mt-6 py-3.5 rounded-xl bg-gradient-to-r from-[#6cbfd0] to-[#fbdf74] text-[#141413] font-bold text-sm disabled:opacity-60 shadow-lg shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-transform"
                        >
                          {submitting ? 'กำลังบันทึก...' : currentQ < totalQ - 1 ? 'ข้อถัดไป →' : 'ส่งคำตอบ 🏁'}
                        </motion.button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        )}

        {/* ── Share Bar (always visible) ─────────────────────── */}
        <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
          <ShareResult
            title={challenge.title}
            score={finished && isQuiz ? score : undefined}
            total={isQuiz ? totalQ : undefined}
            isVote={isVote}
            isDare={isDare}
            slug={challenge.slug}
          />
        </div>

      </div>
    </div>
  );
}
