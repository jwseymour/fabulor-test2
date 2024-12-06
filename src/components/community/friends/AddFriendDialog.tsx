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
import { Plus, UserPlus } from "lucide-react";
import { sendFriendRequest, searchUsersAction } from '@/lib/actions/friends';

export function AddFriendDialog({ userId }: { userId: string }) {
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [suggestions, setSuggestions] = useState<{ username: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (username.length >= 2) {
        const results = await searchUsersAction(username, userId);
        setSuggestions(results);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [username]);

  const handleSendRequest = async () => {
    try {
      setStatus('loading');
      const result = await sendFriendRequest(username);
      
      if (result.error) {
        setStatus('error');
        setMessage(result.error);
      } else {
        setStatus('success');
        setMessage('Friend request sent!');
        setUsername('');
        setSuggestions([]);
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to send friend request');
    }
  };

  const handleSelectSuggestion = (selectedUsername: string) => {
    setUsername(selectedUsername);
    setShowSuggestions(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Friend
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a Friend</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <div className="flex gap-2">
              <Input
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Button onClick={handleSendRequest} disabled={status === 'loading'}>
                <UserPlus className="h-4 w-4 mr-2" />
                Send Request
              </Button>
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-[calc(100%-88px)] mt-1 bg-white rounded-md border border-gray-200 shadow-lg">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.username}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                    onClick={() => handleSelectSuggestion(suggestion.username)}
                  >
                    {suggestion.username}
                  </button>
                ))}
              </div>
            )}
          </div>
          {status !== 'idle' && (
            <p className={`text-sm ${status === 'error' ? 'text-red-500' : 'text-green-500'}`}>
              {message}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}