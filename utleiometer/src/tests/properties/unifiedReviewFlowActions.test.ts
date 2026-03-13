import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  lookupPropertyByAddressAction,
  submitUnifiedReviewAction,
} from "@/app/[locale]/actions/properties";
import * as propertiesLib from "@/lib/firebase/properties";
import * as reviewsLib from "@/lib/firebase/reviews";

vi.mock("@/lib/firebase/admin", () => ({
  adminDb: {},
  adminAuth: {},
}));

vi.mock("@/lib/firebase/properties", () => ({
  createProperty: vi.fn(),
  getAllProperties: vi.fn(),
  getPropertyByAddress: vi.fn(),
  getPropertyById: vi.fn(),
}));

vi.mock("@/lib/firebase/reviews", () => ({
  createReview: vi.fn(),
}));

function buildBaseReviewFormData() {
  const formData = new FormData();
  formData.append("address", "Test Street 1");
  formData.append("zipCode", "7030");
  formData.append("city", "Trondheim");
  formData.append("registeredByUid", "user-1");
  formData.append("userDisplayName", "ola_nordmann");
  formData.append("ratingLocation", "4");
  formData.append("ratingNoise", "4");
  formData.append("ratingLandlord", "4");
  formData.append("ratingCondition", "4");
  formData.append("comment", "Solid property");
  return formData;
}

describe("unified review flow actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("matches existing property case-insensitively on address and city", async () => {
    vi.mocked(propertiesLib.getAllProperties).mockResolvedValueOnce([
      {
        propertyId: "prop-1",
        address: "TEST STREET 1",
        zipCode: "7030",
        city: "TRONDHEIM",
        registeredByUid: "owner",
        createdAt: new Date(),
        propertyType: "house",
      },
    ]);

    const lookupForm = new FormData();
    lookupForm.append("address", "  test   street 1 ");
    lookupForm.append("zipCode", "7030");
    lookupForm.append("city", " trondheim ");

    const result = await lookupPropertyByAddressAction(lookupForm);

    expect(result).toEqual({ exists: true, propertyId: "prop-1", propertyType: "house" });
  });

  it("creates review on existing property without creating new property", async () => {
    vi.mocked(propertiesLib.getAllProperties).mockResolvedValueOnce([
      {
        propertyId: "existing-1",
        address: "test street 1",
        zipCode: "7030",
        city: "trondheim",
        registeredByUid: "owner",
        createdAt: new Date(),
        propertyType: "house",
      },
    ]);
    vi.mocked(reviewsLib.createReview).mockResolvedValueOnce({
      reviewId: "rev-1",
      userId: "user-1",
      propertyId: "existing-1",
      comment: "Solid property",
      createdAt: new Date(),
    } as any);

    const result = await submitUnifiedReviewAction(buildBaseReviewFormData());

    expect(result).toEqual({ propertyId: "existing-1" });
    expect(propertiesLib.createProperty).not.toHaveBeenCalled();
    expect(reviewsLib.createReview).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-1", userDisplayName: "ola_nordmann", propertyId: "existing-1" }),
    );
  });

  it("creates property and review when property does not exist", async () => {
    vi.mocked(propertiesLib.getAllProperties).mockResolvedValueOnce([]);
    vi.mocked(propertiesLib.createProperty).mockResolvedValueOnce({
      propertyId: "new-1",
      address: "test street 1",
      zipCode: "7030",
      city: "trondheim",
      registeredByUid: "user-1",
      createdAt: new Date(),
      propertyType: "house",
      areaSqm: 80,
      bedrooms: 3,
      bathrooms: 1,
      floors: 2,
      buildYear: 2010,
    });
    vi.mocked(reviewsLib.createReview).mockResolvedValueOnce({ reviewId: "rev-1" } as any);

    const formData = buildBaseReviewFormData();
    formData.append("propertyType", "house");
    formData.append("areaSqm", "80");
    formData.append("bedrooms", "3");
    formData.append("bathrooms", "1");
    formData.append("floors", "2");
    formData.append("buildYear", "2010");

    const result = await submitUnifiedReviewAction(formData);

    expect(result).toEqual({ propertyId: "new-1" });
    expect(propertiesLib.createProperty).toHaveBeenCalledTimes(1);
    expect(reviewsLib.createReview).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-1", userDisplayName: "ola_nordmann", propertyId: "new-1" }),
    );
  });

  it("avoids duplicate creation when property appears between lookup and submit", async () => {
    vi.mocked(propertiesLib.getAllProperties)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          propertyId: "late-existing",
          address: "test street 1",
          zipCode: "7030",
          city: "trondheim",
          registeredByUid: "owner",
          createdAt: new Date(),
          propertyType: "house",
        },
      ]);
    vi.mocked(reviewsLib.createReview).mockResolvedValueOnce({ reviewId: "rev-2" } as any);

    const lookupForm = new FormData();
    lookupForm.append("address", "Test Street 1");
    lookupForm.append("zipCode", "7030");
    lookupForm.append("city", "Trondheim");
    const lookupResult = await lookupPropertyByAddressAction(lookupForm);
    expect(lookupResult).toEqual({ exists: false });

    const submitResult = await submitUnifiedReviewAction(buildBaseReviewFormData());

    expect(submitResult).toEqual({ propertyId: "late-existing" });
    expect(propertiesLib.createProperty).not.toHaveBeenCalled();
    expect(reviewsLib.createReview).toHaveBeenCalledWith(
      expect.objectContaining({ userDisplayName: "ola_nordmann", propertyId: "late-existing" }),
    );
  });
});
