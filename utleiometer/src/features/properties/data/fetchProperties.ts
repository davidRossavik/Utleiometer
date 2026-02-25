import { db } from "@/lib/firebase/client";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
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