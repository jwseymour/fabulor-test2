import { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
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