/**
 * Object Storage Service — AWS S3
 *
 * Replaces the previous object storage sidecar implementation.
 * Uses the AWS SDK v3 with credentials from environment variables:
 *
 *   AWS_REGION            e.g. us-east-1
 *   AWS_ACCESS_KEY_ID     IAM access key with S3 read/write on the bucket
 *   AWS_SECRET_ACCESS_KEY IAM secret key
 *   S3_DOCUMENTS_BUCKET   name of the S3 bucket (no gs:// prefix)
 *
 * For local development, leave S3_DOCUMENTS_BUCKET empty and document
 * upload/download will store files in a local ./uploads directory instead
 * (see LocalObjectStorageService below).
 */

import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createWriteStream, createReadStream, mkdirSync, existsSync } from "fs";
import { writeFile, readFile } from "fs/promises";
import path from "path";

// ─── S3 client (lazily initialised so missing env vars don't crash on startup) ─

let _s3: S3Client | null = null;

function getS3(): S3Client {
  if (!_s3) {
    _s3 = new S3Client({
      region: process.env.AWS_REGION ?? "us-east-1",
    });
  }
  return _s3;
}

function getBucket(): string {
  const bucket = process.env.S3_DOCUMENTS_BUCKET;
  if (!bucket) throw new Error("S3_DOCUMENTS_BUCKET is not set");
  return bucket;
}

// ─── Errors ───────────────────────────────────────────────────────────────────

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class ObjectStorageService {
  private readonly useLocal: boolean;
  private readonly localDir: string;

  constructor() {
    // Fall back to local filesystem when S3_DOCUMENTS_BUCKET is not configured
    // (useful for local dev without an AWS account).
    this.useLocal = !process.env.S3_DOCUMENTS_BUCKET;
    this.localDir = path.resolve("/tmp", "uploads");
    if (this.useLocal) {
      mkdirSync(this.localDir, { recursive: true });
    }
  }

  /**
   * Upload a Buffer to the given subPath (e.g. "documents/uuid.pdf").
   * Returns the storageKey to persist in the database.
   */
  async uploadBuffer(subPath: string, buffer: Buffer, mimeType: string): Promise<string> {
    if (this.useLocal) {
      const dest = path.join(this.localDir, subPath.replace(/\//g, "_"));
      await writeFile(dest, buffer);
      return `local://${subPath}`;
    }

    const key = `documents/${subPath}`;
    await getS3().send(
      new PutObjectCommand({
        Bucket: getBucket(),
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }),
    );
    return key;
  }

  /**
   * Generate a short-lived pre-signed GET URL for a storageKey returned by uploadBuffer.
   * expiresAt sets the expiry; options.filename sets Content-Disposition.
   */
  async getSignedReadUrl(
    storageKey: string,
    expiresAt: Date,
    options?: { filename?: string },
  ): Promise<string> {
    if (this.useLocal || storageKey.startsWith("local://")) {
      // In local dev, return a direct download route instead of a signed URL.
      // The documents download route handles this case already.
      return `/api/documents/local-download?key=${encodeURIComponent(storageKey)}`;
    }

    const ttlSeconds = Math.max(60, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
    const command = new GetObjectCommand({
      Bucket: getBucket(),
      Key: storageKey,
      ResponseContentDisposition: options?.filename
        ? `inline; filename="${options.filename}"`
        : "inline",
    });

    return getSignedUrl(getS3(), command, { expiresIn: ttlSeconds });
  }
}