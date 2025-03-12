import { auth } from '@/lib/auth/auth';
import { Session } from '@/types/auth';
import { getStoryById } from '@/lib/db';
import { StoryEditor } from '@/components/stories/StoryEditor';
import { redirect } from 'next/navigation';

export default async function EditStoryPage({
  params: { storyId },
}: {
  params: { storyId: string };
}) {
  const session = await auth() as Session | null;
  
  if (!session?.user) {
    redirect('/login');
  }

  const story = await getStoryById(storyId);

  if (!story || story.author.id !== session.user.id) {
    redirect('/stories');
  }
  console.log(story)

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white">
      <StoryEditor 
        userId={session.user.id} 
        story={story}
        isEditing={true}
      />
    </div>
  );
}