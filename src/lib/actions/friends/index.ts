'use server'

import { auth } from '@/lib/auth/auth';
import { getUserFromUsername, sendFriendRequest as dbSendFriendRequest, searchUsers } from '@/lib/db';

export async function sendFriendRequest(username: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: 'Not authenticated' };
  }

  const targetUser = await getUserFromUsername(username);
  if (!targetUser) {
    return { error: 'User not found' };
  }

  if (targetUser.id === session.user.id) {
    return { error: "You can't send a friend request to yourself" };
  }

  try {
    await dbSendFriendRequest(session.user.id, targetUser.id);
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Already friends') {
        return { error: 'You are already friends with this user' };
      }
      if (error.message === 'Friend request already exists') {
        return { error: 'A friend request already exists' };
      }
    }
    return { error: 'Failed to send friend request' };
  }
}

export async function searchUsersAction(query: string, userId: string) {
  if (!query || query.length < 2) return [];
  return await searchUsers(query, userId);
}