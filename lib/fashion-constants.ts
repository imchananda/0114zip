/** Sync with DB `fashion_events.category` and API validation */
export const FASHION_CATEGORY_IDS = [
  'evening_look',
  'street_style',
  'runway',
  'red_carpet',
  'casual',
  'accessories',
  'magazine',
] as const;

export type FashionCategoryId = (typeof FASHION_CATEGORY_IDS)[number];

export const FASHION_CATEGORY_LABELS: Record<FashionCategoryId, string> = {
  evening_look: 'Evening Look',
  street_style: 'Street Style',
  runway: 'Runway',
  red_carpet: 'Red Carpet',
  casual: 'Casual',
  accessories: 'Accessories',
  magazine: 'Magazine',
};
