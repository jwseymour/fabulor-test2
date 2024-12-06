'use server';

import { createStory, getUserStories } from '@/lib/db';

export async function createStoryAction(data: {
  title: string;
  content: string;
  visibility: string;
  authorId: string;
}) {
  return await createStory(data);
}

export async function getFilteredStories(
    userId: string,
    search?: string,
    sortBy?: 'date' | 'title',
    sortOrder?: 'asc' | 'desc',
    visibility?: string
  ) {
    return await getUserStories(userId, {
      search,
      sortBy,
      sortOrder,
      visibility,
    });
  }