import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "./client";

const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024;
const UPLOAD_TIMEOUT_MS = 60000; // 60 second timeout
const URL_TIMEOUT_MS = 10000; // 10 second timeout for getting URL

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

function validateImageFile(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Filen må være et bilde");
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Bildet er for stort (maks 15 MB)");
  }
}

function createTimeoutPromise<T>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    ),
  ]);
}

function checkStorageInitialization() {
  if (!storage) {
    const error = new Error(
      "Firebase Storage is not properly initialized. Check your NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET environment variable."
    );
    console.error(error.message);
    throw error;
  }
}

export async function uploadImageFile(
  file: File,
  folder: "properties" | "reviews",
  userId: string,
) {
  validateImageFile(file);
  checkStorageInitialization();

  const fileName = getUniqueFileName(file.name || "image.jpg");
  const storageRef = ref(storage, `${folder}/${userId}/${fileName}`);

  try {
    console.log("🔄 Starting upload for file:", file.name, "size:", file.size, "bytes");
    console.log("📁 Storage reference path:", `${folder}/${userId}/${fileName}`);
    console.log("🪣 Storage bucket:", (storage as any).bucket);
    
    // Upload with timeout
    const startTime = Date.now();
    console.log("⏱️  Upload starting...");
    
    await createTimeoutPromise(
      uploadBytes(storageRef, file, {
        contentType: file.type || "image/jpeg",
      }),
      UPLOAD_TIMEOUT_MS,
      "Image upload timed out after 60 seconds. Your Firebase Storage bucket may not be configured correctly, or there's a network issue. You can submit the review without an image."
    );
    
    const uploadTime = Date.now() - startTime;
    console.log(`✅ Upload complete in ${uploadTime}ms, getting download URL`);
    
    const startUrlTime = Date.now();
    const downloadUrl = await createTimeoutPromise(
      getDownloadURL(storageRef),
      URL_TIMEOUT_MS,
      "Failed to get download URL. The file may have been uploaded. Please try again."
    );
    
    const urlTime = Date.now() - startUrlTime;
    console.log(`✅ Download URL obtained in ${urlTime}ms:`, downloadUrl);
    return downloadUrl;
  } catch (error) {
    console.error("❌ Firebase Storage error:", error);
    console.error("Error type:", error instanceof Error ? error.constructor.name : typeof error);
    if (error instanceof Error) {
      throw new Error(`Image upload failed: ${error.message}`);
    }
    throw error;
  }
}
