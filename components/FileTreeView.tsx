'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, FileIcon, FolderIcon, MoreHorizontal, Trash2 } from 'lucide-react';
import { getSignedDownloadUrl, saveFileContent, createFolder, deleteFile, deleteFolder, renameFile, renameFolder } from '@/lib/s3';
import { TextEditor } from './TextEditor';
import { NewFileDialog } from './NewFileDialog';
import { NewFolderDialog } from './NewFolderDialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { RenameDialog } from './RenameDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

type FileNode = {
  name: string;
  size: number;
  isFolder: boolean;
  children: FileNode[];
};

async function handleFileDownload(userId: string, fileName: string) {
  try {
    const signedUrl = await getSignedDownloadUrl(userId, fileName);
    window.open(signedUrl, '_blank');
  } catch (error) {
    console.error('Error downloading file:', error);
  }
}

async function fetchFileContent(userId: string, fileName: string): Promise<string> {
  try {
    const signedUrl = await getSignedDownloadUrl(userId, fileName);
    const response = await fetch(signedUrl);
    return await response.text();
  } catch (error) {
    console.error('Error fetching file content:', error);
    return '';
  }
}

export function FileTreeView({ fileTree, userId }: { fileTree: FileNode[], userId: string }) {
    const router = useRouter();
    const [selectedFile, setSelectedFile] = useState<{ name: string; content: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [selectedPath, setSelectedPath] = useState<string>('');
    const [showNewFileDialog, setShowNewFileDialog] = useState(false);
    const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ path: string; isFolder: boolean } | null>(null);
    const [showRenameDialog, setShowRenameDialog] = useState(false);
    const [itemToRename, setItemToRename] = useState<{ path: string; isFolder: boolean } | null>(null);

  const isTextFile = (fileName: string) => {
    const textExtensions = ['.txt', '.md', '.mdx'];
    return textExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  };

  const getExistingNamesInPath = (path: string): Set<string> => {
    const names = new Set<string>();
    
    const addNamesFromNode = (node: FileNode, currentPath: string = '') => {
      const nodePath = currentPath ? `${currentPath}/${node.name}` : node.name;
      if (parentPath(nodePath) === path) {
        names.add(node.name);
      }
      if (node.isFolder) {
        node.children.forEach(child => addNamesFromNode(child, nodePath));
      }
    };
  
    fileTree.forEach(node => addNamesFromNode(node));
    return names;
  };

  const handleFileClick = async (fileName: string) => {
    if (isTextFile(fileName)) {
      setIsLoading(true);
      try {
        const content = await fetchFileContent(userId, fileName);
        setSelectedFile({ name: fileName, content });
      } catch (error) {
        console.error('Error loading file:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      handleFileDownload(userId, fileName);
    }
  };

  const handleRowClick = (path: string, isFolder: boolean) => {
    setSelectedPath(parentPath(path));
    if (isFolder) {
        setSelectedPath(path);
        toggleFolder(path);
    } else {
        setSelectedPath(parentPath(path));
        handleFileClick(path);
    }
  };

  const parentPath = (path: string) => {
    const parts = path.split('/');
    return parts.slice(0, -1).join('/');
  };

  const handleRename = async (newName: string) => {
    if (!itemToRename) return;
    
    const oldPath = itemToRename.path;
    const parentDir = parentPath(oldPath);
    const currentName = oldPath.split('/').pop();
    
    // If the name hasn't changed, just close the dialog
    if (currentName === newName) {
      setShowRenameDialog(false);
      return;
    }
  
    const existingNames = getExistingNamesInPath(parentDir);
    
    if (existingNames.has(newName) && newName !== currentName) {
      throw new Error('An item with this name already exists in this location');
    }
  
    const newPath = parentDir ? `${parentDir}/${newName}` : newName;
  
    if (itemToRename.isFolder) {
      await renameFolder(userId, oldPath, newPath);
    } else {
      await renameFile(userId, oldPath, newPath);
    }
    router.refresh();
  };

  const handleDeleteClick = (path: string, isFolder: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    setItemToDelete({ path, isFolder });
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.isFolder) {
        await deleteFolder(userId, itemToDelete.path);
      } else {
        await deleteFile(userId, itemToDelete.path);
      }
      router.refresh();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleCreateFile = async (fileName: string) => {
    const existingNames = getExistingNamesInPath(selectedPath);
    if (existingNames.has(fileName)) {
      throw new Error('A file with this name already exists in this location');
    }
    const newPath = selectedPath ? `${selectedPath}/${fileName}` : fileName;
    await saveFileContent(userId, newPath, '');
    setShowNewFileDialog(false);
    router.refresh();
  };
  
  const handleCreateFolder = async (folderName: string) => {
    const existingNames = getExistingNamesInPath(selectedPath);
    if (existingNames.has(folderName)) {
      throw new Error('A folder with this name already exists in this location');
    }
    const newPath = selectedPath ? `${selectedPath}/${folderName}` : folderName;
    await createFolder(userId, newPath);
    setShowNewFolderDialog(false);
    router.refresh();
  };

  const toggleFolder = (path: string) => {
    const newExpandedFolders = new Set(expandedFolders);
    if (expandedFolders.has(path)) {
      newExpandedFolders.delete(path);
    } else {
      newExpandedFolders.add(path);
    }
    setExpandedFolders(newExpandedFolders);
  };

  const handleSave = async (content: string) => {
    if (selectedFile) {
      await saveFileContent(userId, selectedFile.name, content);
      setSelectedFile({ ...selectedFile, content });
    }
  };

  function renderFileTree(node: FileNode, parentPath: string = '', level: number = 0) {
    if (node.isFolder && node.children.length === 0 && node.name.endsWith('/')) {
      return null;
    }
  
    const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
    const isExpanded = expandedFolders.has(currentPath);
  
    return (
      <div key={currentPath}>
        <div 
          className={`
            group flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer
            ${selectedFile?.name === currentPath ? 'bg-blue-100' : ''}
            ${selectedPath === currentPath ? 'bg-gray-100' : ''}
          `}
          style={{ paddingLeft: `${level * 20}px` }}
          onClick={() => handleRowClick(currentPath, node.isFolder)}
        >
          {node.isFolder && (
            <div className="p-1 hover:bg-gray-200 rounded-sm mr-1">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </div>
          )}
          {node.isFolder ? (
            <>
              <FolderIcon className="h-4 w-4 text-yellow-500 mr-2" />
              <span className="text-gray-700">
                {node.name}
              </span>
            </>
          ) : (
            <>
              <FileIcon className="h-4 w-4 text-gray-400 ml-5 mr-2" />
              <span className="text-gray-700">
                {node.name}
              </span>
            </>
          )}
         <div className="ml-auto opacity-0 group-hover:opacity-100 flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setItemToRename({ path: currentPath, isFolder: node.isFolder });
                    setShowRenameDialog(true);
                  }}
                >
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(currentPath, node.isFolder, e);
                  }}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {node.isFolder && isExpanded && (
          <div className="border-l border-gray-200 ml-6">
            {node.children.map(child => renderFileTree(child, currentPath, level + 1))}
          </div>
        )}
      </div>
    );
}

  return (
    <div className="flex gap-4">
      <div className="w-1/3 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col h-full">
          <div className="p-2 border-b border-gray-200">
            <p className="text-sm text-gray-500">
              Current path: {selectedPath || '/'}
            </p>
          </div>
          <div className="flex-1 p-4 min-h-0 overflow-auto">
            {fileTree.map(node => renderFileTree(node))}
          </div>
          <div className="p-4 border-t border-gray-200 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewFileDialog(true)}
              className="flex-1"
            >
              New File
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewFolderDialog(true)}
              className="flex-1"
            >
              New Folder
            </Button>
          </div>
        </div>
      </div>
      <div className="w-2/3">
        {isLoading ? (
          <div className="flex items-center justify-center h-[500px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : selectedFile ? (
          <TextEditor
            content={selectedFile.content}
            onSave={handleSave}
            onClose={() => setSelectedFile(null)}
            fileName={selectedFile.name}
          />
        ) : (
          <div className="flex items-center justify-center h-[500px] text-gray-500">
            Select a text file to edit
          </div>
        )}
      </div>
      <NewFileDialog
        open={showNewFileDialog}
        onOpenChange={setShowNewFileDialog}
        onSubmit={handleCreateFile}
        currentPath={selectedPath}
      />
      <NewFolderDialog
        open={showNewFolderDialog}
        onOpenChange={setShowNewFolderDialog}
        onSubmit={handleCreateFolder}
        currentPath={selectedPath}
      />
      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        itemName={itemToDelete?.path || ''}
        itemType={itemToDelete?.isFolder ? 'folder' : 'file'}
      />
      <RenameDialog
        open={showRenameDialog}
        onOpenChange={setShowRenameDialog}
        onSubmit={handleRename}
        currentName={itemToRename?.path.split('/').pop() || ''}
        isFolder={itemToRename?.isFolder || false}
      />
    </div>
  );
}