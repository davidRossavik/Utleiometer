import { bucket } from "./admin";
import { randomUUID } from "crypto";

function getFileExtension(fileName: string) {
  const parts = fileName.split(".");
  if (parts.length < 2) return "jpg";
  return parts.pop()?.toLowerCase() || "jpg";
}

function getUniqueFileName(originalName: string) {
  const extension = getFileExtension(originalName);
  const random = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${Date.now()}-${random}.${extension}`;
}

function buildFirebaseDownloadUrl(bucketName: string, filePath: string, token: string) {
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(
    filePath
  )}?alt=media&token=${token}`;
}

async function ensureDownloadToken(file: ReturnType<typeof bucket.file>) {
  const [metadata] = await file.getMetadata();
  const metadataMap = metadata.metadata ?? {};
  const existingTokens = metadataMap.firebaseStorageDownloadTokens
    ?.split(",")
    .map((token) => token.trim())
    .filter(Boolean);

  if (existingTokens && existingTokens.length > 0) {
    return existingTokens[0];
  }

  const newToken = randomUUID();
  await file.setMetadata({
    metadata: {
      ...metadataMap,
      firebaseStorageDownloadTokens: newToken,
    },
  });
  return newToken;
}

async function getPermanentDownloadUrl(file: ReturnType<typeof bucket.file>) {
  const token = await ensureDownloadToken(file);
  return buildFirebaseDownloadUrl(bucket.name, file.name, token);
}

function parsePathFromStorageUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname;

    if (parsed.hostname === "firebasestorage.googleapis.com") {
      const marker = "/o/";
      const markerIndex = pathname.indexOf(marker);
      if (markerIndex === -1) return null;
      const encodedPath = pathname.slice(markerIndex + marker.length);
      return decodeURIComponent(encodedPath);
    }

    if (parsed.hostname === "storage.googleapis.com") {
      const downloadPrefix = "/download/storage/v1/b/";
      if (pathname.startsWith(downloadPrefix)) {
        const marker = "/o/";
        const markerIndex = pathname.indexOf(marker);
        if (markerIndex === -1) return null;
        const encodedPath = pathname.slice(markerIndex + marker.length);
        return decodeURIComponent(encodedPath);
      }

      const parts = pathname.split("/").filter(Boolean);
      if (parts.length < 2) return null;
      // Format: /<bucket>/<path/to/object>
      return parts.slice(1).join("/");
    }

    return null;
  } catch {
    return null;
  }
}

export async function convertStorageUrlToPermanentDownloadUrl(url: string) {
  const filePath = parsePathFromStorageUrl(url);
  if (!filePath) {
    return null;
  }

  const file = bucket.file(filePath);
  const [exists] = await file.exists();
  if (!exists) {
    return null;
  }

  return getPermanentDownloadUrl(file);
}

/**
 * Server-side image upload using Firebase Admin SDK
 * More reliable than client-side uploads - this is SERVER-ONLY code
 */
export async function uploadImageFileAdmin(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string,
  userId: string,
  folder: "properties" | "reviews" = "reviews",
) {
  try {
    if (!bucket) {
      const errMsg = "Firebase Admin Storage not initialized - bucket is null. Ensure FIREBASE_STORAGE_BUCKET is configured in environment.";
      console.error("❌", errMsg);
      throw new Error(errMsg);
    }

    console.log("🪣 Using bucket:", bucket.name);

    const uniqueName = getUniqueFileName(fileName || "image.jpg");
    const filePath = `${folder}/${userId}/${uniqueName}`;

    console.log(`📤 Admin uploading to ${filePath}, size: ${fileBuffer.length} bytes`);

    const file = bucket.file(filePath);
    
    await new Promise<void>((resolve, reject) => {
      const stream = file.createWriteStream({
        metadata: {
          contentType: contentType || "image/jpeg",
        },
      });

      const timeout = setTimeout(() => {
        stream.destroy();
        reject(new Error("Upload stream timeout - Firebase Storage not responding"));
      }, 25000); // 25 second timeout for the stream

      stream.on("error", (err) => {
        clearTimeout(timeout);
        console.error("❌ Stream error:", err);
        reject(err);
      });

      stream.on("finish", () => {
        clearTimeout(timeout);
        console.log(`✅ File written to Cloud Storage: ${filePath}`);
        resolve();
      });

      stream.end(fileBuffer);
    });

    // Build a stable Firebase download URL backed by a persistent token.
    console.log("📝 Getting permanent download URL...");
    const downloadUrl = await getPermanentDownloadUrl(file);

    console.log(`✅ Admin upload complete, URL: ${downloadUrl}`);
    return downloadUrl;
  } catch (error) {
    console.error("❌ Admin upload error:", error);
    console.error("Error details:", {
      isError: error instanceof Error,
      message: error instanceof Error ? error.message : String(error),
      code: (error as any)?.code,
      details: (error as any)?.details,
      fullError: error,
    });
    if (error instanceof Error) {
      throw new Error(`Image upload failed: ${error.message}`);
    }
    throw new Error("Image upload failed: Unknown error");
  }
}
