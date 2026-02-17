"use server"; 

import { createReview } from "@/lib/firebase/reviews";

export async function createReviewAction(formData: FormData) {
    const userId = formData.get("userId") as string;
    const propertyId = formData.get("propertyId") as string;
    const rating = parseInt(formData.get("rating") as string);
    const comment = formData.get("comment") as string;
    const createdAt = new Date();

    if (!userId || !propertyId || isNaN(rating) || !comment) {
        throw new Error("All fields are required and rating must be a number");
    }

    try {
        const newReview = await createReview({ userId, propertyId, rating, comment });
        return newReview;
    } catch (error) {
        console.error("Error creating review:", error);
        throw new Error("Failed to create review");
    };  

}