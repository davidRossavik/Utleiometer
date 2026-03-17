import { bucket } from "./admin";

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

    // Get download URL
    console.log("📝 Getting signed download URL...");
    const [downloadUrl] = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days (Firebase max)
    });

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
