import { auth } from '@/lib/auth/auth';
import { Session } from '@/types/auth';
import { getStoryById } from '@/lib/db';
import prisma from '@/lib/db/prisma';
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

  // StoryEditor wants a display name for each share, so look them up
  const shares = await Promise.all(
    story.shares.map(async (share) => {
      const type = share.type as 'user' | 'group';
      const target =
        type === 'user'
          ? await prisma.user.findUnique({ where: { id: share.sharedWith }, select: { username: true } })
          : await prisma.group.findUnique({ where: { id: share.sharedWith }, select: { name: true } });
      const name = target ? ('username' in target ? target.username : target.name) : share.sharedWith;
      return { id: share.sharedWith, name, type };
    })
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white">
      <StoryEditor 
        userId={session.user.id} 
        story={{ ...story, shares }}
        isEditing={true}
      />
    </div>
  );
}