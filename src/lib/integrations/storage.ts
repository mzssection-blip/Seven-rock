export type StoredObject = { key: string; url: string };

export interface StorageProvider {
  upload(input: { key: string; contentType: string; body: Buffer }): Promise<StoredObject>;
  remove(key: string): Promise<void>;
}

export function storageIsConfigured() {
  return Boolean(
    process.env.S3_ENDPOINT &&
      process.env.S3_REGION &&
      process.env.S3_BUCKET &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY,
  );
}

export function requireStorageConfiguration() {
  if (!storageIsConfigured()) {
    throw new Error("Image storage is unavailable. Configure the S3-compatible storage environment variables.");
  }
}
