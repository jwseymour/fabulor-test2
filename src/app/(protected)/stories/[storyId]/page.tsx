import { auth } from '@/lib/auth/auth';
import { Session } from '@/types/auth';
import { getStoryById, checkStoryAccess } from '@/lib/db';
import { StoryViewer } from '@/components/stories/StoryViewer';
import { notFound } from 'next/navigation';

export default async function StoryPage({
  params: { storyId },
}: {
  params: { storyId: string };
}) {
  const session = await auth() as Session | null;
  const story = await getStoryById(storyId);

  if (!story) {
    notFound();
  }

  // Check if user has access to the story
  const hasAccess = await checkStoryAccess(
    storyId,
    session?.user?.id
  );

  // If story is private and user doesn't have access, show error
  if (story.visibility === 'private' && !hasAccess) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          You don&apos;t have permission to view this story.
        </div>
      </div>
    );
  }

  const isAuthor = session?.user?.id === story.author.id;

  return <StoryViewer story={story} isAuthor={isAuthor} />;
}