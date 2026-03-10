import { adminDb } from "./admin";
import { incrementReviewCount, decrementReviewCount } from "./properties";

export interface ReviewRatings {
    location: number;
    noise: number;
    landlord: number;
    condition: number;
    overall: number;
}

export interface Review {
    reviewId: string;
    userId: string;
    propertyId: string;
    rating?: number; // legacy
    ratings?: ReviewRatings;
    comment: string;
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
    data: { ratings: ReviewRatings; comment: string; title?: string }
) {
    const reviewRef = adminDb.collection("reviews").doc(reviewId);
    
    const updateData = {
        rating: data.ratings.overall, // legacy support
        ratings: data.ratings,
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
