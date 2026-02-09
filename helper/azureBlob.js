import { BlobServiceClient } from "@azure/storage-blob";
import crypto from "crypto";

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);

export const uploadToAzure = async (buffer, mimeType) => {
  const containerClient = blobServiceClient.getContainerClient(
    process.env.AZURE_CONTAINER_NAME
  );

  const extension = mimeType.split("/")[1];
  const blobName = `payment_${Date.now()}_${crypto.randomUUID()}.${extension}`;

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: {
      blobContentType: mimeType,
    },
  });

  return blockBlobClient.url;
};

export const deleteFromAzure = async (blobUrl) => {
  if (!blobUrl) return;

  const containerClient = blobServiceClient.getContainerClient(
    process.env.AZURE_CONTAINER_NAME
  );

  // Extract blob name from URL
  const blobName = blobUrl.split("/").pop();

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.deleteIfExists();
};
