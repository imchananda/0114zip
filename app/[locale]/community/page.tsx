'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { createSupabaseBrowser } from '@/lib/supabase';
import { Mascot } from '@/components/mascot/Mascot';

interface Post {
  id: string;
  content: string;
  likes: number;
  created_at: string;
  user_id: string;
  users: {
    display_name: string;
    avatar_url: string | null;
    role: string;
  };
  liked_by_me?: boolean;
}

export default function CommunityPage() {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const supabase = createSupabaseBrowser();

  const fetchPosts = useCallback(async () => {
    const { data } = await supabase
      .from('community_posts')
      .select('*, users(display_name, avatar_url, role)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) {
      // Check if current user liked each post
      if (user) {
        const { data: myLikes } = await supabase
          .from('community_likes')
          .select('post_id')
          .eq('user_id', user.id);
        const likedIds = new Set(myLikes?.map((l) => l.post_id));
        setPosts(data.map((p) => ({ ...p, liked_by_me: likedIds.has(p.id) })) as Post[]);
      } else {
        setPosts(data as Post[]);
      }
    }
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handlePost = async () => {
    if (!newPost.trim() || !user) return;
    setPosting(true);
    await supabase.from('community_posts').insert({ user_id: user.id, content: newPost.trim() });
    setNewPost('');
    setPosting(false);
    fetchPosts();
  };

  const handleLike = async (postId: string, liked: boolean) => {
    if (!user) return;
    if (liked) {
      await supabase.from('community_likes').delete().eq('user_id', user.id).eq('post_id', postId);
      await supabase.from('community_posts').update({ likes: Math.max(0, (posts.find(p => p.id === postId)?.likes || 1) - 1) }).eq('id', postId);
    } else {
      await supabase.from('community_likes').insert({ user_id: user.id, post_id: postId });
      await supabase.from('community_posts').update({ likes: (posts.find(p => p.id === postId)?.likes || 0) + 1 }).eq('id', postId);
    }
    fetchPosts();
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('ลบโพสนี้?')) return;
    await supabase.from('community_posts').delete().eq('id', postId);
    fetchPosts();
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'เมื่อสักครู่';
    if (mins < 60) return `${mins} นาทีที่แล้ว`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} ชม.ที่แล้ว`;
    const days = Math.floor(hrs / 24);
    return `${days} วันที่แล้ว`;
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pt-20 px-4">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-medium text-[var(--color-text)]">💬 ชุมชน NamtanFilm</h1>
          <div className="flex items-center gap-4">
            <Link href="/community/leaderboard" className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r from-[#6cbfd0]/20 to-[#fbdf74]/20 text-[#fbdf74] border border-[#fbdf74]/30 hover:scale-105 transition-transform flex items-center gap-1">
              🏆 จัดอันดับแฟนคลับ
            </Link>
            <Link href="/" className="text-[var(--color-muted)] text-sm hover:text-[var(--color-text)]">← กลับ</Link>
          </div>
        </div>

        {/* New post */}
        {user ? (
          <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4 mb-6">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="เขียนอะไรสักนิดให้ NamtanFilm Fam... 💙💛"
              className="w-full bg-transparent text-[var(--color-text)] placeholder:text-[var(--color-muted)] resize-none focus:outline-none min-h-[80px]"
              maxLength={500}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-[var(--color-muted)]">{newPost.length}/500</span>
              <button
                onClick={handlePost}
                disabled={posting || !newPost.trim()}
                className="px-4 py-2 bg-gradient-to-r from-[#6cbfd0] to-[#4a9aab] text-[#141413] rounded-lg text-sm disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                {posting ? '...' : '📤 โพส'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4 mb-6 text-center">
            <p className="text-[var(--color-muted)] text-sm">
              <Link href="/auth/login" className="text-[#6cbfd0] hover:underline">เข้าสู่ระบบ</Link> เพื่อโพสข้อความ
            </p>
          </div>
        )}

        {/* Posts */}
        {loading ? (
          <div className="text-center text-[var(--color-muted)] py-8">กำลังโหลด...</div>
        ) : posts.length === 0 ? (
          <div className="text-center text-[var(--color-muted)] py-8">
            <Mascot state="waving" size={80} showCaption className="mx-auto mb-2" />
            <p>ยังไม่มีโพส — เป็นคนแรกเลย!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4">
                {/* Author */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6cbfd0] to-[#fbdf74] flex items-center justify-center text-[#141413] text-xs font-medium overflow-hidden">
                    {post.users?.avatar_url ? (
                      <img src={post.users.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (post.users?.display_name || '?')[0].toUpperCase()
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-[var(--color-text)]">
                      {post.users?.display_name || 'Anonymous'}
                    </span>
                    {post.users?.role === 'admin' && (
                      <span className="ml-1.5 text-[10px] px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded-full">Admin</span>
                    )}
                    <span className="text-xs text-[var(--color-muted)] ml-2">{timeAgo(post.created_at)}</span>
                  </div>
                </div>

                {/* Content */}
                <p className="text-[var(--color-text)] text-sm whitespace-pre-wrap">{post.content}</p>

                {/* Actions */}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--color-border)]">
                  <button
                    onClick={() => user && handleLike(post.id, !!post.liked_by_me)}
                    className={`flex items-center gap-1 text-sm transition-colors ${
                      post.liked_by_me ? 'text-red-400' : 'text-[var(--color-muted)] hover:text-red-400'
                    } ${!user ? 'opacity-50 cursor-default' : ''}`}
                  >
                    {post.liked_by_me ? '❤️' : '🤍'} {post.likes}
                  </button>

                  {user && post.user_id === user.id && (
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-sm text-[var(--color-muted)] hover:text-red-400 transition-colors ml-auto"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
