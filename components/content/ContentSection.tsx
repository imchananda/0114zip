import { ContentSectionClient } from './ContentSectionClient';
import { getAllContent } from '@/lib/google-sheets';

export async function ContentSection() {
  const allContent = await getAllContent();

  return <ContentSectionClient initialContent={allContent} />;
}
