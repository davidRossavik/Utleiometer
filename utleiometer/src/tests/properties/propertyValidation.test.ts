import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPropertyAction } from "@/app/[locale]/actions/properties";
import * as propertiesLib from "@/lib/firebase/properties";

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

function baseData() {
  const formData = new FormData();
  formData.append("address", "Street 1");
  formData.append("zipCode", "7030");
  formData.append("city", "Trondheim");
  formData.append("registeredByUid", "user-1");
  return formData;
}

describe("createPropertyAction validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(propertiesLib.getPropertyByAddress).mockResolvedValue(null);
    vi.mocked(propertiesLib.createProperty).mockImplementation(async (data: any) => ({
      propertyId: "new-property",
      createdAt: new Date(),
      ...data,
    }));
  });

  it("accepts valid apartment payload", async () => {
    const formData = baseData();
    formData.append("propertyType", "apartment");
    formData.append("areaSqm", "55");
    formData.append("bedrooms", "2");
    formData.append("bathrooms", "1");
    formData.append("floors", "1");
    formData.append("buildYear", "2015");

    await expect(createPropertyAction(formData)).resolves.toEqual(
      expect.objectContaining({ propertyType: "apartment" }),
    );
  });

  it("rejects bedsit with missing fields", async () => {
    const formData = baseData();
    formData.append("propertyType", "bedsit");
    formData.append("roomAreaSqm", "18");

    await expect(createPropertyAction(formData)).rejects.toThrow(
      "All bedsit details are required and must be valid",
    );
  });

  it("rejects non-boolean hasPrivateBathroom", async () => {
    const formData = baseData();
    formData.append("propertyType", "bedsit");
    formData.append("roomAreaSqm", "18");
    formData.append("hasPrivateBathroom", "maybe");
    formData.append("otherBedsitsInUnit", "3");

    await expect(createPropertyAction(formData)).rejects.toThrow(
      "All bedsit details are required and must be valid",
    );
  });
});
