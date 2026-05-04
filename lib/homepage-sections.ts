export type HomepageSectionConfig = {
  enabled: boolean;
  order: number;
  layout?: string;
  theme?: string;
  limit?: number;
  title?: string;
};

export type HomepageSectionsConfig = Record<HomepageSectionId, HomepageSectionConfig>;

export type SectionMeta = {
  label: string;
  icon: string;
  desc: string;
  fixed?: boolean;
  hasVisualConfig?: boolean;
  sourcePath: string;
  adminPath?: string | string[];
};

export type VisualOption = {
  value: string;
  label: string;
  icon: string;
};

export type VisualConfigDef = {
  layout?: { label: string; options: readonly VisualOption[] };
  theme?: { label: string; options: readonly VisualOption[] };
  limit?: { label: string; options: readonly number[] };
  title?: { label: string; placeholder: string };
};

export const HOMEPAGE_SECTION_IDS = [
  'about',
  'stats',
  'brands',
  'profile',
  'schedule',
  'content',
  'fashion',
  'awards',
  'timeline',
  'mediaTags',
  'challenges',
  'prizes',
  'floatingArtistSelector',
  'scrollToTop',
] as const;

export type HomepageSectionId = (typeof HOMEPAGE_SECTION_IDS)[number];

export const STATIC_HOME_UI_KEYS: ReadonlySet<string> = new Set([
  'floatingArtistSelector',
  'scrollToTop',
]);

const HOMEPAGE_SECTION_ID_SET: ReadonlySet<string> = new Set(HOMEPAGE_SECTION_IDS);

export const SECTION_META: Record<string, SectionMeta> = {
  about:      { label: 'About',                  icon: '📝', desc: 'แนะนำ NamtanFilm ข้อมูลผลงานรวม', hasVisualConfig: true, sourcePath: 'components/sections/AboutSection.tsx' },
  stats:      { label: 'Live Dashboard',          icon: '📊', desc: 'สถิติโซเชียล + ลิงก์ด่วน',                  sourcePath: 'components/dashboard/LiveDashboard.tsx', adminPath: ['/admin/social-stats', '/admin/live-dashboard'] },
  brands:     { label: 'Brands & Collaborations', icon: '💼', desc: 'แบรนด์และแคมเปญโฆษณา', hasVisualConfig: true, sourcePath: 'components/sections/BrandsSection.tsx', adminPath: '/admin/brands' },
  profile:    { label: 'Profile',                 icon: '👤', desc: 'ข้อมูลโปรไฟล์ Namtan & Film', hasVisualConfig: true, sourcePath: 'components/sections/ProfileSection.tsx', adminPath: '/admin/profile' },
  schedule:   { label: 'Schedule Preview',        icon: '📅', desc: 'กำหนดการและอีเวนต์ที่กำลังจะมาถึง', hasVisualConfig: true, sourcePath: 'components/sections/SchedulePreview.tsx', adminPath: '/admin/schedule' },
  content:    { label: 'Content',                 icon: '🎞️', desc: 'ซีรีส์ ละคร และผลงาน', hasVisualConfig: true, sourcePath: 'components/sections/ContentSection.tsx', adminPath: '/admin/content' },
  fashion:    { label: 'Fashion & Style',         icon: '👗', desc: 'แฟชั่นและลุคเด่นล่าสุด', hasVisualConfig: true, sourcePath: 'components/sections/FashionSection.tsx', adminPath: '/admin/fashion' },
  awards:     { label: 'Awards',                  icon: '🏆', desc: 'รางวัลที่ได้รับ', hasVisualConfig: true, sourcePath: 'components/sections/AwardsPreview.tsx', adminPath: '/admin/awards' },
  timeline:   { label: 'Timeline',                icon: '📖', desc: 'ไทม์ไลน์เหตุการณ์สำคัญ', hasVisualConfig: true, sourcePath: 'components/sections/TimelineSection.tsx', adminPath: '/admin/timeline' },
  mediaTags:  { label: 'Media & Tags',            icon: '📱', desc: 'มีเดียล่าสุด + แฮชแท็กยอดนิยม', hasVisualConfig: true, sourcePath: 'components/sections/MediaTagsSection.tsx', adminPath: '/admin/media' },
  challenges: { label: 'Challenges',              icon: '🎮', desc: 'กิจกรรมและ challenge สำหรับแฟนคลับ', hasVisualConfig: true, sourcePath: 'components/sections/ChallengesSection.tsx', adminPath: '/admin/challenges' },
  prizes:     { label: 'Prizes & Giveaways',      icon: '🎁', desc: 'ของรางวัลสำหรับแฟนคลับ', hasVisualConfig: true, sourcePath: 'components/sections/PrizeSection.tsx', adminPath: '/admin/prizes' },
  floatingArtistSelector: { label: 'Floating Artist Selector', icon: '🎭', desc: 'แถบลัดเลือกศิลปิน', fixed: true, sourcePath: 'components/navigation/FloatingArtistSelector.tsx', adminPath: '/admin/floating-artist-selector' },
  scrollToTop:            { label: 'Scroll To Top Button',     icon: '⬆️', desc: 'ปุ่มเลื่อนกลับขึ้นบน', fixed: true, sourcePath: 'components/ui/ScrollToTop.tsx' },
};

export const VISUAL_CONFIGS: Record<string, VisualConfigDef> = {
  brands: {
    layout: {
      label: 'Layout',
      options: [
        { value: 'split', label: 'Split (รูป + โลโก้)', icon: '📐' },
        { value: 'full-grid', label: 'Full Grid (โลโก้เต็มจอ)', icon: '▦' },
      ],
    },
    theme: {
      label: 'Theme',
      options: [
        { value: 'dark', label: 'Dark', icon: '🌙' },
        { value: 'light', label: 'Light', icon: '☀️' },
      ],
    },
    title: { label: 'หัวข้อ Section', placeholder: 'Brand Partnerships' },
  },
  schedule: {
    layout: {
      label: 'Layout',
      options: [
        { value: 'cards', label: 'Cards (การ์ด 2 คอลัมน์)', icon: '🃏' },
        { value: 'list', label: 'List (รายการแนวนอน)', icon: '📋' },
      ],
    },
    theme: {
      label: 'Theme',
      options: [
        { value: 'light', label: 'Light', icon: '☀️' },
        { value: 'dark', label: 'Dark', icon: '🌙' },
      ],
    },
    limit: { label: 'จำนวนงานที่โชว์', options: [4, 6, 8] },
  },
  about: {
    layout: {
      label: 'Layout',
      options: [
        { value: 'all', label: 'All (โชว์คู่ + เดี่ยว)', icon: '📋' },
        { value: 'couple-only', label: 'Couple Only (โชว์เฉพาะคู่)', icon: '👥' },
        { value: 'individuals-only', label: 'Individuals Only (โชว์เฉพาะเดี่ยว)', icon: '👤' },
      ],
    },
    theme: {
      label: 'Theme',
      options: [
        { value: 'default', label: 'Default', icon: '🎨' },
        { value: 'glass', label: 'Glass (กระจกใส)', icon: '🪟' },
        { value: 'minimal', label: 'Minimal (ไร้กรอบ)', icon: '✨' },
      ],
    },
  },
  fashion: {
    limit: { label: 'จำนวน Highlight ที่โชว์', options: [4, 6, 8] },
  },
  awards: {
    limit: { label: 'จำนวนรางวัลที่โชว์', options: [3, 6, 9] },
  },
  timeline: {
    limit: { label: 'จำนวนปีที่โชว์', options: [3, 5, 10] },
  },
  profile: {
    theme: {
      label: 'Theme',
      options: [
        { value: 'cinematic', label: 'Cinematic (มืด/แสงจัด)', icon: '🌌' },
        { value: 'clean', label: 'Clean (เข้ากับเว็บหลัก)', icon: '☀️' },
      ],
    },
    layout: {
      label: 'Stats Bar',
      options: [
        { value: 'show', label: 'แสดงแถบสถิติ', icon: '📊' },
        { value: 'hide', label: 'ซ่อนแถบสถิติ', icon: '🚫' },
      ],
    },
  },
  content: {
    limit: { label: 'จำนวนสูงสุดต่อหมวดหมู่', options: [5, 10, 15] },
  },
  mediaTags: {
    layout: {
      label: 'Layout',
      options: [
        { value: 'split', label: 'Split (ซ้าย/ขวา)', icon: '📐' },
        { value: 'stacked', label: 'Stacked (บน/ล่าง)', icon: '📚' },
      ],
    },
    limit: { label: 'จำนวนมีเดียที่โชว์', options: [4, 6, 10] },
  },
  challenges: {
    layout: {
      label: 'Layout',
      options: [
        { value: 'grid', label: 'Grid (ตารางแนวตั้ง)', icon: '📱' },
        { value: 'list', label: 'List (แถวแนวนอน)', icon: '📋' },
      ],
    },
    limit: { label: 'จำนวนที่แสดง', options: [3, 6, 9] },
  },
  prizes: {
    theme: {
      label: 'Theme',
      options: [
        { value: 'default', label: 'Solid (สีทึบ)', icon: '🎨' },
        { value: 'glass', label: 'Glass (โปร่งแสง)', icon: '✨' },
      ],
    },
    limit: { label: 'จำนวนที่แสดง', options: [3, 6, 9] },
  },
};

export const DEFAULT_SECTIONS: HomepageSectionsConfig = {
  about:      { enabled: true, order: 0, layout: 'all', theme: 'default' },
  stats:      { enabled: true, order: 1 },
  brands:     { enabled: true, order: 2, layout: 'split', theme: 'dark' },
  profile:    { enabled: true, order: 3, theme: 'cinematic', layout: 'show' },
  schedule:   { enabled: true, order: 4, layout: 'cards', theme: 'light', limit: 4 },
  content:    { enabled: true, order: 5, limit: 10 },
  fashion:    { enabled: true, order: 6, limit: 6 },
  awards:     { enabled: true, order: 7, limit: 6 },
  timeline:   { enabled: true, order: 8, limit: 5 },
  mediaTags:  { enabled: true, order: 9, layout: 'split', limit: 6 },
  challenges: { enabled: true, order: 10, layout: 'grid', limit: 3 },
  prizes:     { enabled: true, order: 11, theme: 'default', limit: 3 },
  floatingArtistSelector: { enabled: true, order: 99 },
  scrollToTop:            { enabled: true, order: 100 },
};

export function cloneDefaultHomepageSections(): HomepageSectionsConfig {
  return Object.fromEntries(
    Object.entries(DEFAULT_SECTIONS).map(([key, value]) => [key, { ...value }])
  ) as HomepageSectionsConfig;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isHomepageSectionId(key: string): key is HomepageSectionId {
  return HOMEPAGE_SECTION_ID_SET.has(key);
}

function readFiniteNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

export function normalizeHomepageSections(raw: unknown): HomepageSectionsConfig {
  const result = cloneDefaultHomepageSections();
  if (!isRecord(raw)) return result;

  for (const [key, value] of Object.entries(raw)) {
    if (!isHomepageSectionId(key)) continue;

    if (typeof value === 'boolean') {
      result[key] = { ...result[key], enabled: value };
      continue;
    }

    if (!isRecord(value)) continue;

    const next: HomepageSectionConfig = { ...result[key] };
    if (typeof value.enabled === 'boolean') next.enabled = value.enabled;

    const order = readFiniteNumber(value.order);
    if (order !== undefined) next.order = order;

    if (typeof value.layout === 'string') next.layout = value.layout;
    if (typeof value.theme === 'string') next.theme = value.theme;

    const limit = readFiniteNumber(value.limit);
    if (limit !== undefined) next.limit = limit;

    if (typeof value.title === 'string') next.title = value.title;

    result[key] = next;
  }

  return result;
}
