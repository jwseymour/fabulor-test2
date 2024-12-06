'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { createGroupAction, searchFriendsAction } from '@/lib/actions/groups';

interface Friend {
  id: string;
  username: string;
}

export function GroupInviteDialog({ userId }: { userId: string }) {
  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [search, setSearch] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>([]);
  const [suggestions, setSuggestions] = useState<Friend[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (search.length >= 2) {
        const results = await searchFriendsAction(search, userId);
        // Filter out already selected friends
        const filteredResults = results.filter(
            (friend: Friend) => !selectedFriends.some(selected => selected.id === friend.id)
        );
        setSuggestions(filteredResults);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [search, selectedFriends, userId]);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setStatus('error');
      setMessage('Group name is required');
      return;
    }

    try {
      setStatus('loading');
      const memberIds = selectedFriends.map(friend => friend.id);
      const result = await createGroupAction({
        name: groupName,
        ownerId: userId,
        memberIds,
      });
      
      if (result.error) {
        setStatus('error');
        setMessage(result.error);
      } else {
        setStatus('success');
        setMessage('Group created successfully!');
        setGroupName('');
        setSelectedFriends([]);
        setSearch('');
        router.refresh();
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to create group');
    }
  };

  const handleSelectFriend = (friend: Friend) => {
    setSelectedFriends([...selectedFriends, friend]);
    setSearch('');
    setShowSuggestions(false);
  };

  const handleRemoveFriend = (friendId: string) => {
    setSelectedFriends(selectedFriends.filter(f => f.id !== friendId));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Group
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Input
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
          <div className="relative">
            <Input
              placeholder="Search friends to invite..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white rounded-md border border-gray-200 shadow-lg">
                {suggestions.map((friend) => (
                  <button
                    key={friend.id}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                    onClick={() => handleSelectFriend(friend)}
                  >
                    {friend.username}
                  </button>
                ))}
              </div>
            )}
          </div>
          {selectedFriends.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Selected Friends:</p>
              <div className="flex flex-wrap gap-2">
                {selectedFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1"
                  >
                    <span className="text-sm">{friend.username}</span>
                    <button
                      onClick={() => handleRemoveFriend(friend.id)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {status !== 'idle' && (
            <p className={`text-sm ${status === 'error' ? 'text-red-500' : 'text-green-500'}`}>
              {message}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setGroupName('');
                setSelectedFriends([]);
                setSearch('');
                setStatus('idle');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateGroup}
              disabled={status === 'loading' || !groupName.trim()}
            >
              Create Group
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}