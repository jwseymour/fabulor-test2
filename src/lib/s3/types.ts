// src/lib/s3/types.ts
export interface FileNode {
    name: string;
    size: number;
    isFolder: boolean;
    children: FileNode[];
  }
  
  export interface S3Operation {
    userId: string;
    path: string;
  }