/** Sync with DB `fashion_events.category` and API validation */
export const FASHION_CATEGORY_IDS = [
  'evening_look',
  'street_style',
  'runway',
  'red_carpet',
  'casual',
  'accessories',
] as const;

export type FashionCategoryId = (typeof FASHION_CATEGORY_IDS)[number];
