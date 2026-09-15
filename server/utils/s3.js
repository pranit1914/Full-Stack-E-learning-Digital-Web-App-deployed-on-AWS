import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs/promises";
import { createReadStream } from "fs";
import { v4 as uuid } from "uuid";

const bucket = process.env.AWS_S3_BUCKET;
const region = process.env.AWS_REGION;

const client = bucket && region
  ? new S3Client({ region })
  : null;

const assertConfigured = () => {
  if (!client || !bucket) {
    throw new Error("AWS S3 is not configured. Set AWS_REGION and AWS_S3_BUCKET.");
  }
};

const safeExtension = (fileName) => {
  const extension = fileName?.includes(".")
    ? fileName.slice(fileName.lastIndexOf(".")).toLowerCase()
    : "";
  return extension.replace(/[^a-z0-9.]/g, "");
};

export const uploadToS3 = async (file, folder) => {
  const key = `${folder}/${uuid()}${safeExtension(file.originalname)}`;
  try {
    assertConfigured();
    const { size } = await fs.stat(file.path);
    await client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: createReadStream(file.path),
      ContentLength: size,
      ContentType: file.mimetype,
    }));
  } finally {
    await fs.unlink(file.path).catch(() => {});
  }

  return `s3://${bucket}/${key}`;
};

export const deleteFromS3 = async (storedValue) => {
  if (!storedValue?.startsWith("s3://")) return;

  assertConfigured();
  const key = storedValue.slice(`s3://${bucket}/`.length);
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
};

export const getMediaUrl = async (storedValue) => {
  if (!storedValue?.startsWith("s3://")) return storedValue;

  assertConfigured();
  const key = storedValue.slice(`s3://${bucket}/`.length);
  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn: 60 * 60 },
  );
};

export const getMediaUrls = async (values) => Promise.all(values.map(getMediaUrl));