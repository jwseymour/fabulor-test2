'use client';

import { useState } from 'react';
import { getSignedUploadUrl } from '@/lib/s3';

export function FileUpload({ userId }: { userId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const signedUrl = await getSignedUploadUrl(userId, file.name);
      await fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });
      alert('File uploaded successfully!');
      setFile(null);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    }
    setUploading(false);
  };

  return (
    <div className="mb-4">
      <input type="file" onChange={handleFileChange} disabled={uploading} />
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
}