'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/navigation/Header';

type Platform = 'all' | 'x' | 'ig' | 'tiktok' | 'facebook' | 'youtube' | 'threads' | 'weibo';

interface HashtagSet {
  id: string;
  name: string;
  platform: Platform | 'all';
  tags: string[];
  description: string;
}

const HASHTAG_SETS: HashtagSet[] = [
  {
    id: '1',
    name: 'NamtanFilm General',
    platform: 'all',
    tags: ['#น้ำตาลฟิล์ม', '#NamtanFilm', '#น้ำตาน', '#ฟิล์ม', '#คู่จิ้น', '#NamtanTipnaree', '#FilmRachanun'],
    description: 'ใช้ได้ทุก platform',
  },
  {
    id: '2',
    name: 'X (Twitter)',
    platform: 'x',
    tags: ['#น้ำตาลฟิล์ม', '#NamtanFilm', '#NamtanxFilm', '#GMMTV', '#คู่จิ้นGMMTV'],
    description: 'สำหรับทวิต',
  },
  {
    id: '3',
    name: 'Instagram',
    platform: 'ig',
    tags: ['#namtanfilm', '#น้ำตาลฟิล์ม', '#namtantipnaree', '#filmrachanun', '#gmmtv', '#couplegoals', '#thaidrama'],
    description: 'สำหรับ IG post/stories',
  },
  {
    id: '4',
    name: 'TikTok',
    platform: 'tiktok',
    tags: ['#namtanfilm', '#น้ำตาลฟิล์ม', '#คู่จิ้น', '#gmmtv', '#thaidrama', '#fyp', '#foryou'],
    description: 'สำหรับ TikTok',
  },
  {
    id: '5',
    name: 'Lunar Fandom',
    platform: 'all',
    tags: ['#Lunar', '#LunarFandom', '#ลูน่า', '#น้ำตาลฟิล์มLunar', '#NamtanFilmLunar'],
    description: 'แฮชแท็กแฟนด้อม Lunar',
  },
  {
    id: '6',
    name: 'Weibo / RedNote',
    platform: 'weibo',
    tags: ['#NamtanFilm', '#น้ำตาลฟิล์ม', '#泰剧', '#泰国CP', '#GMMTV'],
    description: 'สำหรับ Weibo / 小红书',
  },
];

const PLATFORM_LABELS: Record<string, { icon: string; label: string; color: string }> = {
  all:      { icon: '🌐', label: 'ทุก Platform', color: '#6B7280' },
  x:        { icon: '𝕏',  label: 'X (Twitter)',  color: '#000000' },
  ig:       { icon: '📷', label: 'Instagram',    color: '#E4405F' },
  tiktok:   { icon: '🎵', label: 'TikTok',       color: '#000000' },
  facebook: { icon: '📘', label: 'Facebook',     color: '#1877F2' },
  youtube:  { icon: '▶️', label: 'YouTube',      color: '#FF0000' },
  threads:  { icon: '🧵', label: 'Threads',      color: '#000000' },
  weibo:    { icon: '🔴', label: 'Weibo',        color: '#DF2029' },
};

export default function HashtagPage() {
  const [filter, setFilter] = useState<Platform | 'all'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = filter === 'all'
    ? HASHTAG_SETS
    : HASHTAG_SETS.filter((s) => s.platform === filter || s.platform === 'all');

  const copyTags = (set: HashtagSet) => {
    navigator.clipboard.writeText(set.tags.join(' '));
    setCopiedId(set.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[var(--color-bg)] pt-24 px-4 pb-12">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-medium text-[var(--color-text)]">📋 Hashtag Hub</h1>
            <Link href="/engage" className="text-[var(--color-muted)] text-sm hover:text-[var(--color-text)]">← Hub</Link>
          </div>

          {/* Filter */}
          <div className="flex gap-2 flex-wrap mb-6">
            {Object.entries(PLATFORM_LABELS).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setFilter(key as Platform)}
                className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                  filter === key
                    ? 'bg-[#1E88E5] text-white'
                    : 'bg-[var(--color-surface)] text-[var(--color-muted)] border border-[var(--color-border)] hover:border-[#1E88E5]/50'
                }`}
              >
                {val.icon} {val.label}
              </button>
            ))}
          </div>

          {/* Hashtag sets */}
          <AnimatePresence mode="popLayout">
            <div className="space-y-4">
              {filtered.map((set) => (
                <motion.div
                  key={set.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span>{PLATFORM_LABELS[set.platform]?.icon}</span>
                      <h3 className="text-sm font-medium text-[var(--color-text)]">{set.name}</h3>
                    </div>
                    <button
                      onClick={() => copyTags(set)}
                      className={`px-3 py-1 rounded-lg text-xs transition-all ${
                        copiedId === set.id
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-[#1E88E5]/10 text-[#1E88E5] hover:bg-[#1E88E5]/20'
                      }`}
                    >
                      {copiedId === set.id ? '✓ Copied!' : '📋 Copy All'}
                    </button>
                  </div>
                  <p className="text-xs text-[var(--color-muted)] mb-3">{set.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {set.tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => { navigator.clipboard.writeText(tag); }}
                        className="px-2.5 py-1 bg-[var(--color-bg)] rounded-full text-xs text-[#1E88E5] hover:bg-[#1E88E5]/10 transition-colors cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
