import { beforeEach, describe, expect, it, vi } from "vitest";

const createReviewMock = vi.fn();

vi.mock("@/lib/firebase/reviews", () => ({
  createReview: (...args: unknown[]) => createReviewMock(...args),
  updateReview: vi.fn(),
  deleteReview: vi.fn(),
}));

vi.mock("@/lib/firebase/admin", () => ({
  adminDb: {},
  FieldValue: {},
}));

import { createReviewAction } from "@/app/[locale]/actions/reviews";

describe("createReviewAction", () => {
  beforeEach(() => {
    createReviewMock.mockReset();
  });

  it("passes userDisplayName to createReview when provided", async () => {
    createReviewMock.mockResolvedValueOnce({ reviewId: "review-1" });

    const formData = new FormData();
    formData.append("userId", "user-1");
    formData.append("userDisplayName", "ola_nordmann");
    formData.append("propertyId", "property-1");
    formData.append("comment", "Bra sted");
    formData.append("ratingLocation", "4");
    formData.append("ratingNoise", "4");
    formData.append("ratingLandlord", "5");
    formData.append("ratingCondition", "3");

    await createReviewAction(formData);

    expect(createReviewMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        userDisplayName: "ola_nordmann",
        propertyId: "property-1",
      }),
    );
  });
});
