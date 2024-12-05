'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, ChevronLeft, FileIcon, FolderIcon, MoreHorizontal } from 'lucide-react';
import { getSignedDownloadUrl, saveFileContent, createFolder, deleteFile, deleteFolder, renameFile, renameFolder } from '@/lib/s3/operations';
import { TextEditor } from './TextEditor';
import { NewFileDialog } from './dialogs/NewFileDialog';
import { NewFolderDialog } from './dialogs/NewFolderDialog';
import { DeleteConfirmDialog } from './dialogs/DeleteConfirmDialog';
import { RenameDialog } from './dialogs/RenameDialog';
import { SaveDialog } from './dialogs/SaveDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { FileTreeViewProps, FileState, ItemToModify, FileNode } from '@/types/file-system';

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
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [selectedFile, setSelectedFile] = useState<FileState | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [pendingFileSelection, setPendingFileSelection] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ItemToModify | null>(null);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [itemToRename, setItemToRename] = useState<ItemToModify | null>(null);

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
    if (hasUnsavedChanges) {
      setPendingFileSelection(fileName);
      setShowSaveDialog(true);
      return;
    }
    await loadFile(fileName);
  };

  const loadFile = async (fileName: string) => {
    if (isTextFile(fileName)) {
      setIsLoading(true);
      try {
        const content = await fetchFileContent(userId, fileName);
        setSelectedFile({ name: fileName, content, date: selectedFile?.date || new Date().toISOString().split('T')[0] });
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

  const handleSaveDialogAction = async (shouldSave: boolean) => {
    if (shouldSave && selectedFile) {
      const metadataContent = `---\ndate: ${selectedFile.date}\n---\n\n${selectedFile.content}`;
      await handleSave(metadataContent);
    }
    setShowSaveDialog(false);
    if (pendingFileSelection) {
      await loadFile(pendingFileSelection);
      setPendingFileSelection(null);
    }
    setHasUnsavedChanges(false);
  };

  const handleCreateFile = async (fileName: string) => {
    const existingNames = getExistingNamesInPath(selectedPath);
    if (existingNames.has(fileName)) {
      throw new Error('A file with this name already exists in this location');
    }
    const newPath = selectedPath ? `${selectedPath}/${fileName}` : fileName;
    const currentDate = new Date().toISOString().split('T')[0];
    const initialContent = `---\ndate: ${currentDate}\n---\n\n`;
    await saveFileContent(userId, newPath, initialContent);
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

  const handleSave = async (content: string, newFileName?: string, newDate?: string) => {
    if (selectedFile) {
      const fileName = newFileName || selectedFile.name;
      if (newFileName && newFileName !== selectedFile.name) {
        await renameFile(userId, selectedFile.name, newFileName);
      }
      await saveFileContent(userId, fileName, content);
      setSelectedFile({ name: fileName, content, date: selectedFile?.date });
      if (newFileName) {
        router.refresh();
      }
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
            group flex items-center py-1.5 px-2 cursor-pointer
            hover:bg-[#E6F0FF] rounded-sm
            ${selectedFile?.name === currentPath ? 'bg-[#E6F0FF]' : ''}
            ${selectedPath === currentPath ? 'bg-[#F0F0F0]' : ''}
          `}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => handleRowClick(currentPath, node.isFolder)}
        >
          {node.isFolder && (
            <div className="p-1 hover:bg-[#D1E3FF] rounded-sm">
              {isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 text-[#2B579A]" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-[#2B579A]" />
              )}
            </div>
          )}
          {node.isFolder ? (
            <>
              <FolderIcon className="h-4 w-4 text-[#2B579A] mr-2" />
              <span className="text-sm text-gray-700">
                {node.name}
              </span>
            </>
          ) : (
            <>
              <FileIcon className="h-4 w-4 text-gray-400 ml-4 mr-2" />
              <span className="text-sm text-gray-700">
                {node.name}
              </span>
            </>
          )}
          <div className="ml-auto opacity-0 group-hover:opacity-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-[#D1E3FF]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3.5 w-3.5 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setItemToRename({ path: currentPath, isFolder: node.isFolder });
                    setShowRenameDialog(true);
                  }}
                  className="text-sm"
                >
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-sm text-red-600"
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
          <div>
            {node.children.map(child => renderFileTree(child, currentPath, level + 1))}
          </div>
        )}
      </div>
    );
}

return (
  <div className="flex h-[calc(100vh-4rem)] relative">
    {/* Sidebar */}
    <div className={`
      ${isSidebarVisible ? 'w-72' : 'w-0'} 
      transition-all duration-300 ease-in-out
      bg-[#F3F3F3] border-r border-[#E1E1E1] flex flex-col
      overflow-hidden
      max-[500px]:z-10
      max-[500px]:absolute max-[500px]:h-full
      max-[500px]:left-0
      min-[501px]:relative
    `}>
      <div className="p-4 border-b border-[#E1E1E1] bg-white">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarVisible(!isSidebarVisible)}
            className="h-8 w-8 p-0 hover:bg-[#E6F0FF]"
          >
            <ChevronLeft className="h-5 w-5 text-[#2B579A]" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold text-[#2B579A]">Your Files</h2>
            <p className="text-sm text-gray-500">
              Current path: {selectedPath || '/'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {fileTree.map(node => renderFileTree(node))}
        </div>
      </div>

      <div className="p-3 border-t border-[#E1E1E1] bg-white space-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowNewFileDialog(true)}
          className="w-full bg-white hover:bg-[#F5F5F5] border-[#D1D1D1]"
        >
          <FileIcon className="h-4 w-4 mr-2" />
          New File
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowNewFolderDialog(true)}
          className="w-full bg-white hover:bg-[#F5F5F5] border-[#D1D1D1]"
        >
          <FolderIcon className="h-4 w-4 mr-2" />
          New Folder
        </Button>
      </div>
    </div>

    {/* Content Area */}
    <div className={`
      bg-white
      max-[500px]:absolute max-[500px]:inset-0
      min-[501px]:flex-1
    `}>
      {!isSidebarVisible && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsSidebarVisible(true)}
          className="absolute top-4 left-4 z-20 hover:bg-[#E6F0FF]"
        >
          <ChevronRight className="h-5 w-5 text-[#2B579A]" />
        </Button>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B579A]"></div>
        </div>
      ) : selectedFile ? (
        <div className="h-full">
          <TextEditor
            content={selectedFile.content}
            fileName={selectedFile.name}
            onSave={handleSave}
            onClose={() => setSelectedFile(null)}
            hasUnsavedChanges={hasUnsavedChanges}
            onUnsavedChanges={setHasUnsavedChanges}
            onContentChange={(content, date) => {
              setSelectedFile(prev => prev ? { ...prev, content, date } : null);
            }}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <FileIcon className="h-16 w-16 mb-4 text-gray-300" />
          <p className="text-lg">Select a text file to edit</p>
          <p className="text-sm mt-2">or create a new one using the sidebar</p>
        </div>
      )}
    </div>

    {/* Keep existing dialogs */}
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
    <SaveDialog
      open={showSaveDialog}
      onOpenChange={setShowSaveDialog}
      onSave={() => handleSaveDialogAction(true)}
      onDiscard={() => handleSaveDialogAction(false)}
      currentFileName={selectedFile?.name || ''}
    />
  </div>
);
}