"use server";

import { createProperty, getPropertyByAddress } from "@/lib/firebase/properties"; 


export async function createPropertyAction(formData: FormData) {
    const address = formData.get("address") as string;
    const zipCode = formData.get("zipCode") as string;
    const city = formData.get("city") as string;
    const registeredByUid = formData.get("registeredByUid") as string;
    const imageUrl = formData.get("imageUrl") as string | null; 
    const createdAt = new Date();

    if (!address || !zipCode || !city || !registeredByUid) {
        throw new Error("Address, zip code, city, and user ID are required");
    }

    const existingProperty = await getPropertyByAddress(address, zipCode, city);
    if (existingProperty) {
        return {error: "Property already exists"};
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