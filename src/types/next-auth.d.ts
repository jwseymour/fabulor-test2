import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    username: string
    // Add any other custom fields here
  }

  interface Session {
    user: User
  }
}