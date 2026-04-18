'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

type NavItem = { href: string; icon: string; label: string; superOnly?: boolean };
type NavGroup = { label: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'ภาพรวม',
    items: [
      { href: '/admin/dashboard', icon: '🏠', label: 'Dashboard' },
    ],
  },
  {
    label: 'จัดการข้อมูลศิลปิน',
    items: [
      { href: '/admin/profile',   icon: '📋', label: 'Profile' },
      { href: '/admin/schedule',  icon: '📅', label: 'Schedule' },
      { href: '/admin/content',   icon: '📝', label: 'Content' },
      { href: '/admin/fashion',   icon: '👗', label: 'Fashions' },
      { href: '/admin/awards',    icon: '🏆', label: 'Awards' },
      { href: '/admin/timeline',  icon: '📖', label: 'Timeline' },
    ],
  },
  {
    label: 'กิจกรรมแฟนคลับ',
    items: [
      { href: '/admin/media',                       icon: '🎞️', label: 'Media & Tags'     },
      { href: '/admin/social-stats',                icon: '📊', label: 'Live Stats'        },
      { href: '/admin/social-stats/snapshots',      icon: '📈', label: 'Follower History'  },
      { href: '/admin/social-stats/ig-posts',       icon: '📷', label: 'IG Posts & EMV'   },
      { href: '/admin/brands',                      icon: '🏷️', label: 'Brand Collabs'    },
      { href: '/admin/challenges',                  icon: '🎯', label: 'Challenges'        },
      { href: '/admin/prizes',        icon: '🎁', label: 'Prizes' },
      { href: '/admin/notifications', icon: '🔔', label: 'Alerts' },
    ],
  },
  {
    label: 'ระบบ',
    items: [
      { href: '/admin/hero-slides',     icon: '🖼️', label: 'Hero Slides'      },
      { href: '/admin/live-dashboard',  icon: '📊', label: 'Live Dashboard'    },
      { href: '/admin/banners',         icon: '🎨', label: 'Banners'           },
      { href: '/admin/footer',    icon: '🦶', label: 'Footer' },
      { href: '/admin/users',     icon: '👥', label: 'Users', superOnly: true },
      { href: '/admin/settings',  icon: '⚙️', label: 'Settings' },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { isSuperAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const filteredGroups = NAV_GROUPS.map(group => ({
    ...group,
    items: group.items.filter(item => !item.superOnly || isSuperAdmin),
  })).filter(group => group.items.length > 0);

  const allItems = filteredGroups.flatMap(g => g.items);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col shrink-0 h-screen sticky top-0 bg-[var(--color-surface)] border-r border-[var(--color-border)] transition-all duration-300 ${
          collapsed ? 'w-[68px]' : 'w-[220px]'
        }`}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-[var(--color-border)]">
          {!collapsed && (
            <Link href="/admin/dashboard" className="font-display text-base font-medium truncate">
              <span className="bg-gradient-to-r from-[#6cbfd0] to-[#fbdf74] bg-clip-text text-transparent">
                NTF
              </span>
              <span className="text-[var(--color-text-secondary)] ml-1 text-sm">Admin</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-[var(--color-panel)] text-[var(--color-text-muted)] transition-colors shrink-0"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {filteredGroups.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] opacity-60">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={item.label}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                        isActive
                          ? 'bg-[var(--namtan-teal)]/15 text-[var(--namtan-teal)] font-medium border border-[var(--namtan-teal)]/30'
                          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-panel)] hover:text-[var(--color-text-primary)]'
                      }`}
                    >
                      <span className="text-lg shrink-0 w-6 text-center">{item.icon}</span>
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-2 py-3 border-t border-[var(--color-border)]">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-panel)] hover:text-[var(--color-text-primary)] transition-all"
          >
            <span className="text-lg shrink-0 w-6 text-center">🌐</span>
            {!collapsed && <span>กลับเว็บหลัก</span>}
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-surface)]/95 backdrop-blur-md border-t border-[var(--color-border)] safe-area-bottom">
        <div className="flex overflow-x-auto no-scrollbar">
          {allItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 min-w-[64px] px-2 py-2.5 text-center transition-colors shrink-0 ${
                  isActive
                    ? 'text-[var(--namtan-teal)]'
                    : 'text-[var(--color-text-muted)]'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-[9px] leading-tight truncate w-full">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
