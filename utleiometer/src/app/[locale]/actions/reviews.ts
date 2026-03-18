"use server"; 

import { createReview, createReviewReport, updateReview, deleteReview } from "@/lib/firebase/reviews";
import { adminAuth, adminDb, FieldValue } from "@/lib/firebase/admin";
import type { ReviewRatings } from "@/features/reviews/types";

function parseCategoryRating(formData: FormData, key: string) {
    const value = parseInt(formData.get(key) as string, 10);
    return Number.isInteger(value) ? value : NaN;
}

function buildRatings(formData: FormData): ReviewRatings | null {
    const location = parseCategoryRating(formData, "ratingLocation");
    const noise = parseCategoryRating(formData, "ratingNoise");
    const landlord = parseCategoryRating(formData, "ratingLandlord");
    const condition = parseCategoryRating(formData, "ratingCondition");

    const values = [location, noise, landlord, condition];
    const allValid = values.every((v) => Number.isInteger(v) && v >= 1 && v <= 5);

    if (!allValid) return null;

    const overallRaw = (location + noise + landlord + condition) / 4;
    const overall = Number(overallRaw.toFixed(1));

    return { location, noise, landlord, condition, overall };
}

export async function createReviewAction(formData: FormData) {
    const userId = formData.get("userId") as string;
    const propertyId = formData.get("propertyId") as string;
    const comment = formData.get("comment") as string;
    const reviewImageUrl = String(formData.get("reviewImageUrl") ?? formData.get("imageUrl") ?? "").trim();
    const userDisplayName = (formData.get("userDisplayName") as string | null)?.trim() ?? "";
    const ratings = buildRatings(formData);

    console.log("createReviewAction called with:", { userId, propertyId, ratings, comment });

    if (!userId || !propertyId || !ratings || !comment?.trim()) {
        console.error("Validation failed:", { userId, propertyId, ratings, comment });
        return { error: "Alle felter er påkrevd og alle kategorier må være mellom 1 og 5" };
    }

    try {
        const newReview = await createReview({
            userId,
            propertyId,
            ...(userDisplayName ? { userDisplayName } : {}),
            rating: ratings.overall, // legacy support
            ratings,
            comment: comment.trim(),
            ...(reviewImageUrl ? { imageUrl: reviewImageUrl } : {}),
        });
        console.log("Review created successfully:", newReview);
        return { reviewId: newReview.reviewId };
    } catch (error) {
        console.error("Error creating review - full error:", error);
        console.error("Error message:", error instanceof Error ? error.message : String(error));
        return { error: `Kunne ikke opprette anmeldelse: ${error instanceof Error ? error.message : 'Ukjent feil'}` };
    }
}

export async function updateReviewAction(reviewId: string, formData: FormData) {
    const comment = formData.get("comment") as string;
    const title = formData.get("title") as string;
    const ratings = buildRatings(formData);

    console.log("updateReviewAction called with:", { reviewId, ratings, comment, title });

    if (!reviewId || !ratings || !comment?.trim()) {
        return { error: "Review ID, kategorier og kommentar er påkrevd" };
    }

    try {
        const updated = await updateReview(reviewId, {
            ratings,
            comment: comment.trim(),
            title: title?.trim()
        });
        console.log("Review updated successfully:", updated);
        return { success: true, review: updated };
    } catch (error) {
        console.error("Error updating review:", error);
        return { error: `Kunne ikke oppdatere: ${error instanceof Error ? error.message : 'Ukjent feil'}` };
    }
}

/**
 * Delete a review
 * Admins can delete any review by providing their ID token
 * Regular users can only delete their own reviews (enforced by security rules)
 */
export async function deleteReviewAction(
    reviewId: string, 
    propertyId: string,
    callerIdToken?: string
): Promise<{ success?: boolean; error?: string }> {
    console.log("deleteReviewAction called with:", { reviewId, propertyId, hasToken: !!callerIdToken });

    if (!reviewId || !propertyId) {
        return { error: "Review ID og Property ID er påkrevd" };
    }

    // If caller provides ID token, verify admin status
    if (callerIdToken) {
        try {
            const decodedToken = await adminAuth.verifyIdToken(callerIdToken);
            
            if (decodedToken.admin !== true) {
                return { 
                    error: "Unauthorized: Only admins can delete other users' reviews" 
                };
            }
            // Admin verified, proceed with deletion
        } catch (error) {
            console.error("Error verifying admin token:", error);
            return { error: "Invalid authentication token" };
        }
    }

    try {
        await deleteReview(reviewId, propertyId);
        console.log("Review deleted successfully:", reviewId);
        return { success: true };
    } catch (error) {
        console.error("Error deleting review:", error);
        return { error: `Kunne ikke slette: ${error instanceof Error ? error.message : 'Ukjent feil'}` };
    }
}

export async function toggleLikeReviewAction(reviewId: string, userId: string) {
    if (!reviewId || !userId) {
        return { error: "Review ID og User ID er påkrevd" };
    }

    try {
        const reviewRef = adminDb.collection("reviews").doc(reviewId);
        const reviewDoc = await reviewRef.get();
        
        if (!reviewDoc.exists) {
            return { error: "Anmeldelse ikke funnet" };
        }

        const reviewData = reviewDoc.data();
        const likedBy = reviewData?.likedBy || [];
        const currentLikeCount = reviewData?.likeCount || 0;
        const hasLiked = likedBy.includes(userId);

        if (hasLiked) {
            // Unlike
            await reviewRef.update({
                likedBy: FieldValue.arrayRemove(userId),
                likeCount: Math.max(0, currentLikeCount - 1) // Prevent negative counts
            });
            console.log(`Unlike: reviewId=${reviewId}, userId=${userId}, newCount=${Math.max(0, currentLikeCount - 1)}`);
            return { success: true, liked: false };
        } else {
            // Like
            await reviewRef.update({
                likedBy: FieldValue.arrayUnion(userId),
                likeCount: currentLikeCount + 1
            });
            console.log(`Like: reviewId=${reviewId}, userId=${userId}, newCount=${currentLikeCount + 1}`);
            return { success: true, liked: true };
        }
    } catch (error) {
        console.error("Error toggling like:", error);
        return { error: `Kunne ikke oppdatere like: ${error instanceof Error ? error.message : 'Ukjent feil'}` };
    }
}

export async function reportReviewAction(
    reviewId: string,
    reporterUserId: string,
    propertyId: string,
    reason?: string,
) {
    if (!reviewId || !reporterUserId || !propertyId) {
        return { error: "Review ID, User ID og Property ID er påkrevd" };
    }

    try {
        const reviewRef = adminDb.collection("reviews").doc(reviewId);
        const reviewDoc = await reviewRef.get();

        if (!reviewDoc.exists) {
            return { error: "Anmeldelse ikke funnet" };
        }

        const reviewData = reviewDoc.data();
        const reviewOwnerId = typeof reviewData?.userId === "string" ? reviewData.userId : undefined;

        if (reviewOwnerId && reviewOwnerId === reporterUserId) {
            return { error: "Du kan ikke rapportere din egen anmeldelse" };
        }

        const reportResult = await createReviewReport({
            reviewId,
            reporterUserId,
            propertyId: typeof reviewData?.propertyId === "string" ? reviewData.propertyId : propertyId,
            reviewUserId: reviewOwnerId,
            reason,
        });

        return {
            success: true,
            reportId: reportResult.reportId,
            alreadyReported: reportResult.alreadyReported,
        };
    } catch (error) {
        console.error("Error reporting review:", error);
        return { error: `Kunne ikke rapportere anmeldelse: ${error instanceof Error ? error.message : "Ukjent feil"}` };
    }
}
