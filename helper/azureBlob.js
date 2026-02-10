import { BlobServiceClient } from "@azure/storage-blob";
import crypto from "crypto";

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);

export const uploadToAzure = async (buffer, mimeType, folder) => {
  const containerClient = blobServiceClient.getContainerClient(
    process.env.AZURE_CONTAINER_NAME
  );

  const extension = mimeType.split("/")[1];
  const fileName = `${crypto.randomUUID()}.${extension}`;

  // 👇 virtual directory
  const blobName = `${folder}/${fileName}`;

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

  // ✅ extract full blob path including folders
  const url = new URL(blobUrl);
  const blobName = decodeURIComponent(
    url.pathname.replace(`/${process.env.AZURE_CONTAINER_NAME}/`, "")
  );
  console.log("Deleting blob:", blobName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.deleteIfExists();
};
