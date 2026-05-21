/**
 * Phase 7 — Legacy homepage JSONB migration (no dependency on homepage-sections).
 *
 * ## Migration playbook (add v2+ here)
 *
 * 1. Bump `HOMEPAGE_CONFIG_CURRENT_VERSION` in this file.
 * 2. Add `migrateV{n}ToV{n+1}` and register in `MIGRATION_STEPS`.
 * 3. Extend `SECTION_LAYOUT_MIGRATIONS` / `SECTION_THEME_MIGRATIONS` for renames.
 * 4. Run `npx tsc --noEmit` before deploy.
 *
 * ## Version history
 *
 * | Version | Meaning |
 * |---------|---------|
 * | 0 (implicit) | Pre-Phase-7: no `_version`, optional `_page`, boolean toggles |
 * | 1 | `_version` + `_page.motion/theme` + visual alias migration |
 */
import { HOMEPAGE_PAGE_CONFIG_KEY } from './visual/motion';

/** Reserved key for schema version inside `site_settings.homeSections` */
export const HOMEPAGE_CONFIG_VERSION_KEY = '_version';

/** Current version written on every serialize/save */
export const HOMEPAGE_CONFIG_CURRENT_VERSION = 1;

/** Implied version when `_version` is absent (pre-Phase-7 payloads) */
export const LEGACY_HOMEPAGE_CONFIG_VERSION = 0;

export type HomepageConfigMigrationResult = {
  raw: Record<string, unknown>;
  fromVersion: number;
  toVersion: number;
  warnings: string[];
};

/** Keep in sync with `HOMEPAGE_SECTION_IDS` in homepage-sections.ts */
const MIGRATABLE_SECTION_IDS = new Set([
  'about', 'stats', 'brands', 'profile', 'schedule', 'content', 'fashion', 'awards',
  'timeline', 'mediaTags', 'challenges', 'prizes', 'floatingArtistSelector', 'scrollToTop',
]);

const SECTION_LAYOUT_MIGRATIONS: Record<string, Record<string, string>> = {
  schedule: { grid: 'cards', horizontal: 'list' },
  timeline: { vertical: 'stacked', single: 'stacked' },
  brands: { grid: 'full-grid', full: 'full-grid' },
  challenges: { cards: 'grid' },
};

const SECTION_THEME_MIGRATIONS: Record<string, Record<string, string>> = {
  schedule: { default: 'light' },
  brands: { default: 'dark' },
  about: { solid: 'default' },
  prizes: { solid: 'default' },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function readStoredVersion(raw: unknown): number {
  if (!isRecord(raw)) return LEGACY_HOMEPAGE_CONFIG_VERSION;
  const version = raw[HOMEPAGE_CONFIG_VERSION_KEY];
  if (typeof version !== 'number' || !Number.isFinite(version) || version < 0) {
    return LEGACY_HOMEPAGE_CONFIG_VERSION;
  }
  return Math.floor(version);
}

function cloneRecord(raw: Record<string, unknown>): Record<string, unknown> {
  return { ...raw };
}

function ensurePageBucket(record: Record<string, unknown>, warnings: string[]): Record<string, unknown> {
  const next = cloneRecord(record);
  let page = next[HOMEPAGE_PAGE_CONFIG_KEY];

  if (page !== undefined && !isRecord(page)) {
    warnings.push('Invalid `_page` shape — reset to empty page config');
    page = {};
    next[HOMEPAGE_PAGE_CONFIG_KEY] = page;
  }

  const pageRecord = isRecord(page) ? { ...page } : {};

  if (next.pageMotion !== undefined) {
    if (pageRecord.motion === undefined) {
      pageRecord.motion = next.pageMotion;
      warnings.push('Migrated legacy root `pageMotion` → `_page.motion`');
    } else {
      warnings.push('Ignored legacy root `pageMotion` (`_page.motion` already set)');
    }
    delete next.pageMotion;
  }

  if (next.pageTheme !== undefined) {
    if (pageRecord.theme === undefined) {
      pageRecord.theme = next.pageTheme;
      warnings.push('Migrated legacy root `pageTheme` → `_page.theme`');
    } else {
      warnings.push('Ignored legacy root `pageTheme` (`_page.theme` already set)');
    }
    delete next.pageTheme;
  }

  next[HOMEPAGE_PAGE_CONFIG_KEY] = pageRecord;
  return next;
}

function hoistNestedSections(record: Record<string, unknown>, warnings: string[]): Record<string, unknown> {
  const nested = record.sections;
  if (!isRecord(nested)) return record;

  const next = cloneRecord(record);
  delete next.sections;

  for (const [key, value] of Object.entries(nested)) {
    if (next[key] === undefined) {
      next[key] = value;
    }
  }

  warnings.push('Migrated legacy nested `sections` object to top-level section keys');
  return next;
}

function migrateSectionVisualAliases(
  record: Record<string, unknown>,
  warnings: string[],
): Record<string, unknown> {
  const next = cloneRecord(record);

  for (const [key, value] of Object.entries(next)) {
    if (key === HOMEPAGE_PAGE_CONFIG_KEY || key === HOMEPAGE_CONFIG_VERSION_KEY) continue;
    if (!MIGRATABLE_SECTION_IDS.has(key)) continue;
    if (typeof value === 'boolean') continue;
    if (!isRecord(value)) continue;

    const sectionNext = { ...value };
    let changed = false;

    if (typeof sectionNext.layout === 'string') {
      const mapped = SECTION_LAYOUT_MIGRATIONS[key]?.[sectionNext.layout];
      if (mapped) {
        warnings.push(`${key}: migrated layout "${sectionNext.layout}" → "${mapped}"`);
        sectionNext.layout = mapped;
        changed = true;
      }
    }

    if (typeof sectionNext.theme === 'string') {
      const mapped = SECTION_THEME_MIGRATIONS[key]?.[sectionNext.theme];
      if (mapped) {
        warnings.push(`${key}: migrated theme "${sectionNext.theme}" → "${mapped}"`);
        sectionNext.theme = mapped;
        changed = true;
      }
    }

    if (changed) {
      next[key] = sectionNext;
    }
  }

  return next;
}

function migrateV0ToV1(raw: unknown, warnings: string[]): Record<string, unknown> {
  if (raw === null || raw === undefined) {
    warnings.push('Missing homepage config — using defaults');
    return {};
  }

  if (Array.isArray(raw)) {
    warnings.push('Invalid homepage config (array) — using defaults');
    return {};
  }

  if (!isRecord(raw)) {
    warnings.push('Invalid homepage config type — using defaults');
    return {};
  }

  let record = cloneRecord(raw);
  record = hoistNestedSections(record, warnings);
  record = ensurePageBucket(record, warnings);
  record = migrateSectionVisualAliases(record, warnings);
  record[HOMEPAGE_CONFIG_VERSION_KEY] = 1;
  return record;
}

type MigrationStep = {
  from: number;
  to: number;
  migrate: (raw: unknown, warnings: string[]) => Record<string, unknown>;
};

const MIGRATION_STEPS: MigrationStep[] = [
  { from: 0, to: 1, migrate: migrateV0ToV1 },
];

/** Upgrade legacy JSONB to latest raw shape (before section sanitize). */
export function migrateLegacyHomepageConfig(raw: unknown): HomepageConfigMigrationResult {
  const warnings: string[] = [];
  const originalVersion = readStoredVersion(raw);
  let fromVersion = originalVersion;
  let working: unknown = isRecord(raw) ? cloneRecord(raw) : raw;

  if (fromVersion > HOMEPAGE_CONFIG_CURRENT_VERSION) {
    warnings.push(
      `Homepage config version ${fromVersion} is newer than supported (${HOMEPAGE_CONFIG_CURRENT_VERSION}) — attempting best-effort normalize`,
    );
    fromVersion = HOMEPAGE_CONFIG_CURRENT_VERSION;
  }

  for (const step of MIGRATION_STEPS) {
    if (fromVersion > step.from) continue;
    if (step.from >= HOMEPAGE_CONFIG_CURRENT_VERSION) break;
    working = step.migrate(working, warnings);
    fromVersion = step.to;
  }

  return {
    raw: isRecord(working) ? working : {},
    fromVersion: originalVersion,
    toVersion: fromVersion,
    warnings,
  };
}
