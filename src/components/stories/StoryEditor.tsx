'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Save } from "lucide-react";
import MDEditor from '@uiw/react-md-editor';
import { createStoryAction } from '@/lib/actions/stories';

interface StoryEditorProps {
  userId: string;
}

export function StoryEditor({ userId }: StoryEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('private');
  const [isPreview, setIsPreview] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    if (!title || !content) return;
    
    setIsPublishing(true);
    try {
      await createStoryAction({
        title,
        content,
        visibility,
        authorId: userId,
      });
      
      router.push('/stories');
      router.refresh();
    } catch (error) {
      console.error('Error publishing story:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Create New Story</h1>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsPreview(!isPreview)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {isPreview ? 'Edit' : 'Preview'}
                </Button>
                <Select value={visibility} onValueChange={setVisibility}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="shared">Shared</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handlePublish} 
                  disabled={isPublishing || !title || !content}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isPublishing ? 'Publishing...' : 'Publish'}
                </Button>
              </div>
            </div>

            <Input
              placeholder="Story Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-semibold"
            />

            <div data-color-mode="light" className="min-h-[500px]">
              <MDEditor
                value={content}
                onChange={(val) => setContent(val || '')}
                preview={isPreview ? 'preview' : 'edit'}
                height={500}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}