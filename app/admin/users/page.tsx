'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface UserItem {
  id: string;
  email: string;
  username: string | null;
  display_name: string;
  avatar_url: string | null;
  role: string;
  points: number;
  level: number;
  badges: string[];
  created_at: string;
}

interface RoleCounts {
  total: number;
  admin: number;
  moderator: number;
  fan: number;
  banned: number;
}

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  admin:     { label: 'Admin',     color: '#EF4444', icon: '👑' },
  moderator: { label: 'Moderator', color: '#8B5CF6', icon: '🛡️' },
  fan:       { label: 'Fan',       color: '#1E88E5', icon: '💙' },
  banned:    { label: 'Banned',    color: '#6B7280', icon: '🚫' },
};

export default function UserManagementPage() {
  const { isSuperAdmin, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [roleCounts, setRoleCounts] = useState<RoleCounts>({ total: 0, admin: 0, moderator: 0, fan: 0, banned: 0 });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [showBanConfirm, setShowBanConfirm] = useState<UserItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<UserItem | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!isSuperAdmin) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        ...(search ? { search } : {}),
        ...(roleFilter !== 'all' ? { role: roleFilter } : {}),
      });
      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setTotalPages(data.totalPages || 1);
        setRoleCounts(data.roleCounts || { total: 0, admin: 0, moderator: 0, fan: 0, banned: 0 });
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
    setLoading(false);
  }, [page, search, roleFilter, isSuperAdmin]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Debounced search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, role: newRole }),
    });
    setEditingUser(null);
    fetchUsers();
  };

  const handlePointsChange = async (userId: string, points: number) => {
    await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, points }),
    });
    fetchUsers();
  };

  const handlePasswordChange = async (userId: string, password: string) => {
    const res = await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      alert(`เปลี่ยนรหัสผ่านไม่สำเร็จ: ${err.error}`);
    } else {
      alert('เปลี่ยนรหัสผ่านสำเร็จ!');
    }
  };

  const handleBan = async (userId: string) => {
    await fetch(`/api/admin/users?id=${userId}`, { method: 'DELETE' });
    setShowBanConfirm(null);
    fetchUsers();
  };

  const handleDelete = async (userId: string) => {
    await fetch(`/api/admin/users?id=${userId}&hard=true`, { method: 'DELETE' });
    setShowDeleteConfirm(null);
    fetchUsers();
  };

  const handleUnban = async (userId: string) => {
    await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, role: 'fan' }),
    });
    fetchUsers();
  };

  if (authLoading) {
    return <div className="text-center py-20 animate-pulse text-neutral-500">กำลังตรวจสอบสิทธิ์...</div>;
  }

  if (!isSuperAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="w-16 h-16 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center">
          <span className="text-3xl">🔒</span>
        </div>
        <h1 className="text-2xl font-light mb-2">Access Denied</h1>
        <p className="text-neutral-500 mb-8">คุณต้องมีสิทธิ์ Admin เท่านั้นจึงจะสามารถจัดการผู้ใช้ได้</p>
        <Link href="/admin/dashboard" className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors">
          กลับไปที่ Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-neutral-500 hover:text-white text-sm transition-colors">
            ← Dashboard
          </Link>
          <h1 className="text-xl font-medium">👥 จัดการผู้ใช้</h1>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <StatCard label="ทั้งหมด" value={roleCounts.total} color="#1E88E5" icon="👥" />
        <StatCard label="Admin" value={roleCounts.admin} color="#EF4444" icon="👑" />
        <StatCard label="Moderator" value={roleCounts.moderator} color="#8B5CF6" icon="🛡️" />
        <StatCard label="Fan" value={roleCounts.fan} color="#3B82F6" icon="💙" />
        <StatCard label="Banned" value={roleCounts.banned} color="#6B7280" icon="🚫" />
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="🔍 ค้นหาชื่อ, อีเมล, username..."
            className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#1E88E5] transition-colors text-sm"
          />
        </div>
        <div className="flex gap-2">
          <FilterBtn active={roleFilter === 'all'} onClick={() => { setRoleFilter('all'); setPage(1); }}>
            ทั้งหมด
          </FilterBtn>
          {Object.entries(ROLE_CONFIG).map(([key, cfg]) => (
            <FilterBtn key={key} active={roleFilter === key} onClick={() => { setRoleFilter(key); setPage(1); }}>
              {cfg.icon} {cfg.label}
            </FilterBtn>
          ))}
        </div>
      </div>

      {/* User List */}
      {loading ? (
        <div className="text-center text-neutral-500 py-12">กำลังโหลด...</div>
      ) : users.length === 0 ? (
        <div className="text-center text-neutral-500 py-12">ไม่พบผู้ใช้</div>
      ) : (
        <div className="space-y-2">
          {users.map((user) => {
            const roleInfo = ROLE_CONFIG[user.role] || ROLE_CONFIG.fan;
            const joinDate = new Date(user.created_at).toLocaleDateString('th-TH', {
              year: 'numeric', month: 'short', day: 'numeric',
            });

            return (
              <div
                key={user.id}
                className={`flex items-center gap-4 p-4 bg-neutral-900 rounded-lg border border-neutral-800 hover:border-neutral-700 transition-colors ${
                  user.role === 'banned' ? 'opacity-50' : ''
                }`}
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1E88E5] to-[#FDD835] flex items-center justify-center text-white text-sm font-medium overflow-hidden shrink-0">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (user.display_name || '?')[0].toUpperCase()
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-white truncate">
                      {user.display_name || 'User'}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: roleInfo.color + '20',
                        color: roleInfo.color,
                      }}
                    >
                      {roleInfo.icon} {roleInfo.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-neutral-500 truncate">{user.email}</span>
                    <span className="text-xs text-[#FDD835]">⭐ {user.points} pts</span>
                    <span className="text-xs text-neutral-500">Lv.{user.level}</span>
                    <span className="text-xs text-neutral-600">เข้าร่วม {joinDate}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  {user.role === 'banned' ? (
                    <button
                      onClick={() => handleUnban(user.id)}
                      className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg text-xs transition-colors"
                    >
                      ✅ ปลดแบน
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditingUser(user)}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-xs text-neutral-300 transition-colors"
                      >
                        ✏️ แก้ไข
                      </button>
                      <button
                        onClick={() => setShowBanConfirm(user)}
                        className="px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-lg text-xs transition-colors"
                      >
                        🚫 แบน
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setShowDeleteConfirm(user)}
                    className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs transition-colors"
                  >
                    🗑️ ลบ
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 rounded-lg text-sm transition-colors"
          >
            ← ก่อนหน้า
          </button>
          <span className="text-sm text-neutral-500 px-3">
            หน้า {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 rounded-lg text-sm transition-colors"
          >
            ถัดไป →
          </button>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onRoleChange={handleRoleChange}
          onPointsChange={handlePointsChange}
          onPasswordChange={handlePasswordChange}
        />
      )}

      {/* Ban Confirmation Modal */}
      {showBanConfirm && (
        <BanConfirmModal
          user={showBanConfirm}
          onClose={() => setShowBanConfirm(null)}
          onConfirm={() => handleBan(showBanConfirm.id)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          user={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(null)}
          onConfirm={() => handleDelete(showDeleteConfirm.id)}
        />
      )}
    </div>
  );
}

// ── Stat Card ──
function StatCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  return (
    <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <div className="text-2xl font-light" style={{ color }}>{value}</div>
      </div>
      <div className="text-xs text-neutral-500 mt-1">{label}</div>
    </div>
  );
}

// ── Filter Button ──
function FilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs transition-colors whitespace-nowrap ${
        active ? 'bg-[#1E88E5] text-white' : 'bg-neutral-800 text-neutral-400 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

// ── Edit User Modal ──
function EditUserModal({
  user,
  onClose,
  onRoleChange,
  onPointsChange,
  onPasswordChange,
}: {
  user: UserItem;
  onClose: () => void;
  onRoleChange: (userId: string, role: string) => void;
  onPointsChange: (userId: string, points: number) => void;
  onPasswordChange: (userId: string, password: string) => void;
}) {
  const [role, setRole] = useState(user.role);
  const [points, setPoints] = useState(user.points);
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    if (role !== user.role) {
      await onRoleChange(user.id, role);
    }
    if (points !== user.points) {
      await onPointsChange(user.id, points);
    }
    if (password.trim().length >= 6) {
      await onPasswordChange(user.id, password);
    } else if (password && password.trim().length < 6) {
      alert('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      setSaving(false);
      return;
    }
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-neutral-900 rounded-xl border border-neutral-800 p-6"
      >
        {/* User header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1E88E5] to-[#FDD835] flex items-center justify-center text-white text-lg font-medium overflow-hidden">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              (user.display_name || '?')[0].toUpperCase()
            )}
          </div>
          <div>
            <h2 className="text-lg font-medium">{user.display_name}</h2>
            <p className="text-xs text-neutral-500">{user.email}</p>
          </div>
        </div>

        {/* Role selection */}
        <div className="mb-4">
          <label className="block text-xs text-neutral-500 mb-2">Role</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(ROLE_CONFIG).filter(([k]) => k !== 'banned').map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setRole(key)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm transition-all ${
                  role === key
                    ? 'border-[#1E88E5] bg-[#1E88E5]/10 text-white'
                    : 'border-neutral-800 bg-neutral-800/50 text-neutral-400 hover:text-white hover:border-neutral-700'
                }`}
              >
                <span>{cfg.icon}</span>
                <span>{cfg.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Points */}
        <div className="mb-6">
          <label className="block text-xs text-neutral-500 mb-2">Points</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPoints(Math.max(0, points - 50))}
              className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm transition-colors"
            >
              -50
            </button>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(Math.max(0, Number(e.target.value)))}
              className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-center text-sm focus:outline-none focus:border-[#1E88E5]"
            />
            <button
              onClick={() => setPoints(points + 50)}
              className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm transition-colors"
            >
              +50
            </button>
            <button
              onClick={() => setPoints(points + 100)}
              className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm transition-colors"
            >
              +100
            </button>
          </div>
        </div>

        {/* Password Reset */}
        <div className="mb-6">
          <label className="block text-xs text-neutral-500 mb-2">เปลี่ยนรหัสผ่าน (ทิ้งว่างไว้ถ้าไม่ต้องการเปลี่ยน)</label>
          <input
            type="text"
            placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-neutral-800 text-neutral-400 rounded-lg hover:bg-neutral-700 transition-colors text-sm"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 bg-[#1E88E5] text-white rounded-lg hover:bg-[#1565C0] disabled:opacity-50 transition-colors text-sm"
          >
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Ban Confirmation Modal ──
function BanConfirmModal({
  user,
  onClose,
  onConfirm,
}: {
  user: UserItem;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    await onConfirm();
    setConfirming(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-neutral-900 rounded-xl border border-orange-500/30 p-6 text-center"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-500/10 flex items-center justify-center">
          <span className="text-3xl">🚫</span>
        </div>

        <h2 className="text-lg font-medium mb-2">แบนผู้ใช้</h2>
        <p className="text-sm text-neutral-400 mb-1">
          ต้องการแบน <strong className="text-white">{user.display_name}</strong>?
        </p>
        <p className="text-xs text-neutral-600 mb-6">
          ผู้ใช้จะไม่สามารถโพสต์หรือแสดงความเห็นได้ คุณสามารถปลดแบนได้ภายหลัง
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-neutral-800 text-neutral-400 rounded-lg hover:bg-neutral-700 transition-colors text-sm"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="flex-1 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors text-sm"
          >
            {confirming ? 'กำลังแบน...' : '🚫 ยืนยันแบน'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirmation Modal ──
function DeleteConfirmModal({
  user,
  onClose,
  onConfirm,
}: {
  user: UserItem;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    await onConfirm();
    setConfirming(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-neutral-900 rounded-xl border border-red-500/50 p-6 text-center"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
          <span className="text-3xl">🗑️</span>
        </div>

        <h2 className="text-lg font-medium mb-2 text-red-500">ลบผู้ใช้อย่างถาวร</h2>
        <p className="text-sm text-neutral-400 mb-1">
          ต้องการลบ <strong className="text-white">{user.display_name}</strong>?
        </p>
        <p className="text-xs text-red-400 mb-6">
          การกระทำนี้ไม่สามารถย้อนกลับได้ ข้อมูลการล็อกอินของผู้ใช้จะหายไปทั้งหมด
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-neutral-800 text-neutral-400 rounded-lg hover:bg-neutral-700 transition-colors text-sm"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors text-sm"
          >
            {confirming ? 'กำลังลบ...' : '🗑️ ยืนยันการลบ'}
          </button>
        </div>
      </div>
    </div>
  );
}
