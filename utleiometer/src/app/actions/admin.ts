"use server";

import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { deleteReview } from "@/lib/firebase/reviews";

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

export type ReviewReportStatus = "pending" | "resolved" | "dismissed";

export interface ReportedReviewRecord {
  reportId: string;
  reviewId: string;
  propertyId: string;
  propertyDisplayName?: string;
  reporterUserId: string;
  reporterDisplayName?: string;
  reporterEmail?: string;
  reviewUserId?: string;
  reviewAuthorDisplayName?: string;
  reviewAuthorEmail?: string;
  reportReason: string;
  reportStatus: ReviewReportStatus;
  reportCreatedAt: string | null;
  reviewExists: boolean;
  reviewDisplayName?: string;
  reviewAuthorUserId?: string;
  reviewComment?: string;
  reviewOverall?: number;
  reviewCreatedAt?: string | null;
}

function toIsoDate(value: unknown): string | null {
  if (value && typeof value === "object" && "toDate" in value) {
    const ts = value as { toDate: () => Date };
    return ts.toDate().toISOString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "string") {
    return value;
  }
  return null;
}

type UserIdentity = {
  displayName?: string;
  email?: string;
};

async function getUserIdentity(
  uid: string,
  cache: Map<string, UserIdentity>
): Promise<UserIdentity> {
  if (!uid) return {};

  const cached = cache.get(uid);
  if (cached) return cached;

  try {
    const user = await adminAuth.getUser(uid);
    const identity: UserIdentity = {
      displayName: user.displayName || undefined,
      email: user.email || undefined,
    };
    cache.set(uid, identity);
    return identity;
  } catch {
    const fallback: UserIdentity = {};
    cache.set(uid, fallback);
    return fallback;
  }
}

function formatPropertyDisplayName(propertyData: Record<string, unknown>): string | undefined {
  const address =
    typeof propertyData.address === "string" ? propertyData.address.trim() : "";
  const city =
    typeof propertyData.city === "string" ? propertyData.city.trim() : "";

  if (address && city) {
    return `${address}, ${city}`;
  }

  return address || city || undefined;
}

async function getPropertyDisplayName(
  propertyId: string,
  cache: Map<string, string | undefined>
): Promise<string | undefined> {
  if (!propertyId) return undefined;

  if (cache.has(propertyId)) {
    return cache.get(propertyId);
  }

  try {
    const propertyDoc = await adminDb.collection("properties").doc(propertyId).get();
    if (!propertyDoc.exists) {
      cache.set(propertyId, undefined);
      return undefined;
    }

    const propertyData = propertyDoc.data() as Record<string, unknown>;
    const displayName = formatPropertyDisplayName(propertyData);
    cache.set(propertyId, displayName);
    return displayName;
  } catch {
    cache.set(propertyId, undefined);
    return undefined;
  }
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
 * List pending review reports with linked review information (admin only)
 */
export async function listReportedReviews(
  callerIdToken: string
): Promise<{ reports?: ReportedReviewRecord[]; error?: string }> {
  const callerUid = await verifyCallerIsAdmin(callerIdToken);
  if (!callerUid) {
    return { error: "Unauthorized: Only admins can view reported reviews" };
  }

  try {
    const reportSnapshot = await adminDb
      .collection("reviewReports")
      .orderBy("createdAt", "desc")
      .limit(200)
      .get();

    const pendingReportDocs = reportSnapshot.docs.filter((doc) => {
      const data = doc.data();
      return !data.status || data.status === "pending";
    });

    const userIdentityCache = new Map<string, UserIdentity>();
    const propertyNameCache = new Map<string, string | undefined>();

    const reports = await Promise.all(
      pendingReportDocs.map(async (reportDoc) => {
        const data = reportDoc.data() as Record<string, unknown>;
        const reviewId = typeof data.reviewId === "string" ? data.reviewId : "";
        const propertyId = typeof data.propertyId === "string" ? data.propertyId : "";
        const propertyDisplayName = propertyId
          ? await getPropertyDisplayName(propertyId, propertyNameCache)
          : undefined;
        const reporterUserId = typeof data.reporterUserId === "string" ? data.reporterUserId : "";
        const reporterIdentity = await getUserIdentity(reporterUserId, userIdentityCache);

        const baseRecord: ReportedReviewRecord = {
          reportId: reportDoc.id,
          reviewId,
          propertyId,
          propertyDisplayName,
          reporterUserId,
          reporterDisplayName: reporterIdentity.displayName,
          reporterEmail: reporterIdentity.email,
          reviewUserId: typeof data.reviewUserId === "string" ? data.reviewUserId : undefined,
          reportReason: typeof data.reason === "string" ? data.reason : "",
          reportStatus:
            data.status === "resolved" || data.status === "dismissed" ? data.status : "pending",
          reportCreatedAt: toIsoDate(data.createdAt),
          reviewExists: false,
        };

        if (!reviewId) {
          return baseRecord;
        }

        const reviewDoc = await adminDb.collection("reviews").doc(reviewId).get();
        if (!reviewDoc.exists) {
          return baseRecord;
        }

        const reviewData = reviewDoc.data() as Record<string, unknown>;
        const propertyIdFromReview =
          typeof reviewData.propertyId === "string" ? reviewData.propertyId : "";
        const resolvedPropertyId = propertyId || propertyIdFromReview;
        let resolvedPropertyDisplayName = propertyDisplayName;

        if (resolvedPropertyId && resolvedPropertyId !== propertyId) {
          resolvedPropertyDisplayName = await getPropertyDisplayName(
            resolvedPropertyId,
            propertyNameCache
          );
        }

        const ratings = reviewData.ratings as Record<string, unknown> | undefined;
        const overallFromRatings =
          ratings && typeof ratings.overall === "number" ? ratings.overall : undefined;
        const overallFromLegacy =
          typeof reviewData.rating === "number" ? reviewData.rating : undefined;

        const reviewAuthorUserId =
          typeof reviewData.userId === "string" ? reviewData.userId : undefined;

        const reviewAuthorIdentity = reviewAuthorUserId
          ? await getUserIdentity(reviewAuthorUserId, userIdentityCache)
          : {};

        return {
          ...baseRecord,
          propertyId: resolvedPropertyId || baseRecord.propertyId,
          propertyDisplayName: resolvedPropertyDisplayName,
          reviewExists: true,
          reviewDisplayName:
            typeof reviewData.userDisplayName === "string" ? reviewData.userDisplayName : undefined,
          reviewAuthorUserId,
          reviewAuthorDisplayName: reviewAuthorIdentity.displayName,
          reviewAuthorEmail: reviewAuthorIdentity.email,
          reviewComment: typeof reviewData.comment === "string" ? reviewData.comment : undefined,
          reviewOverall: overallFromRatings ?? overallFromLegacy,
          reviewCreatedAt: toIsoDate(reviewData.createdAt),
        };
      })
    );

    return { reports };
  } catch (error) {
    console.error("Error listing reported reviews:", error);
    return { error: error instanceof Error ? error.message : "Failed to list reported reviews" };
  }
}

/**
 * Mark a review report as dismissed (admin only)
 */
export async function dismissReviewReportAsAdmin(
  reportId: string,
  callerIdToken: string
): Promise<{ success: boolean; error?: string }> {
  const callerUid = await verifyCallerIsAdmin(callerIdToken);
  if (!callerUid) {
    return { success: false, error: "Unauthorized: Only admins can handle reports" };
  }

  if (!reportId) {
    return { success: false, error: "Report ID is required" };
  }

  try {
    const reportRef = adminDb.collection("reviewReports").doc(reportId);
    const reportDoc = await reportRef.get();

    if (!reportDoc.exists) {
      return { success: false, error: "Report not found" };
    }

    await reportRef.update({
      status: "dismissed",
      updatedAt: new Date(),
      handledAt: new Date(),
      handledBy: callerUid,
    });

    return { success: true };
  } catch (error) {
    console.error("Error dismissing report:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to dismiss report" };
  }
}

/**
 * Remove a reported review and resolve all reports for that review (admin only)
 */
export async function removeReportedReviewAsAdmin(
  reportId: string,
  callerIdToken: string
): Promise<{ success: boolean; reviewRemoved?: boolean; error?: string }> {
  const callerUid = await verifyCallerIsAdmin(callerIdToken);
  if (!callerUid) {
    return { success: false, error: "Unauthorized: Only admins can remove reported reviews" };
  }

  if (!reportId) {
    return { success: false, error: "Report ID is required" };
  }

  try {
    const reportRef = adminDb.collection("reviewReports").doc(reportId);
    const reportDoc = await reportRef.get();

    if (!reportDoc.exists) {
      return { success: false, error: "Report not found" };
    }

    const reportData = reportDoc.data() as Record<string, unknown>;
    const reviewId = typeof reportData.reviewId === "string" ? reportData.reviewId : "";

    if (!reviewId) {
      return { success: false, error: "Report is missing linked review ID" };
    }

    const reviewRef = adminDb.collection("reviews").doc(reviewId);
    const reviewDoc = await reviewRef.get();

    let reviewRemoved = false;
    if (reviewDoc.exists) {
      const reviewData = reviewDoc.data() as Record<string, unknown>;
      const propertyIdFromReview =
        typeof reviewData.propertyId === "string" ? reviewData.propertyId : undefined;
      const propertyIdFromReport =
        typeof reportData.propertyId === "string" ? reportData.propertyId : undefined;
      const propertyId = propertyIdFromReview ?? propertyIdFromReport;

      if (!propertyId) {
        return { success: false, error: "Could not determine property ID for reported review" };
      }

      await deleteReview(reviewId, propertyId);
      reviewRemoved = true;
    }

    const relatedReportsSnapshot = await adminDb
      .collection("reviewReports")
      .where("reviewId", "==", reviewId)
      .get();

    const batch = adminDb.batch();
    const updateData = {
      status: "resolved",
      updatedAt: new Date(),
      handledAt: new Date(),
      handledBy: callerUid,
      resolution: reviewRemoved ? "review-removed" : "review-already-missing",
    };

    if (relatedReportsSnapshot.empty) {
      batch.update(reportRef, updateData);
    } else {
      relatedReportsSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, updateData);
      });
    }

    await batch.commit();

    return { success: true, reviewRemoved };
  } catch (error) {
    console.error("Error removing reported review:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove reported review",
    };
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
