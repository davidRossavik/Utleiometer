import { adminDb, FieldValue } from "./admin";

export interface Property {
  propertyId: string;
  address: string;
  zipCode: string;
  city: string;
  registeredByUid: string;
  createdAt: Date;
  reviewCount?: number;
  imageUrl?: string;
}

export async function createProperty(data: Omit<Property, "propertyId" | "createdAt">) {
    const propertyData = { ...data, createdAt: new Date(), reviewCount: 0 };
    const docRef = await adminDb.collection("properties").add(propertyData);
    return { propertyId: docRef.id, ...propertyData };
}

export async function incrementReviewCount(propertyId: string) {
    const propertyRef = adminDb.collection("properties").doc(propertyId);
    await propertyRef.update({
        reviewCount: FieldValue.increment(1)
    });
}
export async function decrementReviewCount(propertyId: string) {
    const propertyRef = adminDb.collection("properties").doc(propertyId);
    await propertyRef.update({
        reviewCount: FieldValue.increment(-1)
    });
}

export async function getPropertyById(propertyId: string) {
    const doc = await adminDb.collection("properties").doc(propertyId).get();
    if (!doc.exists) {
        throw new Error("Property not found");
    }
    return { propertyId: doc.id, ...doc.data() } as Property;
}

export async function getAllProperties() {
    const snapshot = await adminDb.collection("properties").get();
    return snapshot.docs.map(doc => ({ propertyId: doc.id, ...doc.data() } as Property));
}

export async function getPropertyByAddress(address: string, zipCode: string, city: string) {
  const snapshot = await adminDb
    .collection("properties")
    .where("address", "==", address)
    .where("zipCode", "==", zipCode)
    .where("city", "==", city)
    .get();
  
  if (snapshot.empty) {
    return null;
  }
  
  const doc = snapshot.docs[0];
  return { propertyId: doc.id, ...doc.data() } as Property;
}

/**
 * Delete a property and all its related reviews
 * Maintains database integrity by removing orphaned reviews
 * @param propertyId - The ID of the property to delete
 * @returns Object with propertyId and count of deleted reviews
 */
export async function deleteProperty(propertyId: string) {
    const propertyRef = adminDb.collection("properties").doc(propertyId);
    const doc = await propertyRef.get();
    
    if (!doc.exists) {
        throw new Error("Property not found");
    }
    
    // Import deleteReviewsByPropertyId to avoid circular dependency issues
    const { deleteReviewsByPropertyId } = await import("./reviews");
    
    // Delete all reviews for this property first
    const { deletedCount } = await deleteReviewsByPropertyId(propertyId);
    
    // Delete the property itself
    await propertyRef.delete();
    
    return { propertyId, deletedReviews: deletedCount };
}