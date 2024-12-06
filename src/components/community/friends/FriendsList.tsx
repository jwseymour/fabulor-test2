import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { getFriends } from "@/lib/db";
import { AddFriendDialog } from "./AddFriendDialog";
import { FriendRequestsDropdown } from "./FriendRequestsDropdown";

interface FriendsListProps {
  userId: string;
  friends: Awaited<ReturnType<typeof getFriends>>;
  pendingRequests: number;
  friendRequests: {
    id: string;
    sender: {
      username: string;
    };
    receiver: {
      username: string;
    };
    status: string;
    receiverId: string;
  }[];
}

export function FriendsList({ 
  userId,
  friends, 
  pendingRequests, 
  friendRequests,
}: FriendsListProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Friends</h2>
        <div className="flex gap-2">
          <FriendRequestsDropdown 
            requests={friendRequests}
            pendingCount={pendingRequests}
          />
          <AddFriendDialog userId={userId}/>
        </div>
      </div>

      <div className="grid gap-4">
        {friends.map((friend) => (
          <Card key={friend.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{friend.username}</CardTitle>
                <Button variant="ghost" size="icon">
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}