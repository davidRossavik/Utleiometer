// Common type related to reviews
export type Review = {
    id: string;
    propertyId: string;
    title?: string;
    comment?: string;
    rating?: number; // 1-5
    userDisplayName?: string;
    createdAt?: any; // Firestore Timestamp
};