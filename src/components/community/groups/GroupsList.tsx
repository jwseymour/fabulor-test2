'use client';

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { GroupNotificationsDropdown } from "./GroupNotificationsDropdown";
import { GroupInviteDialog } from "./GroupInviteDialog";

interface GroupsListProps {
  userId: string;
  groups: {
    id: string;
    name: string;
    owner: {
      username: string;
    };
    members: {
      user: {
        id: string;
        username: string;
      };
    }[];
  }[];
  invites: {
    id: string;
    group: {
      name: string;
      owner: {
        username: string;
      };
    };
  }[];
}

export function GroupsList({ userId, groups, invites }: GroupsListProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Groups</h2>
        <div className="flex gap-2">
          <GroupNotificationsDropdown 
            invites={invites}
            notificationCount={invites.length}
          />
          <GroupInviteDialog userId={userId} />
        </div>
      </div>

      <div className="grid gap-4">
        {groups.map((group) => (
          <Link key={group.id} href={`/community/groups/${group.id}`}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{group.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  {group.members.length} members • Owned by {group.owner.username}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}