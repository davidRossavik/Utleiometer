"use server";

import { adminDb, FieldValue } from "@/lib/firebase/admin";

export async function deleteUserData(userId: string) {
  try {
    // 1. Finn alle reviews av brukeren
    const reviewsSnapshot = await adminDb
      .collection("reviews")
      .where("userId", "==", userId)
      .get();

    const propertyUpdates = new Map<string, number>();

    // 2. Slett alle reviews og tell hvor mange per property
    for (const reviewDoc of reviewsSnapshot.docs) {
      const review = reviewDoc.data();
      const propertyId = review.propertyId;

      // Tell ned reviews per property
      propertyUpdates.set(
        propertyId,
        (propertyUpdates.get(propertyId) || 0) + 1
      );

      // Slett review
      await reviewDoc.ref.delete();
    }

    // 3. Oppdater reviewCount og slett properties uten reviews
    for (const [propertyId, reviewsDeleted] of propertyUpdates.entries()) {
      const propertyRef = adminDb.collection("properties").doc(propertyId);
      const propertyDoc = await propertyRef.get();

      if (propertyDoc.exists) {
        const propertyData = propertyDoc.data();
        const currentReviewCount = propertyData?.reviewCount || 0;
        const newReviewCount = currentReviewCount - reviewsDeleted;

        if (newReviewCount <= 0) {
          // Slett property hvis den ikke har flere reviews
          await propertyRef.delete();
        } else {
          // Oppdater review count
          await propertyRef.update({
            reviewCount: FieldValue.increment(-reviewsDeleted),
          });
        }
      }
    }

    return { success: true, deletedReviews: reviewsSnapshot.size };
  } catch (error) {
    console.error("Error deleting user data:", error);
    throw new Error("Kunne ikke slette brukerdata");
  }
}
