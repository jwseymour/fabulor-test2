import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { compare } from 'bcrypt-ts'
import { getUserFromEmail, getUserFromUsername } from '@/lib/db'
import { authConfig } from 'app/auth.config'

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials: any) {
        const { email, password } = credentials
        let user
        if (email.includes('@')) {
          user = await getUserFromEmail(email)
        } else {
          user = await getUserFromUsername(email)
        }
        if (!user) return null
        const passwordsMatch = await compare(password, user.password)
        if (passwordsMatch) return { id: user.id.toString(), email: user.email, name: user.username }
        return null
      },
    }),
  ],
})