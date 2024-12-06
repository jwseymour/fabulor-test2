import prisma from './prisma'
import { hash } from 'bcrypt-ts'

export async function getUserFromEmail(email: string) {
  return await prisma.user.findUnique({ where: { email } })
}

export async function getUserFromUsername(username: string) {
  return await prisma.user.findUnique({ where: { username } })
}

export async function createUser(username: string, email: string, password: string) {
  const hashedPassword = await hash(password, 10)
  return await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
    },
  })
}

export async function getUserStories(
  userId: string,
  options?: {
    search?: string;
    sortBy?: 'date' | 'title';
    sortOrder?: 'asc' | 'desc';
    visibility?: string;
  }
) {
  const { search, sortBy = 'date', sortOrder = 'desc', visibility } = options || {};

  const where = {
    authorId: userId,
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
        { content: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
    ...(visibility && visibility !== 'all' && { visibility }),
  };

  return await prisma.story.findMany({
    where,
    orderBy: {
      [sortBy === 'date' ? 'createdAt' : 'title']: sortOrder,
    },
    include: {
      author: {
        select: {
          username: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });
}

export async function createStory(data: {
  title: string;
  content: string;
  visibility: string;
  authorId: string;
}) {
  return await prisma.story.create({
    data: {
      title: data.title,
      content: data.content,
      visibility: data.visibility,
      authorId: data.authorId,
    },
  });
}

// Friend Request Functions
export async function sendFriendRequest(senderId: string, receiverId: string) {
  // Check if they are already friends
  const existingFriendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { AND: [{ user1Id: senderId }, { user2Id: receiverId }] },
        { AND: [{ user1Id: receiverId }, { user2Id: senderId }] },
      ],
    },
  });

  if (existingFriendship) {
    throw new Error('Already friends');
  }

  // Check for existing friend request
  const existingRequest = await prisma.friendRequest.findFirst({
    where: {
      OR: [
        { AND: [{ senderId }, { receiverId }] },
        { AND: [{ senderId: receiverId }, { receiverId: senderId }] },
      ],
      status: 'pending',
    },
  });

  if (existingRequest) {
    throw new Error('Friend request already exists');
  }

  return await prisma.friendRequest.create({
    data: {
      senderId,
      receiverId,
    },
  });
}

export async function getFriendRequests(userId: string) {
  return await prisma.friendRequest.findMany({
    where: {
      OR: [
        { senderId: userId },
        { receiverId: userId },
      ],
    },
    include: {
      sender: {
        select: {
          username: true,
        },
      },
      receiver: {
        select: {
          username: true,
        },
      },
    },
  });
}

export async function updateFriendRequest(id: string, status: 'accepted' | 'rejected') {
  const request = await prisma.friendRequest.update({
    where: { id },
    data: { status },
  });

  if (status === 'accepted') {
    // Create friendship record
    await prisma.friendship.create({
      data: {
        user1Id: request.senderId,
        user2Id: request.receiverId,
      },
    });
  }

  return request;
}

export async function searchUsers(query: string, currentUserId: string) {
  // First get the IDs of all friends
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { user1Id: currentUserId },
        { user2Id: currentUserId },
      ],
    },
    select: {
      user1Id: true,
      user2Id: true,
    },
  });

  // Create array of friend IDs
  const friendIds = friendships.flatMap(friendship => [
    friendship.user1Id,
    friendship.user2Id,
  ]).filter(id => id !== currentUserId);

  // Get existing friend requests
  const existingRequests = await prisma.friendRequest.findMany({
    where: {
      OR: [
        { senderId: currentUserId },
        { receiverId: currentUserId },
      ],
      status: 'pending',
    },
    select: {
      senderId: true,
      receiverId: true,
    },
  });

  // Create array of users with pending requests
  const pendingRequestUserIds = existingRequests.flatMap(request => [
    request.senderId,
    request.receiverId,
  ]).filter(id => id !== currentUserId);

  // Search for users excluding current user, friends, and pending requests
  return await prisma.user.findMany({
    where: {
      AND: [
        {
          username: {
            startsWith: query,
            mode: 'insensitive',
          },
        },
        {
          id: {
            not: currentUserId,
            notIn: [...friendIds, ...pendingRequestUserIds],
          },
        },
      ],
    },
    select: {
      username: true,
    },
    take: 5,
  });
}

// Friends Functions
export async function getFriends(userId: string) {
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { user1Id: userId },
        { user2Id: userId },
      ],
    },
    include: {
      user1: {
        select: {
          id: true,
          username: true,
        },
      },
      user2: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  return friendships.map(friendship => {
    const friend = friendship.user1Id === userId ? friendship.user2 : friendship.user1;
    return {
      id: friend.id,
      username: friend.username,
      friendshipId: friendship.id,
    };
  });
}

export async function searchFriends(query: string, userId: string) {
  // Get all friendships for the user
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { user1Id: userId },
        { user2Id: userId },
      ],
    },
    include: {
      user1: {
        select: {
          id: true,
          username: true,
        },
      },
      user2: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  // Extract friends and filter by query
  const friends = friendships.map(friendship => {
    const friend = friendship.user1Id === userId ? friendship.user2 : friendship.user1;
    return {
      id: friend.id,
      username: friend.username,
    };
  }).filter(friend => 
    friend.username.toLowerCase().includes(query.toLowerCase())
  );

  return friends;
}

// Messaging Functions
export async function sendDirectMessage(senderId: string, receiverId: string, content: string) {
  return await prisma.message.create({
    data: {
      content,
      senderId,
      sharedWith: receiverId,
      type: 'user',
    },
  });
}

export async function getDirectMessages(userId1: string, userId2: string) {
  return await prisma.message.findMany({
    where: {
      type: 'user',
      OR: [
        {
          AND: [
            { senderId: userId1 },
            { sharedWith: userId2 },
          ],
        },
        {
          AND: [
            { senderId: userId2 },
            { sharedWith: userId1 },
          ],
        },
      ],
    },
    include: {
      sender: {
        select: {
          username: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
}

// Group Functions
export async function createGroup(name: string, ownerId: string, memberIds: string[]) {
  const group = await prisma.group.create({
    data: {
      name,
      ownerId,
      members: {
        create: [
          { userId: ownerId, role: 'owner' },
        ],
      },
      // Create invites for all members except owner
      invites: {
        create: memberIds.map(userId => ({
          userId,
        })),
      },
    },
  });

  return group;
}

export async function sendGroupMessage(groupId: string, senderId: string, content: string) {
  return await prisma.message.create({
    data: {
      content,
      senderId,
      sharedWith: groupId,
      type: 'group',
    },
  });
}

export async function getGroupMessages(groupId: string) {
  return await prisma.message.findMany({
    where: {
      sharedWith: groupId,
      type: 'group',
    },
    include: {
      sender: {
        select: {
          username: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
}

export async function getGroupInvites(userId: string) {
  return await prisma.groupInvite.findMany({
    where: {
      userId,
      status: 'pending',
    },
    include: {
      group: {
        select: {
          name: true,
          owner: {
            select: {
              username: true,
            },
          },
        },
      },
    },
  });
}

export async function respondToGroupInvite(inviteId: string, status: 'accepted' | 'rejected') {
  const invite = await prisma.groupInvite.update({
    where: { id: inviteId },
    data: { status },
  });

  if (status === 'accepted') {
    // Add user as group member
    await prisma.groupMember.create({
      data: {
        groupId: invite.groupId,
        userId: invite.userId,
        role: 'member',
      },
    });
  }

  return invite;
}

// Update getUserGroups to only return groups where user is a member
export async function getUserGroups(userId: string) {
  return await prisma.group.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      owner: {
        select: {
          username: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      },
      invites: {
        where: {
          status: 'pending',
        },
      },
    },
  });
}