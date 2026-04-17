'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Gift, Plus, Edit2, Trash2, Save, X, Eye, EyeOff } from 'lucide-react';

interface PrizeDraw {
  id: string;
  title_th: string;
  description: string;
  required_points: number;
  total_prizes: number;
  claimed: number;
  is_active: boolean;
  end_at: string | null;
}

const EMPTY_FORM: Partial<PrizeDraw> = {
  title_th: '',
  description: '',
  required_points: 50,
  total_prizes: 1,
  is_active: false,
  end_at: null,
};

export default function AdminPrizesPage() {
  const [prizes, setPrizes] = useState<PrizeDraw[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<PrizeDraw>>(EMPTY_FORM);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchPrizes();
  }, []);

  const fetchPrizes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/prizes');
      if (!res.ok) {
        console.warn('ตารางของรางวัลอาจยังไม่มีในระบบ', await res.text());
        return;
      }
      setPrizes(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setError('');
    if (!form.title_th) {
      setError('กรุณากรอกชื่อของรางวัลครับ');
      return;
    }
    try {
      const res = await fetch('/api/admin/prizes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setIsCreating(false);
      setForm(EMPTY_FORM);
      fetchPrizes();
    } catch (e: any) {
      setError(`เกิดข้อผิดพลาด: ${e.message}`);
    }
  };

  const handleUpdate = async () => {
    setError('');
    try {
      const res = await fetch('/api/admin/prizes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...form }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setEditingId(null);
      setForm(EMPTY_FORM);
      fetchPrizes();
    } catch (e: any) {
      setError(`เกิดข้อผิดพลาด: ${e.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ลบของรางวัลนี้?')) return;
    try {
      const res = await fetch(`/api/admin/prizes?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error);
      fetchPrizes();
    } catch (e: any) {
      setError(`เกิดข้อผิดพลาด: ${e.message}`);
    }
  };

  const toggleVisibility = async (id: string, current: boolean) => {
    try {
      await fetch('/api/admin/prizes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !current }),
      });
      fetchPrizes();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const startEdit = (prize: PrizeDraw) => {
    setEditingId(prize.id);
    setIsCreating(false);
    setForm({ ...prize });
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    setForm(EMPTY_FORM);
    setError('');
  };

  const filtered = prizes.filter(p =>
    filterStatus === 'all' ||
    (filterStatus === 'active' && p.is_active) ||
    (filterStatus === 'inactive' && !p.is_active)
  );

  const PrizeForm = ({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) => (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 mb-6">
      <h3 className="text-base font-normal text-[var(--color-text)] mb-4">
        {editingId ? '✏️ แก้ไขของรางวัล' : '✨ เพิ่มของรางวัลใหม่'}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1 md:col-span-2">
          <label className="text-xs text-[var(--color-muted)]">ชื่อของรางวัล *</label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] text-sm"
            value={form.title_th || ''}
            onChange={e => setForm({ ...form, title_th: e.target.value })}
            placeholder="เช่น เสื้อ Official หรือ โปสเตอร์เซ็น"
          />
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="text-xs text-[var(--color-muted)]">รายละเอียด</label>
          <textarea
            className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] text-sm min-h-[60px]"
            value={form.description || ''}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="อธิบายของรางวัลโดยย่อ"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-[var(--color-muted)]">คะแนนที่ใช้แลก (Points)</label>
          <input
            type="number"
            className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] text-sm"
            value={form.required_points ?? 50}
            onChange={e => setForm({ ...form, required_points: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-[var(--color-muted)]">จำนวนของรางวัลทั้งหมด</label>
          <input
            type="number"
            className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] text-sm"
            value={form.total_prizes ?? 1}
            onChange={e => setForm({ ...form, total_prizes: parseInt(e.target.value) || 1 })}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-[var(--color-muted)]">วันหมดเขต (ถ้ามี)</label>
          <input
            type="datetime-local"
            className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] text-sm"
            value={form.end_at ? new Date(form.end_at).toISOString().slice(0, 16) : ''}
            onChange={e => setForm({ ...form, end_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
          />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active || false}
              onChange={e => setForm({ ...form, is_active: e.target.checked })}
              className="w-4 h-4 rounded accent-[#6cbfd0]"
            />
            <span className="text-[var(--color-text)]">เปิดให้ผู้ใช้เห็น (เปิดใช้งาน)</span>
          </label>
        </div>
      </div>
      {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
      <div className="flex gap-2 mt-4">
        <button
          onClick={onSave}
          className="px-5 py-2 rounded-lg bg-[#6cbfd0] text-[#141413] text-sm font-medium flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> บันทึก
        </button>
        <button
          onClick={onCancel}
          className="px-5 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] text-sm flex items-center gap-2"
        >
          <X className="w-4 h-4" /> ยกเลิก
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 pb-4 border-b border-[var(--color-border)] gap-4">
        <div className="flex flex-col gap-1">
          <Link
            href="/admin/dashboard"
            className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors flex items-center gap-1.5 w-fit"
          >
            ← Dashboard
          </Link>
          <h1 className="font-display text-2xl font-normal text-[var(--color-text-primary)] flex items-center gap-2">
            <Gift className="w-6 h-6 text-pink-400" /> จัดการของรางวัล
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">เพิ่ม/แก้ไขของรางวัลสำหรับแลกคะแนน (Gamification)</p>
        </div>
        <div className="flex gap-2 shrink-0">
          {!isCreating && !editingId && (
            <button
              onClick={() => { setIsCreating(true); setEditingId(null); setForm(EMPTY_FORM); setError(''); }}
              className="px-4 py-2 rounded-xl bg-[#6cbfd0] text-[#141413] font-medium text-sm flex items-center gap-1.5 hover:bg-[#4a9aab] transition-colors"
            >
              <Plus className="w-4 h-4" /> เพิ่มของรางวัล
            </button>
          )}
        </div>
      </div>

      {/* Create Form */}
      {isCreating && <PrizeForm onSave={handleCreate} onCancel={cancelEdit} />}

      {/* Stats + Filters */}
      {!loading && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          {/* Stats */}
          <div className="flex gap-3">
            <div className="flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-2">
              <span>🎁</span>
              <div>
                <div className="text-base font-medium text-[var(--color-text-primary)]">{prizes.length}</div>
                <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">ทั้งหมด</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-2">
              <span>✅</span>
              <div>
                <div className="text-base font-medium text-[var(--color-text-primary)]">{prizes.filter(p => p.is_active).length}</div>
                <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">เปิดใช้งาน</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-2">
              <span>📦</span>
              <div>
                <div className="text-base font-medium text-[var(--color-text-primary)]">{prizes.reduce((s, p) => s + (p.claimed || 0), 0)}</div>
                <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">แจกแล้ว</div>
              </div>
            </div>
          </div>
          {/* Filter */}
          <div className="flex gap-2 flex-wrap ml-auto">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-3 py-2 text-sm focus:border-[#6cbfd0] focus:outline-none"
            >
              <option value="all">🎁 ทั้งหมด</option>
              <option value="active">✅ เปิดใช้งาน</option>
              <option value="inactive">🔒 ปิดใช้งาน</option>
            </select>
          </div>
        </div>
      )}

      {/* Prize List */}
      {loading ? (
        <div className="text-center py-12 text-[var(--color-text-muted)]">กำลังโหลด...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-text-muted)] border border-[var(--color-border)] rounded-2xl border-dashed">
          <p className="text-4xl mb-2">🎁</p>
          <p>{prizes.length === 0 ? 'ยังไม่มีของรางวัลในระบบ — กดปุ่ม "เพิ่มของรางวัล" ด้านบนได้เลยครับ' : 'ไม่พบของรางวัลตาม filter ที่เลือก'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(prize =>
            editingId === prize.id ? (
              <PrizeForm key={prize.id} onSave={handleUpdate} onCancel={cancelEdit} />
            ) : (
              <div key={prize.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex items-center gap-4">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 ${
                  prize.is_active ? 'bg-pink-400/15' : 'bg-[var(--color-panel)]'
                }`}>
                  🎁
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{prize.title_th}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    🪙 {prize.required_points} คะแนน · {prize.claimed}/{prize.total_prizes} แจกแล้ว
                    {prize.end_at && ` · หมดเขต ${new Date(prize.end_at).toLocaleDateString('th-TH')}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    prize.is_active
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-[var(--color-panel)] text-[var(--color-text-muted)]'
                  }`}>
                    {prize.is_active ? '✅ เปิดใช้งาน' : '🔒 ปิดใช้งาน'}
                  </span>
                  <button
                    onClick={() => toggleVisibility(prize.id, prize.is_active)}
                    className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-panel)] rounded-lg transition-colors"
                    title={prize.is_active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                  >
                    {prize.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => startEdit(prize)}
                    className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-panel)] rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(prize.id)}
                    className="p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
