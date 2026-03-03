import { db } from "@/lib/firebase/client";
import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";
import { Property } from "../types";

export async function fetchProperties(): Promise<Property[]> {
    
    const q = query(
        collection(db, "properties"), 
        orderBy("address", "asc")
    );
    
    const snap = await getDocs(q);

    return snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Property, "id">),
    }));
}

export async function fetchPropertyById(propertyId: string): Promise<Property | null> {
    const docRef = doc(db, "properties", propertyId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
        return null;
    }
    
    return {
        id: docSnap.id,
        ...(docSnap.data() as Omit<Property, "id">),
    };
}