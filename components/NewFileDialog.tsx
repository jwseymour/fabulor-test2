'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface NewFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (fileName: string) => Promise<void>;
  currentPath: string;
}

export function NewFileDialog({ open, onOpenChange, onSubmit, currentPath }: NewFileDialogProps) {
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const validateFileName = (name: string) => {
    const regex = /^[a-zA-Z0-9_/-]+$/;
    return regex.test(name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName) return;
  
    if (!validateFileName(fileName)) {
      setError('Only letters, numbers, underscores, hyphens, and forward slashes are allowed');
      return;
    }
  
    setIsSubmitting(true);
    try {
      const finalName = fileName.endsWith('.md') ? fileName : `${fileName}.md`;
      await onSubmit(finalName);
      setFileName('');
      setError('');
      onOpenChange(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error creating file');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Create New File</DialogTitle>
          <DialogDescription>
            Enter a name for your new file. It will be created in the current directory.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-500">Location</label>
            <p className="text-sm font-mono">{currentPath || '/'}</p>
          </div>
          <div>
            <Input
              value={fileName}
              onChange={(e) => {
                setFileName(e.target.value);
                setError('');
              }}
              placeholder="Enter file name (will be saved as .md)"
              disabled={isSubmitting}
            />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setError('');
                setFileName('');
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!fileName || isSubmitting}>
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}