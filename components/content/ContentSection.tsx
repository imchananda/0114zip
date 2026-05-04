import { ContentSectionClient } from './ContentSectionClient';
import { ContentItem } from '@/types';

export function ContentSection({ initialContent, config }: { initialContent?: ContentItem[]; config?: { limit?: number } }) {
  // If no initialContent provided by parent, it will use its own internal logic or empty
  return <ContentSectionClient initialContent={initialContent ?? []} config={config} />;
}
