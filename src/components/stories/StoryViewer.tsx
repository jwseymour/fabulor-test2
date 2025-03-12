'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import MDEditor from '@uiw/react-md-editor';
import Link from 'next/link';

interface Story {
  id: string;
  title: string;
  content: string;
  visibility: string;
  createdAt: Date;
  author: {
    id: string;
    username: string;
  };
  _count: {
    comments: number;
  };
}

interface StoryViewerProps {
  story: Story;
  isAuthor: boolean;
}

export function StoryViewer({ story, isAuthor }: StoryViewerProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">{story.title}</CardTitle>
              <CardDescription className="text-sm mt-2">
                By {story.author.username} • {formatDate(story.createdAt)} • 
                {story._count.comments} comments • {story.visibility}
              </CardDescription>
            </div>
            {isAuthor && (
              <Link href={`/stories/${story.id}/edit`}>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Story
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div data-color-mode="light">
            <MDEditor.Markdown 
              source={story.content} 
              style={{ padding: '20px 0' }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}