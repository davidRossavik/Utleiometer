import { adminDb } from "./admin";
import { incrementReviewCount, decrementReviewCount } from "./properties";

export interface Review {
    reviewId: string;
    userId: string;
    propertyId: string;
    rating: number;
    ratings?: {
        location: number;
        noise: number;
        landlord: number;
        condition: number;
        overall: number;
    };
    comment: string;
    imageUrl?: string;
    title?: string;
    createdAt: Date;
    updatedAt?: Date;
}

export async function createReview(data: Omit<Review, "reviewId" | "createdAt">) {
    const reviewData = { ...data, createdAt: new Date() };
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
    data: {
        rating?: number;
        ratings?: {
            location: number;
            noise: number;
            landlord: number;
            condition: number;
            overall: number;
        };
        comment: string;
        title?: string;
    }
) {
    const reviewRef = adminDb.collection("reviews").doc(reviewId);

    const resolvedRating =
        typeof data.rating === "number"
            ? data.rating
            : typeof data.ratings?.overall === "number"
              ? data.ratings.overall
              : undefined;
    
    const updateData = {
        rating: resolvedRating,
        ...(data.ratings ? { ratings: data.ratings } : {}),
        comment: data.comment,
        title: data.title || "",
        updatedAt: new Date()
    };
    
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