import { db } from "@/lib/firebase/client";
import { collection, getDocs, where, orderBy, query } from "firebase/firestore";
import { Review } from "../types";


export async function fetchReviews(propertyId: string): Promise<Review[]> {
    const rQ = query(
        collection(db, "reviews"),
        where("propertyId", "==", propertyId),
        orderBy("createdAt", "desc")
    );

    const rSnap = await getDocs(rQ);
    return rSnap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Review, "id">),
    }));
}