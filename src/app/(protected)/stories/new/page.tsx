import { auth } from '@/lib/auth/auth';
import { Session } from '@/types/auth';
import { StoryEditor } from '@/components/stories/StoryEditor';

export default async function NewStoryPage() {
  const session = await auth() as Session | null;

  if (!session?.user) {
    return <div>Please log in to view this page.</div>;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white">
      <StoryEditor userId={session.user.id} />
    </div>
  );
}