'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { SaveDialogProps } from '@/types/file-system';


export function SaveDialog({ open, onOpenChange, onSave, onDiscard, currentFileName }: SaveDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Save Changes?</DialogTitle>
          <DialogDescription>
            You have unsaved changes in &quot;{currentFileName}&quot;. Would you like to save them before continuing?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={onDiscard}
          >
            Don't Save
          </Button>
          <Button
            onClick={onSave}
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}