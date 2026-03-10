"use server";

import { createProperty, getPropertyByAddress, getPropertyById, deleteProperty } from "@/lib/firebase/properties"; 
import { createReview } from "@/lib/firebase/reviews";
import { adminAuth } from "@/lib/firebase/admin";


export async function createPropertyAction(formData: FormData) {
    const address = (formData.get("address") as string).trim().replace(/\s+/g, ' ').toLowerCase();
    const zipCode = (formData.get("zipCode") as string).trim();
    const city = (formData.get("city") as string).trim().replace(/\s+/g, ' ').toLowerCase();
    const registeredByUid = formData.get("registeredByUid") as string;
    const imageUrl = formData.get("imageUrl") as string | null; 
    const createdAt = new Date();

    if (!address || !zipCode || !city || !registeredByUid) {
        throw new Error("Address, zip code, city, and user ID are required");
    }

    const existingProperty = await getPropertyByAddress(address, zipCode, city);
    if (existingProperty) {
        return {error: "Property already exists, please visit the property's page to leave a review."};
    }

    try {
        // Only include imageUrl if it has a value
        const propertyData: { address: string; zipCode: string; city: string; registeredByUid: string; imageUrl?: string } = {
            address,
            zipCode,
            city,
            registeredByUid,
            createdAt
        };
        
        if (imageUrl) {
            propertyData.imageUrl = imageUrl;
        }
        
        const newProperty = await createProperty(propertyData);
        return newProperty;
    } catch (error) {
        console.error("Error creating property:", error);
        throw new Error("Failed to create property");
    }
}

export async function createPropertyAndReviewAction(formData: FormData) {
    const address = (formData.get("address") as string).trim().replace(/\s+/g, ' ').toLowerCase();
    const zipCode = (formData.get("zipCode") as string).trim();
    const city = (formData.get("city") as string).trim().replace(/\s+/g, ' ').toLowerCase();
    const registeredByUid = formData.get("registeredByUid") as string;
    const imageUrl = formData.get("imageUrl") as string | null;

    const rating = parseInt(formData.get("rating") as string, 10);
    const comment = (formData.get("comment") as string)?.trim();

    if (!address || !zipCode || !city || !registeredByUid || isNaN(rating) || !comment) {
        return { error: "Alle felter er påkrevd og rating må være et tall" };
    }

    const existingProperty = await getPropertyByAddress(address, zipCode, city);
    if (existingProperty) {
        return { error: "Property already exists, please visit the property's page to leave a review." };
    }

    try {
        const propertyData: { address: string; zipCode: string; city: string; registeredByUid: string; imageUrl?: string } = {
            address,
            zipCode,
            city,
            registeredByUid,
        };

        if (imageUrl) {
            propertyData.imageUrl = imageUrl;
        }

        const newProperty = await createProperty(propertyData);

        await createReview({
            userId: registeredByUid,
            propertyId: newProperty.propertyId,
            rating,
            comment,
        });

        return { propertyId: newProperty.propertyId };
    } catch (error) {
        console.error("Error creating property and review:", error);
        return { error: "Noe gikk galt" };
    }
}

export async function getPropertyAction(propertyId: string) {
    try {
        const property = await getPropertyById(propertyId);
        return property;
    } catch (error) {
        console.error("Error fetching property:", error);
        return { error: "Could not fetch property" };
    }
}

/**
 * Delete a property and all its related reviews (admin only)
 */
export async function deletePropertyAction(
    propertyId: string,
    callerIdToken: string
): Promise<{ success: boolean; error?: string; deletedReviews?: number }> {
    try {
        // Verify the ID token and check admin claim
        const decodedToken = await adminAuth.verifyIdToken(callerIdToken);
        
        if (decodedToken.admin !== true) {
            return { 
                success: false, 
                error: "Unauthorized: Only admins can delete properties" 
            };
        }

        // Delete property and all related reviews
        const { deletedReviews } = await deleteProperty(propertyId);

        return { 
            success: true, 
            deletedReviews 
        };
    } catch (error) {
        console.error("Error deleting property:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete property"
        };
    }
}