import { Suspense } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { Trophy, Medal, Star, Shield, ArrowLeft } from 'lucide-react';
import { Header } from '@/components/navigation/Header';

// Use service role for fetching users ranking since `public.users` might be read-only to public but we want to ensure full list
// Actually, `Public read users` RLS exists, so public anon key is fine!
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Next.js Revalidate settings
export const revalidate = 60; // Cache for 60 seconds

async function fetchLeaderboard() {
  const { data, error } = await supabase
    .from('users')
    .select('id, display_name, username, avatar_url, points, level, badges, role')
    .order('points', { ascending: false })
    .limit(50); // Get top 50

  if (error) {
    console.error('Leaderboard fetch error:', error);
    return [];
  }
  return data;
}

export default async function LeaderboardPage() {
  const users = await fetchLeaderboard();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[var(--color-bg)] pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          
          {/* Header */}
          <div className="mb-8 text-center">
            <Link href="/community" className="inline-flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-[#6cbfd0] transition-colors mb-4 border border-white/10 px-4 py-1.5 rounded-full bg-white/5">
              <ArrowLeft className="w-4 h-4" /> กลับสู่ Community
            </Link>
            <h1 className="text-4xl md:text-5xl font-light text-[var(--color-text)] mb-3 flex items-center justify-center gap-3">
              <Trophy className="w-10 h-10 text-[#fbdf74]" />
              กระดานผู้นำ <span className="font-bold bg-gradient-to-r from-[#6cbfd0] to-[#fbdf74] bg-clip-text text-transparent">Top Fans</span>
            </h1>
            <p className="text-[var(--color-muted)] text-sm">ใครคือสุดยอดแฟนพันธุ์แท้? สะสมคะแนนจากควิซและการทำภารกิจ!</p>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl overflow-hidden shadow-2xl">
            {/* Top 3 Podium (Optional extra feature, but basic list is fine too) */}
            
            {/* List */}
            <div className="divide-y divide-[var(--color-border)]">
              {users.length === 0 ? (
                <div className="p-12 text-center text-[var(--color-muted)]">ยับไมมีข้อมูลการจัดอันดับ</div>
              ) : (
                users.map((user, idx) => {
                  const isTop3 = idx < 3;
                  return (
                    <div 
                      key={user.id} 
                      className={`flex items-center gap-4 p-4 md:p-6 transition-colors hover:bg-white/5 ${
                        idx === 0 ? 'bg-gradient-to-r from-[#fbdf74]/10 to-transparent' :
                        idx === 1 ? 'bg-gradient-to-r from-gray-400/10 to-transparent' :
                        idx === 2 ? 'bg-gradient-to-r from-amber-700/10 to-transparent' : ''
                      }`}
                    >
                      {/* Rank Number */}
                      <div className="w-12 text-center flex-shrink-0">
                        {idx === 0 ? <span className="text-3xl">🥇</span> :
                         idx === 1 ? <span className="text-3xl">🥈</span> :
                         idx === 2 ? <span className="text-3xl">🥉</span> :
                         <span className="text-xl font-bold text-[var(--color-muted)]">{idx + 1}</span>}
                      </div>

                      {/* Avatar */}
                      <div className="relative">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.display_name} className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover border-2 border-[var(--color-border)]" />
                        ) : (
                          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#6cbfd0]/20 flex items-center justify-center text-xl font-bold text-[#6cbfd0] border-2 border-[var(--color-border)]">
                            {user.display_name?.[0]?.toUpperCase() || '?'}
                          </div>
                        )}
                        {/* Role badge if admin */}
                        {['admin', 'moderator'].includes(user.role) && (
                          <div className="absolute -bottom-1 -right-1 bg-neutral-900 border border-[#6cbfd0] text-[#6cbfd0] rounded-full p-1" title={user.role}>
                            <Shield className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base md:text-lg font-bold text-[var(--color-text)] truncate">
                          {user.display_name}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-[var(--color-muted)] mt-1">
                          <span className="text-[#6cbfd0] font-medium bg-[#6cbfd0]/10 px-2 py-0.5 rounded-full border border-[#6cbfd0]/20">
                            Lv. {user.level || 1}
                          </span>
                          {user.username && <span className="truncate hidden sm:inline">@{user.username}</span>}
                        </div>
                      </div>

                      {/* Points */}
                      <div className="text-right flex-shrink-0">
                        <div className="text-xl md:text-2xl font-black text-[#fbdf74]">
                          {user.points || 0}
                        </div>
                        <div className="text-[10px] uppercase tracking-widest text-[var(--color-muted)]">Points</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            {/* Footer limit */}
            <div className="bg-black/20 p-4 text-center text-xs text-[var(--color-muted)] border-t border-[var(--color-border)]">
              แสดงผลเฉพาะ 50 อันดับแรก
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
