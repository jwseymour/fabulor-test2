'use client';

import { FileIcon, FolderIcon } from 'lucide-react';
import { getSignedDownloadUrl } from '@/lib/s3';

type FileNode = {
  name: string;
  size: number;
  isFolder: boolean;
  children: FileNode[];
};

async function handleFileDownload(userId: string, fileName: string) {
  try {
    const signedUrl = await getSignedDownloadUrl(userId, fileName);
    console.log(fileName)
    window.open(signedUrl, '_blank');
  } catch (error) {
    console.error('Error downloading file:', error);
  }
}

export function FileTreeView({ fileTree, userId }: { fileTree: FileNode[], userId: string }) {
    function renderFileTree(node: FileNode, parentPath: string = '') {
      if (node.isFolder && node.children.length === 0 && node.name.endsWith('/')) {
        return null;
      }
  
      const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
  
      return (
        <div key={currentPath} className="ml-4">
          <div className="flex items-center">
            {node.isFolder ? (
              <FolderIcon className="h-4 w-4 mr-2" />
            ) : (
              <FileIcon className="h-4 w-4 mr-2" />
            )}
            {node.isFolder ? (
              <span>{node.name}</span>
            ) : (
              <button
                onClick={() => handleFileDownload(userId, currentPath)}
                className="text-blue-500 hover:underline focus:outline-none"
              >
                {node.name}
              </button>
            )}
            {!node.isFolder && <span className="ml-2 text-sm text-gray-500">({node.size} bytes)</span>}
          </div>
          {node.children.map(child => renderFileTree(child, currentPath))}
        </div>
      );
    }
  
    return (
      <div className="mt-4">
        {fileTree.map(node => renderFileTree(node))}
      </div>
    );
  }