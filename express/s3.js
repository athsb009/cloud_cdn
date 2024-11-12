import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from 'dotenv';

dotenv.config();

const bucketName = process.env.BUCKET_NAME;
const region = process.env.BUCKET_REGION;
const accessKeyId = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey
  }
});

// Upload function: saves images directly to the root of the S3 bucket
export function uploadFile(fileBuffer, fileName, mimetype) {
  const uploadParams = {
    Bucket: bucketName,
    Body: fileBuffer,
    Key: fileName, // Upload directly with the provided filename
    ContentType: mimetype
  };

  return s3Client.send(new PutObjectCommand(uploadParams));
}

// Delete function: removes files from the S3 bucket
export function deleteFile(fileName) {
  const deleteParams = {
    Bucket: bucketName,
    Key: fileName, // Delete the file directly based on the provided filename
  };

  return s3Client.send(new DeleteObjectCommand(deleteParams));
}

// Get signed URL for accessing files in the S3 bucket
export async function getObjectSignedUrl(key) {
  const params = {
    Bucket: bucketName,
    Key: key // Fetch the file directly based on the provided key
  };

  // Generate a presigned URL for secure access with an expiration
  const command = new GetObjectCommand(params);
  const seconds = 60;
  const url = await getSignedUrl(s3Client, command, { expiresIn: seconds });

  return url;
}
