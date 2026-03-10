"use server"; 

import { createReview, updateReview, deleteReview } from "@/lib/firebase/reviews";
import { adminAuth } from "@/lib/firebase/admin";

export async function createReviewAction(formData: FormData) {
    const userId = formData.get("userId") as string;
    const propertyId = formData.get("propertyId") as string;
    const rating = parseInt(formData.get("rating") as string);
    const comment = formData.get("comment") as string;

    console.log("createReviewAction called with:", { userId, propertyId, rating, comment });

    if (!userId || !propertyId || isNaN(rating) || !comment) {
        console.error("Validation failed:", { userId, propertyId, rating: isNaN(rating), comment });
        return { error: "Alle felter er påkrevd og rating må være et tall" };
    }

    try {
        const newReview = await createReview({ userId, propertyId, rating, comment });
        console.log("Review created successfully:", newReview);
        return { reviewId: newReview.reviewId };
    } catch (error) {
        console.error("Error creating review - full error:", error);
        console.error("Error message:", error instanceof Error ? error.message : String(error));
        return { error: `Kunne ikke opprette anmeldelse: ${error instanceof Error ? error.message : 'Ukjent feil'}` };
    }
}

export async function updateReviewAction(reviewId: string, formData: FormData) {
    const rating = parseInt(formData.get("rating") as string);
    const comment = formData.get("comment") as string;
    const title = formData.get("title") as string;

    console.log("updateReviewAction called with:", { reviewId, rating, comment, title });

    if (!reviewId || isNaN(rating) || !comment?.trim()) {
        return { error: "Review ID, rating og kommentar er påkrevd" };
    }

    if (rating < 1 || rating > 5) {
        return { error: "Rating må være mellom 1 og 5" };
    }

    try {
        const updated = await updateReview(reviewId, {
            rating,
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