import { 
  S3Client, 
  PutObjectCommand, 
  ListObjectsV2Command, 
  GetObjectCommand,
  DeleteObjectCommand 
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const REGION = import.meta.env.VITE_AWS_REGION
const BUCKET = import.meta.env.VITE_AWS_BUCKET
const ACCESS_KEY_ID = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;

if (!ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
  throw new Error('AWS credentials are required');
}

export const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

export async function uploadFileToS3(file: File, folder = "docs") {
  const key = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}_${file.name}`;
  const body = await file.arrayBuffer();
  
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: file.type,
      ContentDisposition: 'inline',
      Metadata: {
        originalName: file.name,
      },
    })
  );
  
  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ResponseContentDisposition: 'inline',
    }),
    { expiresIn: 604800 }
  );
  
  return { key, url };
}

export async function listFilesFromS3(folder = "docs") {
  try {
    const response = await s3.send(
      new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: folder + "/",
      })
    );
    return response.Contents || [];
  } catch (error) {
    return [];
  }
}

export async function getS3FileUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ResponseContentDisposition: 'inline',
  });
  
  const url = await getSignedUrl(s3, command, { expiresIn: 604800 });
  return url;
}

export async function getS3FileContent(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  
  const response = await s3.send(command);
  
  if (!response.Body) {
    throw new Error('No body in S3 response');
  }
  
  const body = await response.Body.transformToString();
  return body;
}

export async function deleteFileFromS3(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  
  await s3.send(command);
}