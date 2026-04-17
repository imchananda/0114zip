'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { createSupabaseBrowser } from '@/lib/supabase';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');

  // Settings form state
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bio, setBio] = useState('');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Inline quick-upload state (profile tab)
  const [quickSaving, setQuickSaving] = useState(false);
  const [quickMessage, setQuickMessage] = useState('');

  const supabase = createSupabaseBrowser();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const quickAvatarInputRef = useRef<HTMLInputElement>(null);
  const quickBannerInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="text-center">
          <p className="text-[var(--color-muted)] mb-4">กรุณาเข้าสู่ระบบก่อน</p>
          <Link href="/auth/login" className="text-[#6cbfd0] hover:underline">เข้าสู่ระบบ</Link>
        </div>
      </div>
    );
  }

  const handleOpenSettings = () => {
    setDisplayName(profile?.display_name || '');
    setBio(profile?.bio || '');
    setPassword('');
    setConfirmPassword('');
    setAvatarFile(null);
    setBannerFile(null);
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

  // Inline quick-upload directly from profile tab
  const handleQuickUpload = async (
    file: File,
    field: 'avatar_url' | 'banner_url',
    pathPrefix: string
  ) => {
    if (file.size > 5 * 1024 * 1024) {
      setQuickMessage('ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5 MB');
      setTimeout(() => setQuickMessage(''), 3000);
      return;
    }
    setQuickSaving(true);
    setQuickMessage('');
    const url = await uploadImage(file, pathPrefix);
    if (url) {
      const { error } = await supabase.from('users').update({ [field]: url }).eq('id', user.id);
      if (!error) {
        await refreshProfile();
        setQuickMessage(field === 'avatar_url' ? 'อัปเดตรูปโปรไฟล์เรียบร้อย!' : 'อัปเดตรูปแบนเนอร์เรียบร้อย!');
      } else {
        setQuickMessage('เกิดข้อผิดพลาดในการบันทึก');
      }
    } else {
      setQuickMessage('อัปโหลดรูปภาพล้มเหลว');
    }
    setQuickSaving(false);
    setTimeout(() => setQuickMessage(''), 3000);
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
      const dbUpdates: Record<string, string> = { display_name: displayName, bio: bio };

      // 2. Avatar Upload
      if (avatarFile) {
        if (avatarFile.size > 5 * 1024 * 1024) {
          setMessage('ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5 MB');
          setSaving(false);
          return;
        }
        const url = await uploadImage(avatarFile, 'avatar');
        if (url) dbUpdates.avatar_url = url;
        else errorOccurred = true;
      }

      // 3. Banner Upload
      if (bannerFile) {
        if (bannerFile.size > 5 * 1024 * 1024) {
          setMessage('ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5 MB');
          setSaving(false);
          return;
        }
        const url = await uploadImage(bannerFile, 'banner');
        if (url) dbUpdates.banner_url = url;
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
              activeTab === 'profile' ? 'border-[#6cbfd0] text-[#6cbfd0]' : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            👤 โปรไฟล์ส่วนตัว
          </button>
          <button
            onClick={handleOpenSettings}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'settings' ? 'border-[#6cbfd0] text-[#6cbfd0]' : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            ⚙️ ตั้งค่า
          </button>
        </div>

        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden">

          {/* ====== PROFILE TAB ====== */}
          {activeTab === 'profile' && (
            <div>
              {/* Banner — click to replace */}
              <div
                className="relative h-32 group cursor-pointer"
                onClick={() => !quickSaving && quickBannerInputRef.current?.click()}
                title="คลิกเพื่อเปลี่ยนรูปแบนเนอร์"
              >
                {profile?.banner_url ? (
                  <img src={profile.banner_url} alt="banner" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-[#6cbfd0] to-[#fbdf74]" />
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-end justify-end p-3">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    เปลี่ยนแบนเนอร์
                  </div>
                </div>
                {quickSaving && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={quickBannerInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleQuickUpload(file, 'banner_url', 'banner');
                    e.target.value = '';
                  }}
                  className="hidden"
                />
              </div>

              {/* Avatar + action buttons */}
              <div className="px-8 -mt-12 flex justify-between items-end">
                {/* Avatar with inline edit */}
                <div className="relative group z-10">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#6cbfd0] to-[#fbdf74] flex items-center justify-center text-[#141413] text-3xl font-medium border-4 border-[var(--color-surface)] shadow-lg overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (profile?.display_name || '?')[0].toUpperCase()
                    )}
                  </div>
                  {/* Camera overlay */}
                  <button
                    onClick={() => !quickSaving && quickAvatarInputRef.current?.click()}
                    disabled={quickSaving}
                    className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center"
                    title="เปลี่ยนรูปโปรไฟล์"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={quickAvatarInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleQuickUpload(file, 'avatar_url', 'avatar');
                      e.target.value = '';
                    }}
                    className="hidden"
                  />
                </div>
                <button onClick={handleOpenSettings} className="mb-2 px-4 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-full text-xs font-medium hover:bg-[#30302e] transition-colors">
                  แก้ไขโปรไฟล์
                </button>
              </div>

              {/* Quick upload feedback */}
              {quickMessage && (
                <div className={`mx-8 mt-3 px-4 py-2 rounded-lg text-xs ${quickMessage.includes('เรียบร้อย') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {quickMessage}
                </div>
              )}

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
                    <div className="text-2xl font-light text-[#fbdf74]">⭐ {profile?.points || 0}</div>
                    <div className="text-xs text-[var(--color-muted)] mt-1 font-medium uppercase tracking-wider">Points</div>
                  </div>
                  <div className="text-center p-4 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
                    <div className="text-2xl font-light text-[#6cbfd0]">Lv.{profile?.level || 1}</div>
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
                        <span key={b} className="px-4 py-1.5 bg-[#6cbfd0]/10 border border-[#6cbfd0]/20 rounded-full text-sm font-medium text-[#8ed0dd]">
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
                    className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] focus:outline-none focus:border-[#6cbfd0] transition-colors"
                  />
                </div>

                <hr className="border-[var(--color-border)]" />

                {/* Avatar */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-muted)] mb-3">รูปภาพโปรไฟล์ (Avatar)</label>
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-[#30302e] border-2 border-[var(--color-border)] flex items-center justify-center overflow-hidden shrink-0">
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
                        className="px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm hover:bg-[#30302e] transition-colors"
                      >
                        อัปโหลดรูปภาพ
                      </button>
                      {avatarFile && (
                        <p className="text-xs text-[#6cbfd0] mt-1.5">{avatarFile.name}</p>
                      )}
                      <p className="text-xs text-neutral-500 mt-1.5">แนะนำขนาด 400×400 px · .jpg / .png · ไม่เกิน 5 MB</p>
                    </div>
                  </div>
                </div>

                {/* Banner */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-muted)] mb-3">รูปแบนเนอร์ (Banner)</label>
                  <div className="rounded-xl overflow-hidden border border-[var(--color-border)] h-24 mb-3">
                    {bannerFile ? (
                      <img src={URL.createObjectURL(bannerFile)} alt="banner preview" className="w-full h-full object-cover" />
                    ) : profile?.banner_url ? (
                      <img src={profile.banner_url} alt="banner" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-[#6cbfd0] to-[#fbdf74]" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={bannerInputRef}
                    onChange={(e) => e.target.files && setBannerFile(e.target.files[0])}
                    className="hidden"
                  />
                  <button
                    onClick={() => bannerInputRef.current?.click()}
                    className="px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm hover:bg-[#30302e] transition-colors"
                  >
                    อัปโหลดรูปแบนเนอร์
                  </button>
                  {bannerFile && (
                    <p className="text-xs text-[#6cbfd0] mt-1.5">{bannerFile.name}</p>
                  )}
                  <p className="text-xs text-neutral-500 mt-1.5">แนะนำขนาด 1200×300 px · .jpg / .png · ไม่เกิน 5 MB</p>
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
                    className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] focus:outline-none focus:border-[#6cbfd0] transition-colors resize-none"
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
                    className="w-full py-4 bg-[#6cbfd0] text-[#141413] rounded-xl font-medium shadow-lg shadow-[#6cbfd0]/20 hover:bg-[#4a9aab] focus:outline-none focus:ring-2 focus:ring-[#6cbfd0] disabled:opacity-50 transition-all flex justify-center items-center gap-2"
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
