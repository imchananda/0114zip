import Image from 'next/image';
import type { HeroBannerConfig, HeroImageSourceType } from '@/lib/homepage-data';
import { resolveImageSrc } from '@/lib/resolve-image-src';
import type { HeroValidationErrors } from './validation';

interface HeroAsset {
  id: string;
  url: string;
  title: string | null;
  createdAt: string | null;
  width?: number | null;
  height?: number | null;
}

interface HeroModeFormProps {
  config: HeroBannerConfig;
  errors: HeroValidationErrors;
  heroAssets: HeroAsset[];
  heroAssetsLoading: boolean;
  heroAssetsSearch: string;
  bannerUploadPct: number | null;
  onConfigChange: (next: HeroBannerConfig) => void;
  onUploadClick: () => void;
  onLibrarySearchChange: (value: string) => void;
  onLibrarySearch: () => void;
  onSelectLibraryAsset: (assetId: string) => void;
  onSetImageSource: (url: string, sourceType: HeroImageSourceType, assetId?: string) => void;
  onClearImageSource: () => void;
}

type ImageSourceConfig = Extract<HeroBannerConfig, { type: 'cinematic' | 'image' }>;

function SourceSelector({
  config,
  errors,
  heroAssets,
  heroAssetsLoading,
  heroAssetsSearch,
  bannerUploadPct,
  onUploadClick,
  onLibrarySearchChange,
  onLibrarySearch,
  onSelectLibraryAsset,
  onSetImageSource,
  onClearImageSource,
}: Omit<HeroModeFormProps, 'onConfigChange'> & { config: ImageSourceConfig }) {
  return (
    <div className="space-y-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-[var(--color-text-primary)]">แหล่งรูปภาพ</p>
        <button
          type="button"
          onClick={onUploadClick}
          data-testid="hero-source-upload-button"
          disabled={bannerUploadPct !== null}
          className="rounded-lg bg-[var(--color-accent)] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
        >
          {bannerUploadPct !== null ? `อัปโหลด ${bannerUploadPct}%` : '📤 Upload ใหม่'}
        </button>
      </div>

      <div className="space-y-2">
        <label className="block text-xs text-[var(--color-text-muted)]">เลือกจากคลังรูป</label>
        <div className="flex gap-2">
          <input
            value={heroAssetsSearch}
            onChange={(e) => onLibrarySearchChange(e.target.value)}
            data-testid="hero-source-library-search-input"
            placeholder="ค้นหา title/URL"
            className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={onLibrarySearch}
            data-testid="hero-source-library-search-button"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs"
          >
            {heroAssetsLoading ? '...' : 'ค้นหา'}
          </button>
        </div>
        <select
          value=""
          onChange={(e) => onSelectLibraryAsset(e.target.value)}
          data-testid="hero-source-library-select"
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
        >
          <option value="">เลือกรูปจาก Library</option>
          {heroAssets.map((asset) => (
            <option key={asset.id} value={asset.id}>
              {(asset.title || 'Untitled')} {asset.width && asset.height ? `(${asset.width}x${asset.height})` : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-xs text-[var(--color-text-muted)]">URL ตรง</label>
        <input
          value={config.imageUrl || ''}
          onChange={(e) => onSetImageSource(e.target.value, 'url')}
          data-testid="hero-source-url-input"
          className={`w-full rounded-lg border px-3 py-2 text-sm ${
            errors.fields.imageUrl ? 'border-red-400' : 'border-[var(--color-border)]'
          } bg-[var(--color-surface)]`}
          placeholder="/images/banners/banner.png หรือ https://..."
        />
        {errors.fields.imageUrl ? <p className="text-xs text-red-400">{errors.fields.imageUrl}</p> : null}
      </div>

      {config.imageUrl ? (
        <div className="overflow-hidden rounded-lg border border-[var(--color-border)]">
          <div className="relative h-36 w-full bg-black/20">
            <Image src={resolveImageSrc(config.imageUrl)} alt="Source preview" fill className="object-cover" sizes="100vw" />
          </div>
          <div className="flex items-center justify-between px-3 py-2 text-[11px] text-[var(--color-text-muted)]">
            <span>source: {config.imageSourceType || 'legacy'}</span>
            <button type="button" onClick={onClearImageSource} className="text-red-400">
              ล้างรูป
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function HeroModeForm(props: HeroModeFormProps) {
  const { config, errors, onConfigChange } = props;

  return (
    <div className="space-y-4">
      {errors.summary.length > 0 ? (
        <div className="rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
          {errors.summary.map((item) => (
            <p key={item}>• {item}</p>
          ))}
        </div>
      ) : null}

      {config.type === 'cinematic' && (
        <>
          <SourceSelector {...props} config={config} />

          {/* Copy section */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4 space-y-4">
            <h3 className="text-xs font-semibold text-[#6cbfd0] uppercase tracking-wider">✍️ ข้อความแบนเนอร์ (Banner Copy)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">ชื่อหลัก (Title - EN)</label>
                <input
                  value={config.title || ''}
                  onChange={(e) => onConfigChange({ ...config, title: e.target.value || undefined })}
                  placeholder="Namtan Film"
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">ชื่อหลัก (Title - TH)</label>
                <input
                  value={config.title_thai || ''}
                  onChange={(e) => onConfigChange({ ...config, title_thai: e.target.value || undefined })}
                  placeholder="น้ำตาล ฟิล์ม"
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">คำบรรยายสั้น (Subtitle - EN)</label>
                <textarea
                  value={config.subtitle || ''}
                  onChange={(e) => onConfigChange({ ...config, subtitle: e.target.value || undefined })}
                  placeholder="We craft memorable moments and stories with precision, style, and impact."
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] min-h-[80px]"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">คำบรรยายสั้น (Subtitle - TH)</label>
                <textarea
                  value={config.subtitle_thai || ''}
                  onChange={(e) => onConfigChange({ ...config, subtitle_thai: e.target.value || undefined })}
                  placeholder="เราสรรสร้างช่วงเวลาและเรื่องราวอันน่าจดจำด้วยความประณีต สไตล์ และพลังขับเคลื่อน"
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] min-h-[80px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">รายการความสามารถ (Detail Lines - EN)</label>
                <input
                  value={config.detailLines || ''}
                  onChange={(e) => onConfigChange({ ...config, detailLines: e.target.value || undefined })}
                  placeholder="ACTING, MUSIC, SERIES, FASHION, EVENTS"
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
                />
                <span className="text-[10px] text-[var(--color-text-muted)] mt-1 block">คั่นด้วยเครื่องหมายจุลภาค (Comma-separated)</span>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">รายการความสามารถ (Detail Lines - TH)</label>
                <input
                  value={config.detailLines_thai || ''}
                  onChange={(e) => onConfigChange({ ...config, detailLines_thai: e.target.value || undefined })}
                  placeholder="การแสดง, ดนตรี, ซีรีส์, แฟชั่น, อีเวนต์"
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
                />
                <span className="text-[10px] text-[var(--color-text-muted)] mt-1 block">คั่นด้วยเครื่องหมายจุลภาค (Comma-separated)</span>
              </div>
            </div>
          </div>

          {/* Text Layer Controls section */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4 space-y-4">
            <h3 className="text-xs font-semibold text-[#6cbfd0] uppercase tracking-wider">🎛️ ตั้งค่าตำแหน่งและขนาดข้อความ (Text Layer Controls)</h3>

            {/* Title 1 Controls */}
            <div className="border-b border-[var(--color-border)]/40 pb-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--color-text-primary)]">ชื่อหลัก 1 (Title Part 1 - EN: Namtan / TH: น้ำตาล)</span>
                <button
                  type="button"
                  onClick={() => onConfigChange({ ...config, title1_enabled: !(config.title1_enabled ?? true) })}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full ${(config.title1_enabled ?? true) ? 'bg-green-500' : 'bg-[#444]'}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${(config.title1_enabled ?? true) ? 'translate-x-4 border border-green-500/10' : 'translate-x-1 border border-neutral-600/10'}`} />
                </button>
              </div>
              {(config.title1_enabled ?? true) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="mb-0.5 block text-[10px] text-[var(--color-text-muted)] uppercase">ตำแหน่ง (Position)</label>
                    <select
                      value={config.title1_position || 'bottom-left'}
                      onChange={(e) => onConfigChange({ ...config, title1_position: e.target.value as never })}
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs text-[var(--color-text-primary)]"
                    >
                      <option value="top-left">บนซ้าย (Top Left)</option>
                      <option value="top-right">บนขวา (Top Right)</option>
                      <option value="bottom-left">ล่างซ้าย (Bottom Left)</option>
                      <option value="bottom-right">ล่างขวา (Bottom Right)</option>
                      <option value="center">ตรงกลาง (Center)</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-0.5 block text-[10px] text-[var(--color-text-muted)] uppercase">ขนาด (Size)</label>
                    <select
                      value={config.title1_size || 'xl'}
                      onChange={(e) => onConfigChange({ ...config, title1_size: e.target.value as never })}
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs text-[var(--color-text-primary)]"
                    >
                      <option value="sm">เล็ก (Small)</option>
                      <option value="md">กลาง (Medium)</option>
                      <option value="lg">ใหญ่ (Large)</option>
                      <option value="xl">ใหญ่พิเศษ (Extra Large)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Title 2 Controls */}
            <div className="border-b border-[var(--color-border)]/40 pb-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--color-text-primary)]">ชื่อหลัก 2 (Title Part 2 - EN: Film / TH: ฟิล์ม)</span>
                <button
                  type="button"
                  onClick={() => onConfigChange({ ...config, title2_enabled: !(config.title2_enabled ?? true) })}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full ${(config.title2_enabled ?? true) ? 'bg-green-500' : 'bg-[#444]'}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${(config.title2_enabled ?? true) ? 'translate-x-4 border border-green-500/10' : 'translate-x-1 border border-neutral-600/10'}`} />
                </button>
              </div>
              {(config.title2_enabled ?? true) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="mb-0.5 block text-[10px] text-[var(--color-text-muted)] uppercase">ตำแหน่ง (Position)</label>
                    <select
                      value={config.title2_position || 'bottom-right'}
                      onChange={(e) => onConfigChange({ ...config, title2_position: e.target.value as never })}
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs text-[var(--color-text-primary)]"
                    >
                      <option value="top-left">บนซ้าย (Top Left)</option>
                      <option value="top-right">บนขวา (Top Right)</option>
                      <option value="bottom-left">ล่างซ้าย (Bottom Left)</option>
                      <option value="bottom-right">ล่างขวา (Bottom Right)</option>
                      <option value="center">ตรงกลาง (Center)</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-0.5 block text-[10px] text-[var(--color-text-muted)] uppercase">ขนาด (Size)</label>
                    <select
                      value={config.title2_size || 'xl'}
                      onChange={(e) => onConfigChange({ ...config, title2_size: e.target.value as never })}
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs text-[var(--color-text-primary)]"
                    >
                      <option value="sm">เล็ก (Small)</option>
                      <option value="md">กลาง (Medium)</option>
                      <option value="lg">ใหญ่ (Large)</option>
                      <option value="xl">ใหญ่พิเศษ (Extra Large)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Subtitle Controls */}
            <div className="border-b border-[var(--color-border)]/40 pb-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--color-text-primary)]">คำบรรยายสั้น (Subtitle)</span>
                <button
                  type="button"
                  onClick={() => onConfigChange({ ...config, subtitle_enabled: !(config.subtitle_enabled ?? true) })}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full ${(config.subtitle_enabled ?? true) ? 'bg-green-500' : 'bg-[#444]'}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${(config.subtitle_enabled ?? true) ? 'translate-x-4 border border-green-500/10' : 'translate-x-1 border border-neutral-600/10'}`} />
                </button>
              </div>
              {(config.subtitle_enabled ?? true) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="mb-0.5 block text-[10px] text-[var(--color-text-muted)] uppercase">ตำแหน่ง (Position)</label>
                    <select
                      value={config.subtitle_position || 'bottom-right'}
                      onChange={(e) => onConfigChange({ ...config, subtitle_position: e.target.value as never })}
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs text-[var(--color-text-primary)]"
                    >
                      <option value="top-left">บนซ้าย (Top Left)</option>
                      <option value="top-right">บนขวา (Top Right)</option>
                      <option value="bottom-left">ล่างซ้าย (Bottom Left)</option>
                      <option value="bottom-right">ล่างขวา (Bottom Right)</option>
                      <option value="center">ตรงกลาง (Center)</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-0.5 block text-[10px] text-[var(--color-text-muted)] uppercase">ขนาด (Size)</label>
                    <select
                      value={config.subtitle_size || 'md'}
                      onChange={(e) => onConfigChange({ ...config, subtitle_size: e.target.value as never })}
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs text-[var(--color-text-primary)]"
                    >
                      <option value="sm">เล็ก (Small)</option>
                      <option value="md">กลาง (Medium)</option>
                      <option value="lg">ใหญ่ (Large)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Detail Lines Controls */}
            <div className="pb-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--color-text-primary)]">รายการความสามารถ (Detail Lines)</span>
                <button
                  type="button"
                  onClick={() => onConfigChange({ ...config, detail_lines_enabled: !(config.detail_lines_enabled ?? true) })}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full ${(config.detail_lines_enabled ?? true) ? 'bg-green-500' : 'bg-[#444]'}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${(config.detail_lines_enabled ?? true) ? 'translate-x-4 border border-green-500/10' : 'translate-x-1 border border-neutral-600/10'}`} />
                </button>
              </div>
              {(config.detail_lines_enabled ?? true) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="mb-0.5 block text-[10px] text-[var(--color-text-muted)] uppercase">ตำแหน่ง (Position)</label>
                    <select
                      value={config.detail_lines_position || 'bottom-left'}
                      onChange={(e) => onConfigChange({ ...config, detail_lines_position: e.target.value as never })}
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs text-[var(--color-text-primary)]"
                    >
                      <option value="top-left">บนซ้าย (Top Left)</option>
                      <option value="top-right">บนขวา (Top Right)</option>
                      <option value="bottom-left">ล่างซ้าย (Bottom Left)</option>
                      <option value="bottom-right">ล่างขวา (Bottom Right)</option>
                      <option value="center">ตรงกลาง (Center)</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-0.5 block text-[10px] text-[var(--color-text-muted)] uppercase">ขนาด (Size)</label>
                    <select
                      value={config.detail_lines_size || 'md'}
                      onChange={(e) => onConfigChange({ ...config, detail_lines_size: e.target.value as never })}
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs text-[var(--color-text-primary)]"
                    >
                      <option value="sm">เล็ก (Small)</option>
                      <option value="md">กลาง (Medium)</option>
                      <option value="lg">ใหญ่ (Large)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CTA Buttons section */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4 space-y-4">
            <h3 className="text-xs font-semibold text-[#6cbfd0] uppercase tracking-wider">🔘 ปุ่มนำทาง (CTA Buttons)</h3>
            
            {/* CTA 1 (Explore Works) */}
            <div className="border-b border-[var(--color-border)]/40 pb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[var(--color-text-primary)] uppercase">ปุ่มรอง (Secondary CTA)</span>
                </div>
                <button
                  type="button"
                  onClick={() => onConfigChange({ ...config, cta1_enabled: !(config.cta1_enabled ?? true) })}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full ${(config.cta1_enabled ?? true) ? 'bg-green-500' : 'bg-[#444]'}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white ${(config.cta1_enabled ?? true) ? 'translate-x-4 border border-green-500/10' : 'translate-x-1 border border-neutral-600/10'}`} />
                </button>
              </div>

              {(config.cta1_enabled ?? true) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="mb-0.5 block text-[10px] text-[var(--color-text-muted)] uppercase">ป้ายชื่อ (Label - EN)</label>
                    <input
                      value={config.cta1_label_en || ''}
                      onChange={(e) => onConfigChange({ ...config, cta1_label_en: e.target.value || undefined })}
                      placeholder="Explore Works"
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs text-[var(--color-text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="mb-0.5 block text-[10px] text-[var(--color-text-muted)] uppercase">ป้ายชื่อ (Label - TH)</label>
                    <input
                      value={config.cta1_label_th || ''}
                      onChange={(e) => onConfigChange({ ...config, cta1_label_th: e.target.value || undefined })}
                      placeholder="สำรวจผลงาน"
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs text-[var(--color-text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="mb-0.5 block text-[10px] text-[var(--color-text-muted)] uppercase">ลิงก์ปลายทาง (Link URL)</label>
                    <input
                      value={config.cta1_link || ''}
                      onChange={(e) => onConfigChange({ ...config, cta1_link: e.target.value || undefined })}
                      placeholder="/works"
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs text-[var(--color-text-primary)]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* CTA 2 (Latest Highlight) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[var(--color-text-primary)] uppercase">ปุ่มหลัก (Primary CTA)</span>
                </div>
                <button
                  type="button"
                  onClick={() => onConfigChange({ ...config, cta2_enabled: !(config.cta2_enabled ?? true) })}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full ${(config.cta2_enabled ?? true) ? 'bg-green-500' : 'bg-[#444]'}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white ${(config.cta2_enabled ?? true) ? 'translate-x-4 border border-green-500/10' : 'translate-x-1 border border-neutral-600/10'}`} />
                </button>
              </div>

              {(config.cta2_enabled ?? true) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="mb-0.5 block text-[10px] text-[var(--color-text-muted)] uppercase">ป้ายชื่อ (Label - EN)</label>
                    <input
                      value={config.cta2_label_en || ''}
                      onChange={(e) => onConfigChange({ ...config, cta2_label_en: e.target.value || undefined })}
                      placeholder="Latest Highlight"
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs text-[var(--color-text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="mb-0.5 block text-[10px] text-[var(--color-text-muted)] uppercase">ป้ายชื่อ (Label - TH)</label>
                    <input
                      value={config.cta2_label_th || ''}
                      onChange={(e) => onConfigChange({ ...config, cta2_label_th: e.target.value || undefined })}
                      placeholder="ไฮไลต์ล่าสุด"
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs text-[var(--color-text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="mb-0.5 block text-[10px] text-[var(--color-text-muted)] uppercase">ลิงก์ปลายทาง (Link URL)</label>
                    <input
                      value={config.cta2_link || ''}
                      onChange={(e) => onConfigChange({ ...config, cta2_link: e.target.value || undefined })}
                      placeholder="/works หรือลิงก์ภายนอก"
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs text-[var(--color-text-primary)]"
                    />
                  </div>
                </div>
              )}
            </div>

          </div>
        </>
      )}

      {config.type === 'slide' && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-[var(--color-text-muted)]">Autoplay (ms)</label>
            <input
              type="number"
              min={2000}
              max={15000}
              value={config.autoplayMs ?? 5000}
              onChange={(e) => onConfigChange({ ...config, autoplayMs: Number(e.target.value) })}
              data-testid="hero-slide-autoplay-input"
              className={`w-full rounded-lg border px-3 py-2 text-sm ${
                errors.fields.autoplayMs ? 'border-red-400' : 'border-[var(--color-border)]'
              } bg-[var(--color-panel)]`}
            />
            {errors.fields.autoplayMs ? <p className="mt-1 text-xs text-red-400">{errors.fields.autoplayMs}</p> : null}
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => onConfigChange({ ...config, showIndicators: !(config.showIndicators ?? true) })}
              data-testid="hero-slide-indicators-toggle"
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2 text-sm"
            >
              Indicators: {(config.showIndicators ?? true) ? 'เปิด' : 'ปิด'}
            </button>
          </div>
        </div>
      )}

      {config.type === 'video' && (
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-[var(--color-text-muted)]">videoUrl</label>
            <input
              value={config.videoUrl || ''}
              onChange={(e) => onConfigChange({ ...config, videoUrl: e.target.value || undefined })}
              data-testid="hero-video-url-input"
              className={`w-full rounded-lg border px-3 py-2 text-sm ${
                errors.fields.videoUrl ? 'border-red-400' : 'border-[var(--color-border)]'
              } bg-[var(--color-panel)]`}
              placeholder="https://example.com/video.mp4"
            />
            {errors.fields.videoUrl ? <p className="mt-1 text-xs text-red-400">{errors.fields.videoUrl}</p> : null}
          </div>
          <div>
            <label className="mb-1 block text-xs text-[var(--color-text-muted)]">posterUrl (optional)</label>
            <input
              value={config.posterUrl || ''}
              onChange={(e) => onConfigChange({ ...config, posterUrl: e.target.value || undefined })}
              data-testid="hero-video-poster-url-input"
              className={`w-full rounded-lg border px-3 py-2 text-sm ${
                errors.fields.posterUrl ? 'border-red-400' : 'border-[var(--color-border)]'
              } bg-[var(--color-panel)]`}
            />
            {errors.fields.posterUrl ? <p className="mt-1 text-xs text-red-400">{errors.fields.posterUrl}</p> : null}
          </div>
        </div>
      )}

      {config.type === 'image' && (
        <>
          <SourceSelector {...props} config={config} />
          <div>
            <label className="mb-1 block text-xs text-[var(--color-text-muted)]">clickUrl (optional)</label>
            <input
              value={config.clickUrl || ''}
              onChange={(e) => onConfigChange({ ...config, clickUrl: e.target.value || undefined })}
              data-testid="hero-image-click-url-input"
              className={`w-full rounded-lg border px-3 py-2 text-sm ${
                errors.fields.clickUrl ? 'border-red-400' : 'border-[var(--color-border)]'
              } bg-[var(--color-panel)]`}
              placeholder="https://..."
            />
            {errors.fields.clickUrl ? <p className="mt-1 text-xs text-red-400">{errors.fields.clickUrl}</p> : null}
          </div>
        </>
      )}

      <div className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3">
        <div>
          <p className="text-sm font-medium text-[var(--color-text-primary)]">แสดง Scroll Hint</p>
          <p className="text-xs text-[var(--color-text-muted)]">Scroll to Explore ที่ด้านล่าง</p>
        </div>
        <button
          type="button"
          onClick={() => onConfigChange({ ...config, showScrollHint: !(config.showScrollHint ?? true) })}
          data-testid="hero-show-scroll-hint-toggle"
          className={`relative inline-flex h-6 w-11 items-center rounded-full ${(config.showScrollHint ?? true) ? 'bg-green-500' : 'bg-[#444]'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white ${(config.showScrollHint ?? true) ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
    </div>
  );
}

