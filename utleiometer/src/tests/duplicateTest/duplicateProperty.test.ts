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

describe("Duplicate Property Detection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function buildBaseFormData() {
    const formData = new FormData();
    formData.append("address", "Test Street 1");
    formData.append("zipCode", "7030");
    formData.append("city", "Trondheim");
    formData.append("registeredByUid", "user123");
    formData.append("propertyType", "house");
    formData.append("areaSqm", "80");
    formData.append("bedrooms", "3");
    formData.append("bathrooms", "1");
    formData.append("floors", "2");
    formData.append("buildYear", "2010");
    return formData;
  }

  it("returns duplicate error when property already exists", async () => {
    vi.mocked(propertiesLib.getPropertyByAddress).mockResolvedValue({
      propertyId: "existing-id",
      address: "test street 1",
      zipCode: "7030",
      city: "trondheim",
      registeredByUid: "user456",
      propertyType: "house" as const,
      createdAt: new Date(),
    });

    const result = await createPropertyAction(buildBaseFormData());

    expect(result).toEqual({
      error: "Property already exists, please visit the property's page to leave a review.",
    });
    expect(propertiesLib.createProperty).not.toHaveBeenCalled();
  });

  it("normalizes whitespace and case before duplicate check", async () => {
    vi.mocked(propertiesLib.getPropertyByAddress).mockResolvedValue({
      propertyId: "existing-id",
      address: "test street 1",
      zipCode: "7030",
      city: "trondheim",
      registeredByUid: "user456",
      propertyType: "house" as const,
      createdAt: new Date(),
    });

    const formData = buildBaseFormData();
    formData.set("address", "  TEST   STREET   1 ");
    formData.set("city", " TrOnDhEiM ");

    await createPropertyAction(formData);

    expect(propertiesLib.getPropertyByAddress).toHaveBeenCalledWith("test street 1", "7030", "trondheim");
  });

  it("creates property when no duplicate exists", async () => {
    vi.mocked(propertiesLib.getPropertyByAddress).mockResolvedValue(null);

    const newProperty = {
      propertyId: "new-id-123",
      address: "test street 1",
      zipCode: "7030",
      city: "trondheim",
      registeredByUid: "user123",
      reviewCount: 0,
      propertyType: "house" as const,
      areaSqm: 80,
      bedrooms: 3,
      bathrooms: 1,
      floors: 2,
      buildYear: 2010,
      createdAt: new Date(),
    };

    vi.mocked(propertiesLib.createProperty).mockResolvedValue(newProperty);

    const result = await createPropertyAction(buildBaseFormData());

    expect(result).toEqual(newProperty);
    expect(propertiesLib.createProperty).toHaveBeenCalledWith(
      expect.objectContaining({
        address: "test street 1",
        zipCode: "7030",
        city: "trondheim",
        registeredByUid: "user123",
        propertyType: "house",
        areaSqm: 80,
        bedrooms: 3,
        bathrooms: 1,
        floors: 2,
        buildYear: 2010,
      }),
    );
  });

  it("throws when required fields are missing", async () => {
    const formData = new FormData();
    formData.append("address", "test street");

    await expect(createPropertyAction(formData)).rejects.toThrow();
  });

  it("throws when buildYear is invalid", async () => {
    const formData = buildBaseFormData();
    formData.set("buildYear", "1700");

    await expect(createPropertyAction(formData)).rejects.toThrow("Build year must be between 1800 and current year");
  });

  it("throws when propertyType is invalid", async () => {
    const formData = buildBaseFormData();
    formData.set("propertyType", "villa");

    await expect(createPropertyAction(formData)).rejects.toThrow("Property type is invalid");
  });

  it("creates bedsit with bedsit-specific fields", async () => {
    vi.mocked(propertiesLib.getPropertyByAddress).mockResolvedValue(null);
    vi.mocked(propertiesLib.createProperty).mockResolvedValue({
      propertyId: "bedsit-id",
      address: "test street 1",
      zipCode: "7030",
      city: "trondheim",
      registeredByUid: "user123",
      reviewCount: 0,
      propertyType: "bedsit",
      roomAreaSqm: 20,
      hasPrivateBathroom: false,
      otherBedsitsInUnit: 3,
      createdAt: new Date(),
    });

    const formData = buildBaseFormData();
    formData.set("propertyType", "bedsit");
    formData.delete("areaSqm");
    formData.delete("bedrooms");
    formData.delete("bathrooms");
    formData.delete("floors");
    formData.delete("buildYear");
    formData.append("roomAreaSqm", "20");
    formData.append("hasPrivateBathroom", "false");
    formData.append("otherBedsitsInUnit", "3");

    await createPropertyAction(formData);

    expect(propertiesLib.createProperty).toHaveBeenCalledWith(
      expect.objectContaining({
        propertyType: "bedsit",
        roomAreaSqm: 20,
        hasPrivateBathroom: false,
        otherBedsitsInUnit: 3,
      }),
    );
  });
});
