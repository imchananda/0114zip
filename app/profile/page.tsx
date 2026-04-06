'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { createSupabaseBrowser } from '@/lib/supabase';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
  
  // Form state
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bio, setBio] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const supabase = createSupabaseBrowser();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="text-center">
          <p className="text-[var(--color-muted)] mb-4">กรุณาเข้าสู่ระบบก่อน</p>
          <Link href="/auth/login" className="text-[#1E88E5] hover:underline">เข้าสู่ระบบ</Link>
        </div>
      </div>
    );
  }

  // Handle Init settings tab
  const handleOpenSettings = () => {
    setDisplayName(profile?.display_name || '');
    setBio(profile?.bio || '');
    setPassword('');
    setConfirmPassword('');
    setAvatarFile(null);
    setMessage('');
    setActiveTab('settings');
  };

  const uploadImage = async (file: File, path: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${path}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading image: ', uploadError);
      return null;
    }

    const { data } = supabase.storage.from('profiles').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setMessage('');
    let errorOccurred = false;

    // 1. Password
    if (password) {
      if (password.length < 6) {
        setMessage('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
        setSaving(false);
        return;
      }
      if (password !== confirmPassword) {
        setMessage('รหัสผ่านไม่ตรงกัน');
        setSaving(false);
        return;
      }
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setMessage(`อัปเดตรหัสผ่านล้มเหลว: ${error.message}`);
        errorOccurred = true;
      }
    }

    if (!errorOccurred) {
      const dbUpdates: Record<string, any> = { display_name: displayName, bio: bio };

      // 2. Avatar Upload
      if (avatarFile) {
        const url = await uploadImage(avatarFile, 'avatar');
        if (url) dbUpdates.avatar_url = url;
        else errorOccurred = true;
      }

      // Update Public Profile
      if (!errorOccurred) {
        const { error: dbError } = await supabase
          .from('users')
          .update(dbUpdates)
          .eq('id', user.id);

        if (dbError) {
          setMessage(`อัปเดตข้อมูลล้มเหลว: ${dbError.message}`);
        } else {
          setMessage('บันทึกการตั้งค่าเรียบร้อยแล้ว');
          await refreshProfile();
          setTimeout(() => setActiveTab('profile'), 1500);
        }
      } else if (!message) {
        setMessage('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
      }
    }
    
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pt-20 px-4 pb-12">
      <div className="max-w-xl mx-auto">
        <Link href="/" className="text-[var(--color-muted)] text-sm hover:text-[var(--color-text)] transition-colors inline-block mb-6">
          ← กลับหน้าหลัก
        </Link>

        {/* Tabs */}
        <div className="flex border-b border-[var(--color-border)] mb-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'profile' ? 'border-[#1E88E5] text-[#1E88E5]' : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            👤 โปรไฟล์ส่วนตัว
          </button>
          <button
            onClick={handleOpenSettings}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'settings' ? 'border-[#1E88E5] text-[#1E88E5]' : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            ⚙️ ตั้งค่า
          </button>
        </div>

        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
          
          {/* ====== PROFILE TAB ====== */}
          {activeTab === 'profile' && (
            <div>
              {/* Banner */}
              <div className="h-28 bg-gradient-to-r from-[#1E88E5] to-[#FDD835]" />

              {/* Avatar */}
              <div className="px-8 -mt-12 flex justify-between items-end">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1E88E5] to-[#FDD835] flex items-center justify-center text-white text-3xl font-medium border-4 border-[var(--color-surface)] shadow-lg overflow-hidden z-10 shrink-0">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (profile?.display_name || '?')[0].toUpperCase()
                  )}
                </div>
                <button onClick={handleOpenSettings} className="mb-2 px-4 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-full text-xs font-medium hover:bg-neutral-800 transition-colors">
                  แก้ไขโปรไฟล์
                </button>
              </div>

              {/* Info */}
              <div className="px-8 pt-4 pb-8">
                <h1 className="text-2xl font-bold text-[var(--color-text)]">
                  {profile?.display_name || 'User'}
                </h1>
                <p className="text-sm text-[var(--color-muted)] mt-1">{user.email}</p>

                {/* Role badge */}
                {(profile?.role === 'admin' || profile?.role === 'moderator') && (
                  <div className="mt-3">
                    {profile.role === 'admin' ? (
                      <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-xs font-medium">
                        👑 Admin
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
                        🛡️ Moderator
                      </span>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-8">
                  <div className="text-center p-4 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
                    <div className="text-2xl font-light text-[#FDD835]">⭐ {profile?.points || 0}</div>
                    <div className="text-xs text-[var(--color-muted)] mt-1 font-medium uppercase tracking-wider">Points</div>
                  </div>
                  <div className="text-center p-4 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
                    <div className="text-2xl font-light text-[#1E88E5]">Lv.{profile?.level || 1}</div>
                    <div className="text-xs text-[var(--color-muted)] mt-1 font-medium uppercase tracking-wider">Level</div>
                  </div>
                  <div className="text-center p-4 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
                    <div className="text-2xl font-light text-[var(--color-text)]">{profile?.badges?.length || 0}</div>
                    <div className="text-xs text-[var(--color-muted)] mt-1 font-medium uppercase tracking-wider">Badges</div>
                  </div>
                </div>

                {/* Badges */}
                {profile?.badges && profile.badges.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-sm font-medium text-[var(--color-muted)] mb-3">🏅 Badges</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.badges.map((b) => (
                        <span key={b} className="px-4 py-1.5 bg-[#1E88E5]/10 border border-[#1E88E5]/20 rounded-full text-sm font-medium text-[#64B5F6]">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bio / Signature Card */}
                {profile?.bio && (
                  <div className="mt-8">
                    <h3 className="text-sm font-medium text-[var(--color-muted)] mb-3">🎫 การ์ดลายเซ็น (Bio)</h3>
                    <div className="rounded-xl p-5 border border-[var(--color-border)] shadow-sm bg-[var(--color-bg)]">
                      <p className="whitespace-pre-wrap text-[var(--color-text)] text-sm leading-relaxed font-light font-handwriting">
                        {profile.bio}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ====== SETTINGS TAB ====== */}
          {activeTab === 'settings' && (
            <div className="p-8">
              <h2 className="text-xl font-medium mb-6">⚙️ ตั้งค่าโปรไฟล์</h2>

              {message && (
                <div className={`p-4 mb-6 rounded-lg text-sm ${message.includes('เรียบร้อย') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {message}
                </div>
              )}

              <div className="space-y-6">
                {/* Display Name */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-muted)] mb-2">ชื่อแสดงผล</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] focus:outline-none focus:border-[#1E88E5] transition-colors"
                  />
                </div>

                <hr className="border-[var(--color-border)]" />

                {/* Avatar */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-muted)] mb-3">รูปภาพโปรไฟล์ (Avatar)</label>
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-neutral-800 border-2 border-[var(--color-border)] flex items-center justify-center overflow-hidden shrink-0">
                      {avatarFile ? (
                        <img src={URL.createObjectURL(avatarFile)} alt="" className="w-full h-full object-cover" />
                      ) : profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl text-neutral-500">👤</span>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        ref={avatarInputRef}
                        onChange={(e) => e.target.files && setAvatarFile(e.target.files[0])}
                        className="hidden"
                      />
                      <button
                        onClick={() => avatarInputRef.current?.click()}
                        className="px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm hover:bg-neutral-800 transition-colors"
                      >
                        อัปโหลดรูปภาพ
                      </button>
                      <p className="text-xs text-neutral-500 mt-2">แนะนำขนาด 400x400 px, ไฟล์ .jpg หรือ .png</p>
                    </div>
                  </div>
                </div>

                <hr className="border-[var(--color-border)]" />

                {/* Bio / Signature Card */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-muted)] mb-3">การ์ดลายเซ็น (ประวัติย่อ / ข้อความประจำตัว)</label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="พิมพ์ข้อความแนะนำตัว หรือลายเซ็นของคุณที่นี่..."
                    className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] focus:outline-none focus:border-[#1E88E5] transition-colors resize-none"
                  />
                </div>

                <hr className="border-[var(--color-border)]" />

                {/* Password update */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-muted)] mb-2">เปลี่ยนรหัสผ่าน (เว้นว่างไว้ถ้าไม่ต้องการเปลี่ยน)</label>
                  <div className="space-y-3">
                    <input
                      type="password"
                      placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] focus:outline-none focus:border-red-500 transition-colors"
                    />
                    {password.length > 0 && (
                      <input
                        type="password"
                        placeholder="ยืนยันรหัสผ่านใหม่"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full px-4 py-3 bg-[var(--color-bg)] border rounded-xl text-[var(--color-text)] focus:outline-none transition-colors ${
                          confirmPassword && password !== confirmPassword ? 'border-red-500' : 'border-[var(--color-border)] focus:border-red-500'
                        }`}
                      />
                    )}
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4">
                  <button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="w-full py-4 bg-[#1E88E5] text-white rounded-xl font-medium shadow-lg shadow-[#1E88E5]/20 hover:bg-[#1565C0] focus:outline-none focus:ring-2 focus:ring-[#1E88E5] disabled:opacity-50 transition-all flex justify-center items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        กำลังบันทึก...
                      </>
                    ) : (
                      'บันทึกการตั้งค่า'
                    )}
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
