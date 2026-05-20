/** Legacy content_items types — use /admin/fashion and /admin/awards instead */
export const LEGACY_CONTENT_TYPES = ['magazine', 'award'] as const;

export type LegacyContentType = (typeof LEGACY_CONTENT_TYPES)[number];

/** Active types managed in /admin/content */
export const ADMIN_CONTENT_TYPES = ['series', 'variety', 'music'] as const;

export type AdminContentType = (typeof ADMIN_CONTENT_TYPES)[number];

export function isLegacyContentType(value: unknown): value is LegacyContentType {
  return value === 'magazine' || value === 'award';
}
