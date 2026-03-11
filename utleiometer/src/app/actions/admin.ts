"use server";

import { adminAuth } from "@/lib/firebase/admin";

/**
 * Verify that the caller has admin privileges by checking their ID token
 * @param idToken - Firebase ID token from the calling user
 * @returns The UID of the admin user, or null if not authorized
 */
async function verifyCallerIsAdmin(idToken: string): Promise<string | null> {
  try {
    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    // Check if the user has admin claim
    if (decodedToken.admin !== true) {
      return null;
    }
    
    return decodedToken.uid;
  } catch (error) {
    console.error("Error verifying caller admin status:", error);
    return null;
  }
}

/**
 * Set custom claims for a user to make them an admin
 * @param uid - The Firebase user ID to make admin
 * @param callerIdToken - Firebase ID token of the caller (must be admin)
 * @returns Success status
 */
export async function setAdminClaim(
  uid: string, 
  callerIdToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify caller is admin
    const callerUid = await verifyCallerIsAdmin(callerIdToken);
    if (!callerUid) {
      return { success: false, error: "Unauthorized: Only admins can grant admin privileges" };
    }

    // Verify the target user exists
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
 * @param uid - The Firebase user ID to remove admin from
 * @param callerIdToken - Firebase ID token of the caller (must be admin)
 * @returns Success status
 */
export async function removeAdminClaim(
  uid: string,
  callerIdToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify caller is admin
    const callerUid = await verifyCallerIsAdmin(callerIdToken);
    if (!callerUid) {
      return { success: false, error: "Unauthorized: Only admins can revoke admin privileges" };
    }

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

export interface UserRecord {
  uid: string;
  email: string | undefined;
  displayName: string | undefined;
  isAdmin: boolean;
}

/**
 * List all users (admin only)
 */
export async function listUsers(
  callerIdToken: string
): Promise<{ users?: UserRecord[]; error?: string }> {
  const callerUid = await verifyCallerIsAdmin(callerIdToken);
  if (!callerUid) {
    return { error: "Unauthorized: Only admins can list users" };
  }

  try {
    const result = await adminAuth.listUsers(1000);
    const users: UserRecord[] = result.users.map((u) => ({
      uid: u.uid,
      email: u.email,
      displayName: u.displayName,
      isAdmin: u.customClaims?.admin === true,
    }));
    return { users };
  } catch (error) {
    console.error("Error listing users:", error);
    return { error: error instanceof Error ? error.message : "Failed to list users" };
  }
}

/**
 * Delete any user account (admin only)
 */
export async function deleteUserAsAdmin(
  targetUid: string,
  callerIdToken: string
): Promise<{ success: boolean; error?: string }> {
  const callerUid = await verifyCallerIsAdmin(callerIdToken);
  if (!callerUid) {
    return { success: false, error: "Unauthorized: Only admins can delete users" };
  }

  if (callerUid === targetUid) {
    return { success: false, error: "Admins cannot delete their own account from admin panel" };
  }

  try {
    await adminAuth.deleteUser(targetUid);
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete user" };
  }
}
