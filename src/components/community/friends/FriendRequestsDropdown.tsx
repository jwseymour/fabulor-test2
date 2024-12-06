'use client';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell } from "lucide-react";
import { updateFriendRequestAction } from "@/lib/actions/friends/updateRequest";
import { useRouter } from "next/navigation";

interface FriendRequest {
  id: string;
  sender: {
    username: string;
  };
  receiver: {
    username: string;
  };
  status: string;
  receiverId: string;
}

interface FriendRequestsDropdownProps {
  requests: FriendRequest[];
  pendingCount: number;
}

export function FriendRequestsDropdown({ requests, pendingCount }: FriendRequestsDropdownProps) {
  const router = useRouter();

  const handleResponse = async (requestId: string, status: 'accepted' | 'rejected') => {
    await updateFriendRequestAction(requestId, status);
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {requests.length === 0 ? (
          <div className="p-4 text-sm text-gray-500 text-center">
            No pending friend requests
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {requests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100">
                <span className="text-sm font-medium">{request.sender.username}</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2"
                    onClick={() => handleResponse(request.id, 'accepted')}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2"
                    onClick={() => handleResponse(request.id, 'rejected')}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}