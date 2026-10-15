# Fabulor

Fabulor is a web app for writing stories and sharing them with friends and groups.

I worked on it from September 2024 to December 2024 and last touched it in March 2025. **It is unfinished.** Parts of it work, parts are half built, and I never wrote any tests. Right now `npm run build` fails on a type error (see "Build status").

## What's in it

These are based on what's in the code. I haven't re-tested all of them.

- **Login and registration.** NextAuth (v5 beta) with a credentials provider. You can sign in with an email or a username. Passwords are hashed with bcrypt.
- **Story editor.** Write stories in Markdown with `@uiw/react-md-editor`, with a preview. Stories can be created and edited.
- **Story visibility.** Each story is private, shared, or public. Shared stories can be shared with specific users or groups. I'm not sure the group sharing access check is correct.
- **Stories list.** Search, sort and filter by visibility.
- **Friends.** Search for users, send friend requests, accept or reject them, see your friends list.
- **Groups.** Create a group, invite friends, accept or reject invites, see your groups.
- **Dashboard.** Links to your files and stories. It's mostly static. The "Account Created" card just shows today's date, which is a bug.
- **File space.** Each user gets a folder in an S3 bucket. You can make folders, create text files and edit them in the browser, rename and delete files and folders, and download files through signed URLs. There's a signed upload helper in `src/lib/s3/operations.ts`, but no upload button uses it.

## Schema only, no working UI

The Prisma schema has a few models I never finished building on top of:

- **Comments** (`StoryComment`). The story list and viewer show a comment count, but there is no way to write or read comments.
- **Messages** (`Message`). There are database helper functions for direct and group messages in `src/lib/db/index.ts`, but nothing calls them. No UI.
- **Profiles** (`Profile`). The model exists. Nothing uses it. The "Profile" nav link goes nowhere.

The landing page buttons and the footer links (Terms, Privacy, Contact) don't go anywhere either.

## Stack

Next.js 14 (App Router), TypeScript, Tailwind, shadcn/ui components, Prisma with Postgres, NextAuth, AWS S3.

## Build status

I tried a fresh install and build in October 2026.

- `prisma generate` works.
- `next build` compiles but **fails the type check** in `src/app/(protected)/stories/[storyId]/edit/page.tsx`. The story editor expects each share to have a `name`, and the query doesn't return one. I haven't fixed it.
- `package-lock.json` is out of date. `pnpm-lock.yaml` is the current one, and it needs pnpm 9 or newer.

## Running it

This is how it's meant to work, but see above. It won't build until the type error is fixed.

You need a Postgres database and an S3 bucket.

```bash
cp .env.example .env     # fill in the values
npx pnpm@9 install
npx prisma migrate dev
npm run dev
```

Environment variables are listed in `.env.example`.

## Credits

I started from Vercel's [nextjs-postgres-auth-starter](https://github.com/vercel/nextjs-postgres-auth-starter) template (the first commit says "Created from https://vercel.com/new"). That repo doesn't have a licence file, so there's no licence text to carry over. Most of what's here now is code I added on top. I also switched the ORM from Drizzle to Prisma early on.

## License

MIT. See [LICENSE](LICENSE).
