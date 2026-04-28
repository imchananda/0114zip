'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createSupabaseBrowser } from '@/lib/supabase';

interface ActorProfile {
  id: string; // 'namtan' | 'film'
  nickname: string;
  nickname_th: string;
  full_name: string;
  full_name_th: string;
  birth_date: string;
  birth_date_th: string;
  birth_place: string;
  birth_place_th: string;
  education: string;
  education_th: string;
  instagram: string;
  twitter: string;
  photo_url?: string | null;
}

const DEFAULT_PROFILES: ActorProfile[] = [
  {
    id: 'namtan',
    nickname: 'Namtan',
    nickname_th: 'น้ำตาล',
    full_name: 'Tipnaree Weerawatnodom',
    full_name_th: 'ทิพนารี วีรวัฒโนดม',
    birth_date: 'July 1, 1996',
    birth_date_th: '1 กรกฎาคม 2539',
    birth_place: 'Bangkok, Thailand',
    birth_place_th: 'กรุงเทพมหานคร ประเทศไทย',
    education: 'Srinakharinwirot University (Faculty of Fine Arts)',
    education_th: 'มหาวิทยาลัยศรีนครินทรวิโรฒ (คณะศิลปกรรมศาสตร์)',
    instagram: 'namtan.tipnaree',
    twitter: 'NamtanTipnaree',
  },
  {
    id: 'film',
    nickname: 'Film',
    nickname_th: 'ฟิล์ม',
    full_name: 'Rachanun Mahawan',
    full_name_th: 'รชานันท์ มหาวรรณ์',
    birth_date: 'July 14, 2000',
    birth_date_th: '14 กรกฎาคม 2543',
    birth_place: 'Bangkok, Thailand',
    birth_place_th: 'กรุงเทพมหานคร ประเทศไทย',
    education: 'King Mongkut\'s University of Technology Thonburi',
    education_th: 'มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี',
    instagram: 'fr.racha',
    twitter: 'filmrachanun',
  }
];

export default function AdminProfilePage() {
  const [profiles, setProfiles] = useState<ActorProfile[]>(DEFAULT_PROFILES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const supabase = createSupabaseBrowser();

  useEffect(() => {
    fetch('/api/admin/profile')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setProfiles(data); })
      .catch(console.error);
  }, []);

  const handleSave = async (updated: ActorProfile) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const saved = await res.json();
        setProfiles(prev => prev.map(p => p.id === saved.id ? saved : p));
        setEditingId(null);
        setSaveMsg('บันทึกข้อมูลเรียบร้อยแล้ว!');
      } else {
        setSaveMsg('เกิดข้อผิดพลาด');
      }
    } catch {
      setSaveMsg('เกิดข้อผิดพลาด');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-[var(--color-border)] gap-4">
        <div className="flex flex-col gap-1">
          <Link href="/admin/dashboard" className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors flex items-center gap-2 w-fit">
            <span>←</span> Back to Dashboard
          </Link>
          <h1 className="font-display text-2xl font-normal text-[var(--color-text-primary)]">📋 จัดการข้อมูลศิลปิน (Profile Editor)</h1>
          <p className="text-sm text-[var(--color-text-muted)]">แก้ไขประวัติส่วนตัว, การศึกษา และ Social Media</p>
        </div>
      </div>

      {saveMsg && (
        <div className="mb-6 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-600 text-sm">
          ✅ {saveMsg}
        </div>
      )}

      {/* Profile Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {profiles.map((profile) => (
          <div key={profile.id} className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden">
            <div className={`p-4 border-b border-[var(--color-border)] ${profile.id === 'namtan' ? 'bg-[var(--namtan-teal)]/10' : 'bg-amber-500/10'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl overflow-hidden shrink-0 ${profile.id === 'namtan' ? 'bg-[var(--namtan-teal)] text-white' : 'bg-amber-400 text-amber-900'}`}>
                  {profile.photo_url ? (
                    <img src={profile.photo_url} alt={profile.nickname} className="w-full h-full object-cover" />
                  ) : (
                    profile.nickname_th[0]
                  )}
                </div>
                <div>
                  <h2 className="font-display text-xl">{profile.nickname_th} / {profile.nickname}</h2>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{profile.full_name_th}</p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <InfoRow label="วันเกิด" value={`${profile.birth_date_th} (${profile.birth_date})`} />
              <InfoRow label="สถานที่เกิด" value={profile.birth_place_th} />
              <InfoRow label="การศึกษา" value={profile.education_th} />
              
              <div className="pt-3 mt-3 border-t border-[var(--color-border)] flex gap-4 text-sm">
                {profile.instagram && (
                  <span className="text-[var(--color-text-secondary)]">📸 IG: @{profile.instagram}</span>
                )}
                {profile.twitter && (
                  <span className="text-[var(--color-text-secondary)]">🐦 X: @{profile.twitter}</span>
                )}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setEditingId(profile.id)}
                  className="w-full py-2 bg-[var(--color-panel)] hover:bg-[var(--color-border)] rounded-lg text-sm transition-colors text-[var(--color-text-primary)]"
                >
                  ✏️ แก้ไขประวัติ {profile.nickname_th}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingId && (
        <EditProfileModal
          profile={profiles.find(p => p.id === editingId)!}
          onClose={() => setEditingId(null)}
          onSave={handleSave}
          saving={saving}
          supabase={supabase}
        />
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider block mb-0.5">{label}</span>
      <span className="text-sm text-[var(--color-text-primary)]">{value || '-'}</span>
    </div>
  );
}

function EditProfileModal({ profile, onClose, onSave, saving, supabase }: {
  profile: ActorProfile;
  onClose: () => void;
  onSave: (p: ActorProfile) => void;
  saving: boolean;
  supabase: ReturnType<typeof createSupabaseBrowser>;
}) {
  const [form, setForm] = useState({ ...profile });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setUploadMsg('ไฟล์ต้องมีขนาดไม่เกิน 5 MB');
      return;
    }
    setPhotoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setUploadMsg('');
  };

  const handleSave = async () => {
    if (!photoFile) {
      onSave(form);
      return;
    }
    setUploading(true);
    setUploadMsg('');
    const fileExt = photoFile.name.split('.').pop();
    const filePath = `artists/${form.id}/photo-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(filePath, photoFile, { upsert: true });
    if (uploadError) {
      setUploadMsg(`อัปโหลดล้มเหลว: ${uploadError.message}`);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from('profiles').getPublicUrl(filePath);
    setUploading(false);
    onSave({ ...form, photo_url: data.publicUrl });
  };

  const accentColor = form.id === 'namtan' ? 'var(--namtan-teal)' : '#f59e0b';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6 max-h-[90vh] overflow-y-auto"
      >
        <h2 className="font-display text-lg font-normal mb-6 border-b border-[var(--color-border)] pb-3">
          ✏️ แก้ไขประวัติส่วนตัว — {profile.nickname_th}
        </h2>

        {/* ── Photo Upload Section ── */}
        <div className="mb-6 p-4 bg-[var(--color-panel)] rounded-xl border border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium mb-4">รูปภาพศิลปิน</p>
          <div className="flex items-center gap-5">
            {/* Preview */}
            <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 border-2 border-[var(--color-border)] bg-black/20 flex items-center justify-center">
              {previewUrl ? (
                <img src={previewUrl} alt="preview" className="w-full h-full object-cover object-top" />
              ) : form.photo_url ? (
                <img src={form.photo_url} alt={form.nickname} className="w-full h-full object-cover object-top" />
              ) : (
                <span className="text-3xl text-[var(--color-text-muted)]">🎭</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept="image/*"
                ref={photoInputRef}
                onChange={handlePhotoChange}
                className="hidden"
              />
              <button
                onClick={() => photoInputRef.current?.click()}
                className="px-4 py-2 border border-[var(--color-border)] rounded-lg text-sm bg-[var(--color-surface)] hover:bg-[var(--color-border)] transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                เลือกรูปภาพ
              </button>
              {photoFile && (
                <p className="text-xs text-[#6cbfd0]">{photoFile.name}</p>
              )}
              {form.photo_url && !photoFile && (
                <button
                  onClick={() => setForm(f => ({ ...f, photo_url: null }))}
                  className="text-xs text-red-400 hover:text-red-300 text-left"
                >
                  ✕ ลบรูปปัจจุบัน
                </button>
              )}
              <p className="text-xs text-[var(--color-text-muted)]">แนะนำสัดส่วน 3:4 · ไม่เกิน 5 MB</p>
              {uploadMsg && <p className="text-xs text-red-400">{uploadMsg}</p>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SectionTitle>ชื่อหลัก</SectionTitle>
          <Field label="ชื่อเล่น (EN)">
             <input value={form.nickname} onChange={(e) => setForm(f => ({ ...f, nickname: e.target.value }))} className="input-field" />
          </Field>
          <Field label="ชื่อเล่น (TH)">
             <input value={form.nickname_th} onChange={(e) => setForm(f => ({ ...f, nickname_th: e.target.value }))} className="input-field" />
          </Field>
          
          <SectionTitle>ชื่อจริง</SectionTitle>
          <Field label="ชื่อ-สกุล (EN)">
             <input value={form.full_name} onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))} className="input-field" />
          </Field>
          <Field label="ชื่อ-สกุล (TH)">
             <input value={form.full_name_th} onChange={(e) => setForm(f => ({ ...f, full_name_th: e.target.value }))} className="input-field" />
          </Field>

          <SectionTitle>วันเกิด / สถานที่เกิด</SectionTitle>
          <Field label="วันเกิด (EN)">
             <input value={form.birth_date} onChange={(e) => setForm(f => ({ ...f, birth_date: e.target.value }))} className="input-field" />
          </Field>
          <Field label="วันเกิด (TH)">
             <input value={form.birth_date_th} onChange={(e) => setForm(f => ({ ...f, birth_date_th: e.target.value }))} className="input-field" />
          </Field>
          <Field label="สถานที่เกิด (EN)">
             <input value={form.birth_place} onChange={(e) => setForm(f => ({ ...f, birth_place: e.target.value }))} className="input-field" />
          </Field>
          <Field label="สถานที่เกิด (TH)">
             <input value={form.birth_place_th} onChange={(e) => setForm(f => ({ ...f, birth_place_th: e.target.value }))} className="input-field" />
          </Field>

          <SectionTitle>การศึกษา</SectionTitle>
          <Field label="ประวัติการศึกษา (EN)">
             <textarea value={form.education} onChange={(e) => setForm(f => ({ ...f, education: e.target.value }))} className="input-field min-h-[60px]" />
          </Field>
          <Field label="ประวัติการศึกษา (TH)">
             <textarea value={form.education_th} onChange={(e) => setForm(f => ({ ...f, education_th: e.target.value }))} className="input-field min-h-[60px]" />
          </Field>

          <SectionTitle>Social Media</SectionTitle>
          <Field label="Instagram (ID/Username)">
             <div className="flex">
               <span className="px-3 py-2 bg-black/40 border border-t-[var(--color-border)] border-b-[var(--color-border)] border-l-[var(--color-border)] rounded-l-lg text-[var(--color-text-muted)] text-sm">@</span>
               <input value={form.instagram} onChange={(e) => setForm(f => ({ ...f, instagram: e.target.value }))} className="input-field !rounded-l-none !border-l-0" />
             </div>
          </Field>
          <Field label="X / Twitter (ID/Username)">
             <div className="flex">
               <span className="px-3 py-2 bg-black/40 border border-t-[var(--color-border)] border-b-[var(--color-border)] border-l-[var(--color-border)] rounded-l-lg text-[var(--color-text-muted)] text-sm">@</span>
               <input value={form.twitter} onChange={(e) => setForm(f => ({ ...f, twitter: e.target.value }))} className="input-field !rounded-l-none !border-l-0" />
             </div>
          </Field>
        </div>

        <div className="flex gap-3 mt-8 pt-4 border-t border-[var(--color-border)]">
          <button onClick={onClose} className="flex-1 py-2.5 bg-[var(--color-panel)] text-[var(--color-text-muted)] rounded-xl hover:bg-[var(--color-border)] transition-colors font-medium">
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="flex-1 py-2.5 bg-[#6cbfd0] text-[#141413] rounded-xl hover:bg-[#4a9aab] disabled:opacity-50 transition-colors font-medium flex items-center justify-center gap-2"
          >
            {(saving || uploading) ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-[#141413] rounded-full animate-spin" />
                {uploading ? 'กำลังอัปโหลดรูป...' : 'กำลังบันทึก...'}
              </>
            ) : '💾 บันทึก'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .input-field {
          width: 100%;
          padding: 0.5rem 0.75rem;
          background: var(--color-panel);
          border: 1px solid var(--color-border);
          border-radius: 0.5rem;
          color: var(--color-text-primary);
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-field:focus {
          border-color: var(--namtan-teal);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] text-[var(--color-text-muted)] mb-1 font-medium uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="col-span-1 md:col-span-2 mt-4 mb-2">
      <h3 className="text-sm font-normal text-[var(--color-text-secondary)]">{children}</h3>
    </div>
  );
}
