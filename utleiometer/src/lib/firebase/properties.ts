import { adminDb } from "./admin";

export interface Property {
  propertyId: string;
  address: string;
  zipCode: string;
  city: string;
  imageUrl?: string;
}

export async function createProperty(data: Omit<Property, "propertyId">) {
    const docRef = await adminDb.collection("properties").add(data);
    return { propertyId: docRef.id, ...data };
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