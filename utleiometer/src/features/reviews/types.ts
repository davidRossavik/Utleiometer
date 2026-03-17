// Common type related to reviews
export type ReviewRatings = {
    location: number;
    noise: number;
    landlord: number;
    condition: number;
    overall: number;
};

export type Review = {
    id: string;
    propertyId: string;
    userId?: string;          // <-- NY: ID-en til brukeren som skrev anmeldelsen
    title?: string;
    comment?: string;
    imageUrl?: string;
    rating?: number; // legacy 1-5
    ratings?: ReviewRatings;
    userDisplayName?: string;
    createdAt?: any; // Firestore Timestamp
};
