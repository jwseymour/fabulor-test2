'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { DeleteConfirmDialogProps } from '@/types/file-system';
import { Button } from '../../ui/button';

export function DeleteConfirmDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  itemName,
  itemType 
}: DeleteConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this {itemType}?
            {itemType === 'folder' && ' This will delete all files within the folder.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm font-mono">{itemName}</p>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleConfirm}
            >
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}