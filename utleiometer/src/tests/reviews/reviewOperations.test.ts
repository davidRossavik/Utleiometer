//Generert ved hjelp av Claude Sonnet 4.5
// 

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Firebase admin before importing functions
vi.mock("@/lib/firebase/admin", () => {
  const mockUpdate = vi.fn();
  const mockDelete = vi.fn();
  const mockDoc = vi.fn(() => ({
    update: mockUpdate,
    delete: mockDelete,
  }));
  const mockCollection = vi.fn(() => ({
    doc: mockDoc,
  }));

  return {
    adminDb: {
      collection: mockCollection,
    },
  };
});

vi.mock("@/lib/firebase/properties", () => ({
  incrementReviewCount: vi.fn(),
  decrementReviewCount: vi.fn(),
}));

import { updateReview, deleteReview } from "@/lib/firebase/reviews";
import { adminDb } from "@/lib/firebase/admin";
import { decrementReviewCount } from "@/lib/firebase/properties";

describe("Review Operations - Edit and Delete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("updateReview", () => {
    it("should update review with new ratings and comment", async () => {
      const reviewId = "review123";
      const updateData = {
        ratings: {
          location: 4,
          noise: 3,
          landlord: 5,
          condition: 4,
          overall: 4,
        },
        comment: "Oppdatert kommentar",
        title: "Bra bolig",
      };

      const result = await updateReview(reviewId, updateData);

      expect(adminDb.collection).toHaveBeenCalledWith("reviews");
      expect(adminDb.collection("reviews").doc).toHaveBeenCalledWith(reviewId);
      expect(adminDb.collection("reviews").doc(reviewId).update).toHaveBeenCalledWith(
        expect.objectContaining({
          ratings: updateData.ratings,
          comment: updateData.comment,
          title: updateData.title,
          rating: 4, // legacy support
        })
      );
      expect(result.reviewId).toBe(reviewId);
    });

    it("should set empty title if not provided", async () => {
      const reviewId = "review456";
      const updateData = {
        ratings: {
          location: 3,
          noise: 3,
          landlord: 3,
          condition: 3,
          overall: 3,
        },
        comment: "Grei bolig",
      };

      await updateReview(reviewId, updateData);

      expect(adminDb.collection("reviews").doc(reviewId).update).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "",
        })
      );
    });

    it("should include updatedAt timestamp", async () => {
      const reviewId = "review789";
      const updateData = {
        ratings: {
          location: 5,
          noise: 5,
          landlord: 5,
          condition: 5,
          overall: 5,
        },
        comment: "Perfekt!",
      };

      await updateReview(reviewId, updateData);

      expect(adminDb.collection("reviews").doc(reviewId).update).toHaveBeenCalledWith(
        expect.objectContaining({
          updatedAt: expect.any(Date),
        })
      );
    });
  });

  describe("deleteReview", () => {
    it("should delete review and decrement property review count", async () => {
      const reviewId = "review123";
      const propertyId = "property456";

      const result = await deleteReview(reviewId, propertyId);

      expect(adminDb.collection).toHaveBeenCalledWith("reviews");
      expect(adminDb.collection("reviews").doc).toHaveBeenCalledWith(reviewId);
      expect(adminDb.collection("reviews").doc(reviewId).delete).toHaveBeenCalled();
      expect(decrementReviewCount).toHaveBeenCalledWith(propertyId);
      expect(result.reviewId).toBe(reviewId);
    });

    it("should handle deletion of multiple reviews independently", async () => {
      const review1 = "review1";
      const review2 = "review2";
      const propertyId = "property123";

      await deleteReview(review1, propertyId);
      await deleteReview(review2, propertyId);

      expect(adminDb.collection("reviews").doc).toHaveBeenCalledTimes(2);
      expect(adminDb.collection("reviews").doc(review1).delete).toHaveBeenCalled();
      expect(adminDb.collection("reviews").doc(review2).delete).toHaveBeenCalled();
      expect(decrementReviewCount).toHaveBeenCalledTimes(2);
    });
  });
});
