"use server";

import { uploadImageFileAdmin } from "@/lib/firebase/storage-admin";

const UPLOAD_TIMEOUT_MS = 30000; // 30 second timeout

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    ),
  ]);
}

/**
 * Server action to upload property images
 * Uses Firebase Admin SDK for reliable uploads with proper permissions
 */
export async function uploadPropertyImageAction(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  try {
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    if (!file) {
      return { error: "No file provided" };
    }

    if (!userId) {
      return { error: "User ID is required" };
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log(`📤 Uploading property image for user ${userId}, file size: ${buffer.length} bytes`);

    const url = await withTimeout(
      uploadImageFileAdmin(buffer, file.name, file.type, userId, "properties"),
      UPLOAD_TIMEOUT_MS,
      "Image upload timed out after 30 seconds. Your Firebase Storage may not be properly configured. You can still submit without an image."
    );

    console.log(`✅ Property image uploaded successfully: ${url}`);
    return { url };
  } catch (error) {
    console.error("❌ Property image upload failed:", error);
    const message = error instanceof Error ? error.message : "Failed to upload image";
    return { error: `Image upload failed: ${message}` };
  }
}
