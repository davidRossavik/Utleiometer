import { adminDb } from "./admin";
import { incrementReviewCount } from "./properties";

export interface Review {
    reviewId: string;
    userId: string;
    propertyId: string;
    rating: number;
    comment: string;
    createdAt: Date;
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
