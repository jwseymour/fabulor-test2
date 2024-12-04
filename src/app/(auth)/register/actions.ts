'use server'

import { createUser, getUserFromEmail, getUserFromUsername } from '@/lib/db';
import { createUserFolder } from '@/lib/s3/operations';
import { redirect } from 'next/navigation';

export async function registerAction(formData: FormData) {
  const username = formData.get('username') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Check if username is valid
  if (username.includes('@')) {
    return { error: 'Username cannot contain @' };
  }

  // Check if username or email already exists
  const existingUser = await getUserFromEmail(email)
  const existingUsername = await getUserFromUsername(username)

  if (existingUser) {
    return { error: 'Email already in use' };
  }

  if (existingUsername) {
    return { error: 'Username already taken' };
  }

  const user = await createUser(username, email, password)
  await createUserFolder(user.id.toString())
  redirect('/login')
}