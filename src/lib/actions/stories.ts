'use server';

import { createStory, getUserStories } from '@/lib/db';
import prisma from '../db/prisma';

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

  export async function updateStoryAction(data: {
    id: string;
    title: string;
    content: string;
    visibility: string;
  }) {
    return await prisma.story.update({
      where: { id: data.id },
      data: {
        title: data.title,
        content: data.content,
        visibility: data.visibility,
      },
    });
  }

  export async function shareStoryAction(data: {
    storyId: string;
    shares: Array<{ id: string; type: 'user' | 'group' }>;
  }) {
    const shares = data.shares.map(share => ({
      storyId: data.storyId,
      sharedWith: share.id,
      type: share.type,
    }));
  
    return await prisma.$transaction(
      shares.map(share => 
        prisma.storyShare.create({
          data: share,
        })
      )
    );
  }