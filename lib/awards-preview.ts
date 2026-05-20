import type { HomeAwardItem, HomeAwardPreviewItem } from './homepage-data';

export function awardArtistToActors(artist: string): string[] {
  const value = artist?.trim().toLowerCase();
  if (value === 'namtan') return ['namtan'];
  if (value === 'film') return ['film'];
  return ['namtan', 'film', 'both'];
}

export function normalizeHomeAwards(items: HomeAwardItem[]): HomeAwardPreviewItem[] {
  return (items ?? []).map((row) => ({
    id: row.id,
    year: row.year,
    title: row.title,
    award_name: row.title,
    ceremony: row.show,
    description: row.category,
    actors: awardArtistToActors(row.artist),
  }));
}
