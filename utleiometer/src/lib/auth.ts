import { User } from "firebase/auth";

/**
 * Check if a Firebase user has admin privileges
 * Reads the custom claims from the user's ID token
 * 
 * @param user - Firebase User object
 * @returns Promise<boolean> - True if user is admin
 */
export async function isAdmin(user: User | null): Promise<boolean> {
  if (!user) {
    return false;
  }

  try {
    const tokenResult = await user.getIdTokenResult();
    return tokenResult.claims.admin === true;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

/**
 * Force refresh the user's ID token to get updated custom claims
 * Call this after changing admin status to see the changes immediately
 * 
 * @param user - Firebase User object
 */
export async function refreshUserToken(user: User | null): Promise<void> {
  if (!user) {
    return;
  }

  try {
    await user.getIdToken(true); // force refresh
  } catch (error) {
    console.error("Error refreshing token:", error);
  }
}
