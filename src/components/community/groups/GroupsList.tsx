import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, Bell } from "lucide-react";
import Link from "next/link";
import { getUserGroups } from "@/lib/db";

interface GroupsListProps {
  groups: Awaited<ReturnType<typeof getUserGroups>>;
  notifications?: number;
}

export function GroupsList({ groups, notifications = 0 }: GroupsListProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Groups</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {notifications}
              </span>
            )}
          </Button>
          <Button size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> New Group
          </Button>
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