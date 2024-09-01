import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt-ts'

const prisma = new PrismaClient()

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