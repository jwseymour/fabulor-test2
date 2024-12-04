// Basic File Types
export interface File {
    name: string;
    size: number;
  }
  
  export interface FileNode {
    name: string;
    size: number;
    isFolder: boolean;
    children: FileNode[];
  }
  
  // Operation Types
  export interface FileOperation {
    userId: string;
    path: string;
  }
  
  export interface RenameOperation extends FileOperation {
    newPath: string;
  }
  
  // Component Props Types
  export interface FileTreeViewProps {
    fileTree: FileNode[];
    userId: string;
  }
  
  export interface FileListProps {
    userId: string;
  }
  
  // Dialog Props Types
  export interface NewFileDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (fileName: string) => Promise<void>;
    currentPath: string;
  }
  
  export interface NewFolderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (folderName: string) => Promise<void>;
    currentPath: string;
  }
  
  export interface DeleteConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => Promise<void>;
    itemName: string;
    itemType: 'file' | 'folder';
  }
  
  export interface RenameDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (newName: string) => Promise<void>;
    currentName: string;
    isFolder: boolean;
  }
  
  // State Types
  export interface FileState {
    name: string;
    content: string;
  }
  
  export interface ItemToModify {
    path: string;
    isFolder: boolean;
  }