'use client';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell } from "lucide-react";
import { updateGroupInviteAction } from "@/lib/actions/groups/updateInvite";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useState } from "react";

interface GroupInvite {
  id: string;
  group: {
    name: string;
    owner: {
      username: string;
    };
  };
}

interface GroupNotificationsDropdownProps {
  invites: GroupInvite[];
  notificationCount: number;
}

export function GroupNotificationsDropdown({ invites, notificationCount }: GroupNotificationsDropdownProps) {
  const router = useRouter();
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState<GroupInvite | null>(null);

  const handleResponse = async (inviteId: string, status: 'accepted' | 'rejected') => {
    if (status === 'rejected' && !showRejectDialog) {
      const invite = invites.find(i => i.id === inviteId);
      setSelectedInvite(invite || null);
      setShowRejectDialog(true);
      return;
    }
    await updateGroupInviteAction(inviteId, status);
    setShowRejectDialog(false);
    setSelectedInvite(null);
    router.refresh();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {invites.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 text-center">
              No pending group invites
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {invites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{invite.group.name}</span>
                    <span className="text-xs text-gray-500">by {invite.group.owner.username}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2"
                      onClick={() => handleResponse(invite.id, 'accepted')}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2"
                      onClick={() => handleResponse(invite.id, 'rejected')}
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

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Confirm Rejection</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject the invitation to join {selectedInvite?.group.name}?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleResponse(selectedInvite?.id || '', 'rejected')}
            >
              Reject Invite
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}