"use server";

import { adminAuth } from "@/lib/firebase/admin";

/**
 * Set custom claims for a user to make them an admin
 * @param uid - The Firebase user ID
 * @returns Success status
 */
export async function setAdminClaim(uid: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify the user exists
    const user = await adminAuth.getUser(uid);
    
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Set the admin custom claim
    await adminAuth.setCustomUserClaims(uid, { admin: true });

    return { success: true };
  } catch (error) {
    console.error("Error setting admin claim:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to set admin claim" 
    };
  }
}

/**
 * Remove admin custom claims from a user
 * @param uid - The Firebase user ID
 * @returns Success status
 */
export async function removeAdminClaim(uid: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Set admin claim to false (or remove it by setting to null)
    await adminAuth.setCustomUserClaims(uid, { admin: false });

    return { success: true };
  } catch (error) {
    console.error("Error removing admin claim:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to remove admin claim" 
    };
  }
}

/**
 * Check if a user has admin privileges (server-side verification)
 * @param uid - The Firebase user ID
 * @returns True if user is admin
 */
export async function verifyAdminStatus(uid: string): Promise<boolean> {
  try {
    const user = await adminAuth.getUser(uid);
    return user.customClaims?.admin === true;
  } catch (error) {
    console.error("Error verifying admin status:", error);
    return false;
  }
}
