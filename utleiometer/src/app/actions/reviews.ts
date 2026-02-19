"use server"; 

import { createReview } from "@/lib/firebase/reviews";

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