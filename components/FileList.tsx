import { FileTreeView } from './FileTreeView';
import { listUserFiles } from '@/lib/s3';

type File = {
  name: string;
  size: number;
};

type FileNode = {
  name: string;
  size: number;
  isFolder: boolean;
  children: FileNode[];
};

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

export async function FileList({ userId }: { userId: string }) {
  const response = await listUserFiles(userId);
  const { files } = await response.json();
  const fileTree = buildFileTree(files);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Your Files</h2>
      <FileTreeView fileTree={fileTree} userId={userId} />
    </div>
  );
}