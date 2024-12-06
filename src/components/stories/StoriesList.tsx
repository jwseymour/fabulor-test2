'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, SortAsc, SortDesc, Plus } from "lucide-react";
import Link from "next/link";
import { getFilteredStories } from '@/lib/actions/stories';
import { useDebounce } from '@/lib/hooks/useDebounce';

interface Story {
    id: string;
    title: string;
    content: string;
    visibility: string;
    createdAt: Date;
    author: {
      username: string;
    };
    _count: {
      comments: number;
    };
  }

interface StoriesListProps {
  initialStories: Story[];
  userId: string; // Add userId prop
}

export function StoriesList({ initialStories, userId }: StoriesListProps) {
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [visibility, setVisibility] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const fetchStories = async () => {
      setIsLoading(true);
      try {
        const filteredStories = await getFilteredStories(
          userId,
          debouncedSearch,
          sortBy,
          sortOrder,
          visibility
        );
        setStories(filteredStories);
      } catch (error) {
        console.error('Error fetching stories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStories();
  }, [debouncedSearch, sortBy, sortOrder, visibility, userId]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getExcerpt = (content: string) => {
    const plainText = content.replace(/---[\s\S]*?---/, '').trim();
    return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Stories</h1>
          <p className="text-gray-500">Write, manage and share your stories</p>
        </div>
        <Link href="/stories/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Story
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search stories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={(value: 'date' | 'title') => setSortBy(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>
            <Select value={visibility} onValueChange={setVisibility}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="shared">Shared</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading stories...</p>
        </div>
      )}

      {/* Stories Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <Link key={story.id} href={`/stories/${story.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{story.title}</CardTitle>
                      <CardDescription className="text-sm text-gray-500">
                        {formatDate(story.createdAt)}
                      </CardDescription>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                      {story.visibility}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">{getExcerpt(story.content)}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{story._count.comments} comments</span>
                    <span>by {story.author.username}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {!isLoading && stories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No stories found</p>
        </div>
      )}
    </div>
  );
}