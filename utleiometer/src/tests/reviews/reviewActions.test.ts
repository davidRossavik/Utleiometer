import { beforeEach, describe, expect, it, vi } from "vitest";

const createReviewMock = vi.fn();
const createReviewReportMock = vi.fn();
const getReviewDocMock = vi.fn();

const reviewDocSnapshot = {
  exists: true,
  data: () => ({
    propertyId: "property-1",
    userId: "author-1",
  }),
};

vi.mock("@/lib/firebase/reviews", () => ({
  createReview: (...args: unknown[]) => createReviewMock(...args),
  createReviewReport: (...args: unknown[]) => createReviewReportMock(...args),
  updateReview: vi.fn(),
  deleteReview: vi.fn(),
}));

vi.mock("@/lib/firebase/admin", () => ({
  adminAuth: {
    verifyIdToken: vi.fn(),
  },
  adminDb: {
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        get: getReviewDocMock,
      })),
    })),
  },
  FieldValue: {},
}));

import { createReviewAction, reportReviewAction } from "@/app/[locale]/actions/reviews";

describe("createReviewAction", () => {
  beforeEach(() => {
    createReviewMock.mockReset();
    createReviewReportMock.mockReset();
    getReviewDocMock.mockReset();
    getReviewDocMock.mockResolvedValue(reviewDocSnapshot);
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

describe("reportReviewAction", () => {
  beforeEach(() => {
    createReviewReportMock.mockReset();
    getReviewDocMock.mockReset();
    getReviewDocMock.mockResolvedValue(reviewDocSnapshot);
  });

  it("creates a report linked to the review", async () => {
    createReviewReportMock.mockResolvedValueOnce({ reportId: "review-1_user-2", alreadyReported: false });

    const result = await reportReviewAction("review-1", "user-2", "property-1", "Misvisende anmeldelse");

    expect(createReviewReportMock).toHaveBeenCalledWith({
      reviewId: "review-1",
      reporterUserId: "user-2",
      propertyId: "property-1",
      reviewUserId: "author-1",
      reason: "Misvisende anmeldelse",
    });
    expect(result).toEqual({
      success: true,
      reportId: "review-1_user-2",
      alreadyReported: false,
    });
  });

  it("rejects reporting your own review", async () => {
    getReviewDocMock.mockResolvedValueOnce({
      exists: true,
      data: () => ({ propertyId: "property-1", userId: "user-2" }),
    });

    const result = await reportReviewAction("review-1", "user-2", "property-1", "Ikke relevant");

    expect(createReviewReportMock).not.toHaveBeenCalled();
    expect(result).toEqual({ error: "Du kan ikke rapportere din egen anmeldelse" });
  });
});
