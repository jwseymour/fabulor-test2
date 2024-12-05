import { FileTreeView } from './FileTreeView';
import { listUserFiles } from '@/lib/s3/operations';
import { File, FileNode, FileListProps } from '@/types/file-system';

function buildFileTree(files: File[]): FileNode[] {
  const root: FileNode[] = [];

  files.forEach(file => {
    const parts = file.name.split('/').filter(Boolean);
    let currentLevel = root;

    parts.forEach((part, index) => {
      const isLastPart = index === parts.length - 1;
      let node = currentLevel.find(n => n.name === part);

      if (!node) {
        node = {
          name: part,
          size: isLastPart ? file.size : 0,
          isFolder: !isLastPart || file.name.endsWith('/'),
          children: [],
        };
        currentLevel.push(node);
      }

      if (!isLastPart) {
        currentLevel = node.children;
      }
    });
  });

  return root;
}

export async function FileList({ userId }: FileListProps) {
  try {
    const response = await listUserFiles(userId);
    const data = await response.json();
    
    if (!data.files) {
      return (
        <div className="p-4">
          <p className="text-gray-500">No files found or error loading files.</p>
        </div>
      );
    }

    const fileTree = buildFileTree(data.files);
    return <FileTreeView fileTree={fileTree} userId={userId} />;
  } catch (error) {
    console.error('Error in FileList:', error);
    return (
      <div className="p-4">
        <p className="text-red-500">Error loading files. Please try again later.</p>
      </div>
    );
  }
}