import { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand, DeleteObjectCommand, DeleteObjectsCommand, CopyObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";
import { NextResponse } from "next/server";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function createUserFolder(userId: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `users/${userId}/`,
    Body: '',
  });

  await s3Client.send(command);
}

export async function listUserFiles(userId: string) {
  const prefix = `users/${userId}/`;

  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME,
      Prefix: prefix,
    });

    const response = await s3Client.send(command);

    const files = response.Contents?.map(item => ({
      name: item.Key?.replace(prefix, '') || '',
      size: item.Size || 0,
    })).filter(file => file.name !== '') || [];

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
}
}

export async function getSignedUploadUrl(userId: string, fileName: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `users/${userId}/${fileName}`,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function getSignedDownloadUrl(userId: string, fileName: string) {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `users/${userId}/${fileName}`,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}
export async function saveFileContent(userId: string, fileName: string, content: string) {
  try {
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `users/${userId}/${fileName}`,
        Body: content,
        ContentType: 'text/plain',
      }
    });

    await upload.done();
    return true;
  } catch (error) {
    console.error('Error saving file:', error);
    throw error;
  }
}

export async function createFolder(userId: string, folderPath: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `users/${userId}/${folderPath}/`,
    Body: '',
  });

  await s3Client.send(command);
}

export async function deleteFile(userId: string, filePath: string) {
  const command = new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `users/${userId}/${filePath}`,
  });

  await s3Client.send(command);
}

export async function deleteFolder(userId: string, folderPath: string) {
  // List all objects in the folder
  const listCommand = new ListObjectsV2Command({
    Bucket: process.env.S3_BUCKET_NAME,
    Prefix: `users/${userId}/${folderPath}/`,
  });

  const objects = await s3Client.send(listCommand);

  // Delete all objects in the folder
  if (objects.Contents && objects.Contents.length > 0) {
    const deleteCommand = new DeleteObjectsCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Delete: {
        Objects: objects.Contents.map(obj => ({ Key: obj.Key! })),
      },
    });

    await s3Client.send(deleteCommand);
  }
}

export async function renameFile(userId: string, oldPath: string, newPath: string) {
  const oldKey = `users/${userId}/${oldPath}`;
  const newKey = `users/${userId}/${newPath}`;

  try {
    // First get the content of the old file
    const getCommand = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: oldKey,
    });

    const response = await s3Client.send(getCommand);
    const content = await response.Body?.transformToString();

    // Create the new file with the content
    const putCommand = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: newKey,
      Body: content || '',
    });

    await s3Client.send(putCommand);

    // Delete the old file
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: oldKey,
    });

    await s3Client.send(deleteCommand);
  } catch (error) {
    console.error('Error in renameFile:', error);
    throw error;
  }
}

export async function renameFolder(userId: string, oldPath: string, newPath: string) {
  const oldPrefix = `users/${userId}/${oldPath}${oldPath.endsWith('/') ? '' : '/'}`;
  const newPrefix = `users/${userId}/${newPath}${newPath.endsWith('/') ? '' : '/'}`;

  try {
    // List all objects in the folder
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME!,
      Prefix: oldPrefix,
    });

    const objects = await s3Client.send(listCommand);
    
    if (!objects.Contents || objects.Contents.length === 0) {
      // If it's an empty folder, just create a new empty marker
      await s3Client.send(new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: newPrefix,
        Body: '',
      }));
    } else {
      // Copy each object to the new location
      for (const object of objects.Contents) {
        if (!object.Key) continue;

        // Get the content of the old file
        const getCommand = new GetObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME!,
          Key: object.Key,
        });

        const response = await s3Client.send(getCommand);
        const content = await response.Body?.transformToString();

        // Create new file with content
        const newKey = object.Key.replace(oldPrefix, newPrefix);
        await s3Client.send(new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME!,
          Key: newKey,
          Body: content || '',
        }));
      }

      // Delete old objects
      await s3Client.send(new DeleteObjectsCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Delete: {
          Objects: objects.Contents.map(obj => ({ Key: obj.Key! })),
        },
      }));
    }
  } catch (error) {
    console.error('Error in renameFolder:', error);
    throw error;
  }
}