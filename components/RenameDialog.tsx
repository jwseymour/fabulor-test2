'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface RenameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (newName: string) => Promise<void>;
  currentName: string;
  isFolder: boolean;
}

export function RenameDialog({ open, onOpenChange, onSubmit, currentName, isFolder }: RenameDialogProps) {
  const [newName, setNewName] = useState(currentName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const validateName = (name: string) => {
    const regex = /^[a-zA-Z0-9_/-]+$/;
    return regex.test(name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    if (!validateName(newName)) {
      setError('Only letters, numbers, underscores, hyphens, and forward slashes are allowed');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalName = !isFolder && !newName.endsWith('.md') ? `${newName}.md` : newName;
      await onSubmit(finalName);
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
          <DialogTitle>Rename {isFolder ? 'Folder' : 'File'}</DialogTitle>
          <DialogDescription>
            Enter a new name for your {isFolder ? 'folder' : 'file'}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setError('');
              }}
              placeholder={`Enter new ${isFolder ? 'folder' : 'file'} name`}
              disabled={isSubmitting}
            />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!newName || isSubmitting}>
              Rename
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}