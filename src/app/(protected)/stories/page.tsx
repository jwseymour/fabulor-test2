import { auth } from '@/lib/auth/auth';
import { Session } from '@/types/auth';
import { getUserStories } from '@/lib/db';
import { StoriesList } from '@/components/stories/StoriesList';

export default async function StoriesPage() {
  const session = await auth() as Session | null;

  if (!session?.user) {
    return <div>Please log in to view this page.</div>;
  }

  const stories = await getUserStories(session.user.id);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white">
      <StoriesList initialStories={stories} userId={session.user.id} />
    </div>
  );
}