'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { NewFolderDialogProps } from '@/types/file-system';

export function NewFolderDialog({ open, onOpenChange, onSubmit, currentPath }: NewFolderDialogProps) {
  const [folderName, setFolderName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const validateFolderName = (name: string) => {
    const regex = /^[a-zA-Z0-9_/-]+$/;
    return regex.test(name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName) return;

    if (!validateFolderName(folderName)) {
      setError('Only letters, numbers, underscores, hyphens, and forward slashes are allowed');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(folderName);
      setFolderName('');
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
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription>
            Enter a name for your new folder. It will be created in the current directory.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-500">Location</label>
            <p className="text-sm font-mono">{currentPath || '/'}</p>
          </div>
          <div>
            <Input
              value={folderName}
              onChange={(e) => {
                setFolderName(e.target.value);
                setError('');
              }}
              placeholder="Enter folder name"
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
                setFolderName('');
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!folderName || isSubmitting}>
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}