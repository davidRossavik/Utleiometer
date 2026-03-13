import { adminDb } from "./admin";
import { incrementReviewCount, decrementReviewCount } from "./properties";
import type { ReviewRatings } from "@/features/reviews/types";

export interface Review {
    reviewId: string;
    userId: string;
    propertyId: string;
    rating: number;
    ratings?: ReviewRatings;
    comment: string;
    title?: string;
    createdAt: Date;
    updatedAt?: Date;
    likedBy?: string[];
    likeCount?: number; 
}

export async function createReview(data: Omit<Review, "reviewId" | "createdAt">) {
    const reviewData = { 
        ...data, 
        createdAt: new Date(),
        likedBy: [],
        likeCount: 0
    };
    const docRef = await adminDb.collection("reviews").add(reviewData);
    
    // Oppdater review-telleren på property
    await incrementReviewCount(data.propertyId);
    
    return { reviewId: docRef.id, ...reviewData };
}

export async function getReviewsByPropertyId(propertyId: string) {
    const snapshot = await adminDb.collection("reviews").where("propertyId", "==", propertyId).get();
    return snapshot.docs.map(doc => ({ reviewId: doc.id, ...doc.data() } as Review));
}

export async function updateReview(
    reviewId: string,
    data: { ratings: ReviewRatings; comment: string; title?: string }
) {
    const reviewRef = adminDb.collection("reviews").doc(reviewId);

    const updateData: Record<string, unknown> = {
        rating: data.ratings.overall,
        ratings: data.ratings,
        comment: data.comment,
        title: data.title?.trim() ?? "",
        updatedAt: new Date(),
    };

    // Remove any undefined values to avoid Firestore errors
    Object.keys(updateData).forEach((key) => {
        if (updateData[key] === undefined) delete updateData[key];
    });

    await reviewRef.update(updateData);
    return { reviewId, ...updateData };
}

export async function deleteReview(reviewId: string, propertyId: string) {
    const reviewRef = adminDb.collection("reviews").doc(reviewId);
    await reviewRef.delete();
    await decrementReviewCount(propertyId);
    return { reviewId };
}

/**
 * Delete all reviews associated with a property
 * Used when deleting a property to maintain database integrity
 * @param propertyId - The ID of the property whose reviews should be deleted
 * @returns Object with count of deleted reviews
 */
export async function deleteReviewsByPropertyId(propertyId: string) {
    const snapshot = await adminDb.collection("reviews").where("propertyId", "==", propertyId).get();
    
    // Delete all reviews in a batch for efficiency
    const batch = adminDb.batch();
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    
    await batch.commit();
    return { deletedCount: snapshot.docs.length };
}