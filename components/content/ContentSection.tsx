import { ContentSectionClient } from './ContentSectionClient';
import { ContentItem } from '@/types';

export function ContentSection({ initialContent }: { initialContent?: ContentItem[] }) {
  // If no initialContent provided by parent, it will use its own internal logic or empty
  return <ContentSectionClient initialContent={initialContent ?? []} />;
}
