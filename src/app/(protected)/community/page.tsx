import { auth } from '@/lib/auth/auth';
import { Session } from '@/types/auth';
import { getFriends, getFriendRequests, getUserGroups, getGroupInvites } from '@/lib/db';
import { GroupsList } from '@/components/community/groups/GroupsList';
import { FriendsList } from '@/components/community/friends/FriendsList';

export default async function CommunityPage() {
  const session = await auth() as Session | null;

  if (!session?.user) {
    return <div>Please log in to view this page.</div>;
  }

  const [friends, friendRequests, groups, groupInvites] = await Promise.all([
    getFriends(session.user.id),
    getFriendRequests(session.user.id),
    getUserGroups(session.user.id),
    getGroupInvites(session.user.id),
  ]);

  const pendingRequests = friendRequests.filter(
    (request) => request.receiverId === session.user.id && request.status === 'pending'
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <GroupsList 
            userId={session.user.id}
            groups={groups} 
            invites={groupInvites}
          />
        </div>
        <div className="space-y-6">
          <FriendsList 
            userId={session.user.id}
            friends={friends} 
            pendingRequests={pendingRequests.length}
            friendRequests={pendingRequests}
          />
        </div>
      </div>
    </div>
  );
}