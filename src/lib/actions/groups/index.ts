'use server'

import { auth } from '@/lib/auth/auth';
import { createGroup, searchFriends, getUserGroups } from '@/lib/db';

export async function createGroupAction({ 
  name, 
  ownerId, 
  memberIds 
}: { 
  name: string; 
  ownerId: string; 
  memberIds: string[]; 
}) {
  try {
    await createGroup(name, ownerId, memberIds);
    return { success: true };
  } catch (error) {
    return { error: 'Failed to create group' };
  }
}

export async function getUserGroupsAction(userId: string) {
    return await getUserGroups(userId);
  }
  

export async function searchFriendsAction(query: string, userId: string) {
  if (!query || query.length < 2) return [];
  return await searchFriends(query, userId);
}