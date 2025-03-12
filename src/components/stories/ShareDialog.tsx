'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Share2 } from "lucide-react";
import { getUserGroupsAction, searchFriendsAction } from '@/lib/actions/groups';

interface ShareDialogProps {
    userId: string;
    onShare: (shares: Array<{ id: string; name: string; type: 'user' | 'group' }>) => void;
    pendingShares: Array<{ id: string; name: string; type: 'user' | 'group' }>;
    existingShares?: Array<{ id: string; name: string; type: 'user' | 'group' }>;
  }
  
  export function ShareDialog({ userId, onShare, pendingShares, existingShares = [] }: ShareDialogProps) {
    const [open, setOpen] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<Array<{ id: string; username: string }>>(
      pendingShares.filter(s => s.type === 'user').map(s => ({ id: s.id, username: s.name }))
    );
    const [selectedGroups, setSelectedGroups] = useState<Array<{ id: string; name: string }>>(
      pendingShares.filter(s => s.type === 'group').map(s => ({ id: s.id, name: s.name }))
    );
    const [search, setSearch] = useState('');
    const [userSuggestions, setUserSuggestions] = useState<Array<{ id: string; username: string }>>([]);
    const [groups, setGroups] = useState<Array<{ id: string; name: string }>>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
      const loadGroups = async () => {
        const userGroups = await getUserGroupsAction(userId);
        setGroups(userGroups);
      };
      loadGroups();
    }, [userId]);

    useEffect(() => {
        const searchUsers = async () => {
          if (search.length >= 2) {
            const results = await searchFriendsAction(search, userId);
            const filteredResults = results.filter(
              user => 
                !selectedUsers.some(selected => selected.id === user.id) &&
                !existingShares.some(share => share.type === 'user' && share.id === user.id)
            );
            setUserSuggestions(filteredResults);
            setShowSuggestions(true);
          } else {
            setUserSuggestions([]);
            setShowSuggestions(false);
          }
        };
    
        const debounceTimer = setTimeout(searchUsers, 300);
        return () => clearTimeout(debounceTimer);
      }, [search, selectedUsers, userId, existingShares]);

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
          // Reset to initial pending shares
          setSelectedUsers(
            pendingShares.filter(s => s.type === 'user').map(s => ({ id: s.id, username: s.name }))
          );
          setSelectedGroups(
            pendingShares.filter(s => s.type === 'group').map(s => ({ id: s.id, name: s.name }))
          );
          setSearch('');
          setShowSuggestions(false);
        }
        setOpen(newOpen);
      };

    const handleConfirm = () => {
      const shares = [
        ...selectedUsers.map(u => ({ id: u.id, name: u.username, type: 'user' as const })),
        ...selectedGroups.map(g => ({ id: g.id, name: g.name, type: 'group' as const })),
      ];
      onShare(shares);
      setOpen(false);
    };

    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Story</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Input
                placeholder="Search friends..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {showSuggestions && userSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border">
                  {userSuggestions.map((user) => (
                    <button
                      key={user.id}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100"
                      onClick={() => {
                        setSelectedUsers([...selectedUsers, user]);
                        setSearch('');
                        setShowSuggestions(false);
                      }}
                    >
                      {user.username}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Groups section */}
            {groups.length > 0 && (
                <div className="space-y-2">
                <p className="text-sm font-medium">Groups:</p>
                <div className="flex flex-wrap gap-2">
                    {groups
                    .filter(group => !existingShares.some(share => 
                        share.type === 'group' && share.id === group.id
                    ))
                    .map((group) => (
                        <button
                        key={group.id}
                        onClick={() => {
                            if (selectedGroups.some(g => g.id === group.id)) {
                            setSelectedGroups(selectedGroups.filter(g => g.id !== group.id));
                            } else {
                            setSelectedGroups([...selectedGroups, group]);
                            }
                        }}
                        className={`px-3 py-1 rounded-full text-sm ${
                            selectedGroups.some(g => g.id === group.id)
                            ? 'bg-primary text-white'
                            : 'bg-gray-100'
                        }`}
                        >
                        {group.name}
                        </button>
                    ))}
                </div>
                </div>
            )}

            {/* Existing shares section */}
            {existingShares.length > 0 && (
                <div className="space-y-2">
                <p className="text-sm font-medium">Already shared with:</p>
                <div className="flex flex-wrap gap-2">
                    {existingShares.map((share) => (
                    <div
                        key={`${share.type}-${share.id}`}
                        className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3 py-1"
                    >
                        <span className="text-sm text-gray-600">{share.name}</span>
                    </div>
                    ))}
                </div>
                </div>
            )}

            {(selectedUsers.length > 0 || selectedGroups.length > 0) && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Will be shared with:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1"
                    >
                      <span className="text-sm">{user.username}</span>
                      <button
                        onClick={() => setSelectedUsers(selectedUsers.filter(u => u.id !== user.id))}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {selectedGroups.map((group) => (
                    <div
                      key={group.id}
                      className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1"
                    >
                      <span className="text-sm">{group.name}</span>
                      <button
                        onClick={() => setSelectedGroups(selectedGroups.filter(g => g.id !== group.id))}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                onClick={handleConfirm}
                disabled={selectedUsers.length === 0 && selectedGroups.length === 0}
              >
                Confirm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
}