import { ContentSectionClient } from './ContentSectionClient';
import { series } from '@/data/series';
import { variety } from '@/data/variety';
import { events } from '@/data/events';
import { magazines } from '@/data/magazines';
import { awards } from '@/data/awards';

const allContent = [...series, ...variety, ...events, ...magazines, ...awards];

export function ContentSection() {
  return <ContentSectionClient initialContent={allContent} />;
}
