'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowser } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

interface Challenge {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: string;
  reward_points: number;
  questions: unknown[];
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

export default function AdminChallengesPage() {
  const { profile } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    slug: '',
    title: '',
    description: '',
    type: 'quiz',
    reward_points: 10,
    questions_raw: '[]',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const supabase = createSupabaseBrowser();

  const fetchChallenges = async () => {
    const { data } = await supabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setChallenges(data as Challenge[]);
    setLoading(false);
  };

  useEffect(() => { fetchChallenges(); }, []);

  if (profile?.role !== 'admin' && profile?.role !== 'moderator') {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <p className="text-[var(--color-muted)]">🚫 ไม่มีสิทธิ์เข้าถึงครับ</p>
      </div>
    );
  }

  const handleToggle = async (id: string, current: boolean) => {
    await supabase.from('challenges').update({ is_active: !current }).eq('id', id);
    fetchChallenges();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ลบ Challenge นี้?')) return;
    await supabase.from('challenges').delete().eq('id', id);
    fetchChallenges();
  };

  const handleSave = async () => {
    setError('');
    if (!form.slug || !form.title) { setError('กรุณากรอก Slug และ Title ครับ'); return; }

    let questions;
    try {
      questions = JSON.parse(form.questions_raw);
    } catch {
      setError('JSON ของ Questions ไม่ถูกต้องครับ'); return;
    }

    setSaving(true);
    const { error: err } = await supabase.from('challenges').insert({
      slug: form.slug,
      title: form.title,
      description: form.description,
      type: form.type,
      reward_points: form.reward_points,
      questions,
    });
    setSaving(false);

    if (err) { setError(err.message); return; }
    setShowForm(false);
    setForm({ slug: '', title: '', description: '', type: 'quiz', reward_points: 10, questions_raw: '[]' });
    fetchChallenges();
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pt-20 px-4 pb-16">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">🎮 จัดการ Challenges</h1>
            <p className="text-sm text-[var(--color-muted)] mt-1">สร้าง/แก้ไขกิจกรรมและมินิเกม</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/dashboard" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]">← Dashboard</Link>
            <button
              id="btn-new-challenge"
              onClick={() => setShowForm(!showForm)}
              className="ml-4 px-4 py-2 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#FDD835] text-gray-900 font-semibold text-sm"
            >
              + สร้างใหม่
            </button>
          </div>
        </div>

        {/* Create Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 mb-6"
          >
            <h2 className="font-semibold text-[var(--color-text)] mb-4">สร้าง Challenge ใหม่</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[var(--color-muted)] mb-1 block">Slug (URL)</label>
                  <input
                    id="input-slug"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s/g, '-') })}
                    placeholder="my-quiz-slug"
                    className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--color-muted)] mb-1 block">ประเภท</label>
                  <select
                    id="select-type"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] text-sm"
                  >
                    <option value="quiz">🧠 Quiz</option>
                    <option value="vote">🗳️ Vote</option>
                    <option value="trivia">⭐ Trivia</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-[var(--color-muted)] mb-1 block">หัวข้อ (Title)</label>
                <input
                  id="input-title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="ชื่อ Challenge..."
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--color-muted)] mb-1 block">คำอธิบาย</label>
                <textarea
                  id="input-description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="อธิบายกิจกรรมสักนิด..."
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] text-sm min-h-[60px] resize-none"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--color-muted)] mb-1 block">แต้มรางวัล (Points)</label>
                <input
                  id="input-points"
                  type="number"
                  value={form.reward_points}
                  onChange={(e) => setForm({ ...form, reward_points: parseInt(e.target.value) || 0 })}
                  className="w-32 px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--color-muted)] mb-1 block">
                  Questions (JSON Array){' '}
                  <span className="text-[#1E88E5]">ดูตัวอย่างใน migration SQL ครับ</span>
                </label>
                <textarea
                  id="input-questions"
                  value={form.questions_raw}
                  onChange={(e) => setForm({ ...form, questions_raw: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] text-xs font-mono min-h-[120px] resize-y"
                />
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <div className="flex gap-2 pt-1">
                <button onClick={handleSave} disabled={saving} className="px-5 py-2 rounded-lg bg-[#1E88E5] text-white text-sm font-medium disabled:opacity-50">
                  {saving ? 'บันทึก...' : '💾 บันทึก'}
                </button>
                <button onClick={() => setShowForm(false)} className="px-5 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] text-sm">
                  ยกเลิก
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Challenges Table */}
        {loading ? (
          <div className="text-[var(--color-muted)] text-center py-8">กำลังโหลด...</div>
        ) : challenges.length === 0 ? (
          <div className="text-center py-12 text-[var(--color-muted)]">
            <p className="text-4xl mb-2">🎮</p>
            <p>ยังไม่มี Challenge — กดปุ่ม "สร้างใหม่" ด้านบนได้เลยครับ!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {challenges.map((ch) => (
              <div key={ch.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`w-2 h-2 rounded-full ${ch.is_active ? 'bg-green-400' : 'bg-gray-500'}`} />
                    <p className="text-sm font-medium text-[var(--color-text)] truncate">{ch.title}</p>
                  </div>
                  <p className="text-xs text-[var(--color-muted)]">
                    {ch.type} · {ch.questions.length} คำถาม · +{ch.reward_points} pts · slug: {ch.slug}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/challenges/${ch.slug}`} target="_blank">
                    <button className="text-xs text-[#1E88E5] hover:underline">ดู</button>
                  </Link>
                  <button
                    onClick={() => handleToggle(ch.id, ch.is_active)}
                    className={`text-xs px-2.5 py-1 rounded-lg border ${ch.is_active ? 'border-green-400/50 text-green-400' : 'border-gray-500/50 text-gray-400'}`}
                  >
                    {ch.is_active ? 'เปิด' : 'ปิด'}
                  </button>
                  <button
                    onClick={() => handleDelete(ch.id)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
