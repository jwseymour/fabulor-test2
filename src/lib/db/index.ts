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