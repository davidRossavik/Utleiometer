import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore, FieldValue } from "firebase-admin/firestore"
import { getStorage } from "firebase-admin/storage"
import { env } from "../env"

// Convert client storage bucket to admin storage bucket format
// Cloud Storage bucket names can be: project-id.appspot.com, gs://bucket-name, etc.
function getAdminStorageBucket(clientBucket: string): string {
  // If client bucket is in .firebasestorage.app format, convert to .appspot.com
  if (clientBucket.includes("firebasestorage.app")) {
    const projectId = clientBucket.split(".")[0];
    const adminBucket = `${projectId}.appspot.com`;
    console.log("🪣 Storage bucket conversion (firebasestorage → appspot):", { clientBucket, adminBucket });
    return adminBucket;
  }
  
  // If already in correct format, return as-is
  return clientBucket;
}

if (!getApps().length) {
  // Use explicit FIREBASE_STORAGE_BUCKET if set, otherwise convert from client bucket
  let storageBucket = env.FIREBASE_STORAGE_BUCKET || getAdminStorageBucket(env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
  
  console.log("🔥 Initializing Firebase Admin with bucket:", storageBucket);
  console.log("📋 ProjectID:", env.FIREBASE_PROJECT_ID);
  
  try {
    initializeApp({
      credential: cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
      storageBucket,
    })
    console.log("✅ Firebase Admin initialized successfully");
  } catch (err) {
    console.error("❌ Firebase Admin initialization error:", err);
    throw err;
  }
}

export const adminAuth = getAuth()
export const adminDb = getFirestore()

// Initialize and log storage bucket
const storage = getStorage();
let storageBucketName = env.FIREBASE_STORAGE_BUCKET || getAdminStorageBucket(env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
const bucket = storage.bucket(storageBucketName);
console.log("✅ Firebase Admin Storage bucket ready:", bucket.name);

export { bucket, FieldValue }
