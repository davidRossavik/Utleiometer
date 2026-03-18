"use server";


import {
  createProperty,
  getAllProperties,
  getPropertyByAddress,
  getPropertyById,
  updateProperty,
  deleteProperty,
  type Property,
  type PropertyType,
} from "@/lib/firebase/properties";

import { createReview } from "@/lib/firebase/reviews";
import { adminAuth } from "@/lib/firebase/admin";
import { geocodeAddress } from "@/lib/geocoding";

import type { ReviewRatings } from "@/features/reviews/types";

function parseCategoryRating(formData: FormData, key: string) {
  const value = parseInt(formData.get(key) as string, 10);
  return Number.isInteger(value) ? value : NaN;
}

function buildRatings(formData: FormData): ReviewRatings | null {
  const location = parseCategoryRating(formData, "ratingLocation");
  const noise = parseCategoryRating(formData, "ratingNoise");
  const landlord = parseCategoryRating(formData, "ratingLandlord");
  const condition = parseCategoryRating(formData, "ratingCondition");

  const values = [location, noise, landlord, condition];
  const allValid = values.every((value) => Number.isInteger(value) && value >= 1 && value <= 5);
  if (!allValid) return null;

  const overall = Number((((location + noise + landlord + condition) / 4)).toFixed(1));
  return { location, noise, landlord, condition, overall };
}

type ParseResult =
  | {
      ok: true;
      data: {
        address: string;
        zipCode: string;
        city: string;
        registeredByUid: string;
        imageUrl?: string;
        propertyType: PropertyType;
        areaSqm?: number;
        bedrooms?: number;
        bathrooms?: number;
        floors?: number;
        buildYear?: number;
        roomAreaSqm?: number;
        hasPrivateBathroom?: boolean;
        otherBedsitsInUnit?: number;
      };
    }
  | { ok: false; error: string };


type ParsePropertyDetailsResult =
  | {
      ok: true;
      data: {
        imageUrl?: string;
        propertyType: PropertyType;
        areaSqm?: number;
        bedrooms?: number;
        bathrooms?: number;
        floors?: number;
        buildYear?: number;
        roomAreaSqm?: number;
        hasPrivateBathroom?: boolean;
        otherBedsitsInUnit?: number;
      };
    }
  | { ok: false; error: string };

type ParseAddressAndUserResult =
  | {
      ok: true;
      data: {
        address: string;
        zipCode: string;
        city: string;
        registeredByUid: string;
      };
    }
  | { ok: false; error: string };

async function withGeocodedCoordinates<T extends { address: string; zipCode: string; city: string }>(
  data: T,
) {
  const fullAddress = `${data.address}, ${data.zipCode} ${data.city}, Norway`;

  try {
    const coordinates = await geocodeAddress(fullAddress);
    if (!coordinates) {
      return data;
    }

    return {
      ...data,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    };
  } catch (error) {
    console.warn("Geocoding failed. Property will be created without coordinates.", error);
    return data;
  }
}


const PROPERTY_TYPE_VALUES: PropertyType[] = ["house", "apartment", "bedsit"];
const DUPLICATE_ERROR = "Property already exists, please visit the property's page to leave a review.";

function normalizeText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

function normalizeComparableText(value: unknown) {
  return String(value ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

function normalizeZipCode(value: unknown) {
  return String(value ?? "").trim();
}

function asTrimmedString(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function parsePositiveNumber(value: FormDataEntryValue | null) {
  const num = Number(String(value ?? "").trim());
  if (!Number.isFinite(num) || num <= 0) {
    return null;
  }
  return num;
}

function parseBooleanValue(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return null;
}

function parsePropertyDetailsData(formData: FormData): ParsePropertyDetailsResult {
  const propertyType = asTrimmedString(formData.get("propertyType")) as PropertyType;
  const imageUrl = asTrimmedString(formData.get("imageUrl"));

  if (!PROPERTY_TYPE_VALUES.includes(propertyType)) {
    return { ok: false, error: "Property type is invalid" };
  }

  const currentYear = new Date().getFullYear();

  if (propertyType === "house" || propertyType === "apartment") {
    const areaSqm = parsePositiveNumber(formData.get("areaSqm"));
    const bedrooms = parsePositiveNumber(formData.get("bedrooms"));
    const bathrooms = parsePositiveNumber(formData.get("bathrooms"));
    const floors = parsePositiveNumber(formData.get("floors"));
    const buildYear = parsePositiveNumber(formData.get("buildYear"));

    if (
      areaSqm === null ||
      bedrooms === null ||
      bathrooms === null ||
      floors === null ||
      buildYear === null
    ) {
      return { ok: false, error: "All property details must be valid positive numbers" };
    }

    if (!Number.isInteger(buildYear) || buildYear < 1800 || buildYear > currentYear) {
      return { ok: false, error: "Build year must be between 1800 and current year" };
    }

    return {
      ok: true,
      data: {
        propertyType,
        areaSqm,
        bedrooms,
        bathrooms,
        floors,
        buildYear,
        ...(imageUrl ? { imageUrl } : {}),
      },
    };
  }

  const roomAreaSqm = parsePositiveNumber(formData.get("roomAreaSqm"));
  const hasPrivateBathroom = parseBooleanValue(formData.get("hasPrivateBathroom"));
  const otherBedsitsInUnit = parsePositiveNumber(formData.get("otherBedsitsInUnit"));

  if (roomAreaSqm === null || hasPrivateBathroom === null || otherBedsitsInUnit === null) {
    return { ok: false, error: "All bedsit details are required and must be valid" };
  }

  return {
    ok: true,
    data: {
      propertyType,
      roomAreaSqm,
      hasPrivateBathroom,
      otherBedsitsInUnit,
      ...(imageUrl ? { imageUrl } : {}),
    },
  };
}

function parsePropertyData(formData: FormData): ParseResult {
  const address = normalizeText(formData.get("address"));
  const zipCode = asTrimmedString(formData.get("zipCode"));
  const city = normalizeText(formData.get("city"));
  const registeredByUid = asTrimmedString(formData.get("registeredByUid"));

  if (!address || !zipCode || !city || !registeredByUid) {
    return { ok: false, error: "Address, zip code, city, and user ID are required" };
  }

  const details = parsePropertyDetailsData(formData);
  if (!details.ok) return details;

  return {
    ok: true,
    data: {
      address,
      zipCode,
      city,
      registeredByUid,
      ...details.data,
    },
  };
}

function parseAddressAndUser(formData: FormData): ParseAddressAndUserResult {
  const address = normalizeText(formData.get("address"));
  const zipCode = asTrimmedString(formData.get("zipCode"));
  const city = normalizeText(formData.get("city"));
  const registeredByUid = asTrimmedString(formData.get("registeredByUid"));

  if (!address || !zipCode || !city || !registeredByUid) {
    return { ok: false, error: "Address, zip code, city, and user ID are required" };
  }

  return {
    ok: true,
    data: { address, zipCode, city, registeredByUid },
  };
}

function parseAddressLookup(formData: FormData) {
  const address = normalizeText(formData.get("address"));
  const zipCode = asTrimmedString(formData.get("zipCode"));
  const city = normalizeText(formData.get("city"));

  if (!address || !zipCode || !city) {
    return { ok: false as const, error: "Address, zip code and city are required" };
  }

  return { ok: true as const, data: { address, zipCode, city } };
}

function findMatchingProperty(properties: Property[], address: string, zipCode: string, city: string) {
  return properties.find((property) => {
    const propertyAddress = normalizeComparableText(property.address);
    const propertyZip = normalizeZipCode(property.zipCode);
    const propertyCity = normalizeComparableText(property.city);

    return propertyAddress === address && propertyZip === zipCode && propertyCity === city;
  });
}

async function findPropertyByAddressCaseInsensitive(address: string, zipCode: string, city: string) {
  const properties = await getAllProperties();
  return findMatchingProperty(properties, address, zipCode, city) ?? null;
}

export async function lookupPropertyByAddressAction(formData: FormData) {
  const parsed = parseAddressLookup(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  try {
    const existingProperty = await findPropertyByAddressCaseInsensitive(
      parsed.data.address,
      parsed.data.zipCode,
      parsed.data.city,
    );

    if (!existingProperty) {
      return { exists: false as const };
    }

    return {
      exists: true as const,
      propertyId: existingProperty.propertyId,
      propertyType: existingProperty.propertyType,
    };
  } catch (error) {
    console.error("Error looking up property:", error);
    return { error: "Could not look up property" };
  }
}

export async function createPropertyAction(formData: FormData) {
  const parsed = parsePropertyData(formData);

  if (!parsed.ok) {
    throw new Error(parsed.error);
  }

  const { data } = parsed;

  const existingProperty = await getPropertyByAddress(data.address, data.zipCode, data.city);
  if (existingProperty) {
    return { error: DUPLICATE_ERROR };
  }

  try {
    const propertyData = await withGeocodedCoordinates(data);
    const newProperty = await createProperty(propertyData);
    return newProperty;
  } catch (error) {
    console.error("Error creating property:", error);
    throw new Error("Failed to create property");
  }
}

export async function createPropertyAndReviewAction(formData: FormData) {
  const parsed = parsePropertyData(formData);

  const ratings = buildRatings(formData);
  const comment = asTrimmedString(formData.get("comment"));
  const reviewImageUrl = asTrimmedString(formData.get("reviewImageUrl"));
  const userDisplayName = asTrimmedString(formData.get("userDisplayName"));

  if (!parsed.ok || !ratings || !comment) {
    return {
      error: parsed.ok
        ? "Alle felter er påkrevd og alle kategorier må være mellom 1 og 5"
        : parsed.error,
    };
  }

  const { data } = parsed;

  const existingProperty = await getPropertyByAddress(data.address, data.zipCode, data.city);
  if (existingProperty) {
    return { error: DUPLICATE_ERROR };
  }

  try {
    const propertyData = await withGeocodedCoordinates(data);
    const newProperty = await createProperty(propertyData);

    await createReview({
      userId: data.registeredByUid,
      userDisplayName,
      propertyId: newProperty.propertyId,
      rating: ratings.overall,
      ratings,
      comment,
      ...(reviewImageUrl ? { imageUrl: reviewImageUrl } : {}),
    });

    return { propertyId: newProperty.propertyId };
  } catch (error) {
    console.error("Error creating property and review:", error);
    return { error: "Noe gikk galt" };
  }
}

export async function submitUnifiedReviewAction(formData: FormData) {
  const addressAndUser = parseAddressAndUser(formData);
  const ratings = buildRatings(formData);
  const comment = asTrimmedString(formData.get("comment"));
  const reviewImageUrl = asTrimmedString(formData.get("reviewImageUrl"));
  const userDisplayName = asTrimmedString(formData.get("userDisplayName"));

  if (!addressAndUser.ok || !ratings || !comment) {
    return {
      error: addressAndUser.ok
        ? "Alle felter er påkrevd og alle kategorier må være mellom 1 og 5"
        : addressAndUser.error,
    };
  }

  try {
    const existingProperty = await findPropertyByAddressCaseInsensitive(
      addressAndUser.data.address,
      addressAndUser.data.zipCode,
      addressAndUser.data.city,
    );

    let propertyId: string;

    if (existingProperty) {
      propertyId = existingProperty.propertyId;
    } else {
      const parsedDetails = parsePropertyDetailsData(formData);
      if (!parsedDetails.ok) {
        return { error: parsedDetails.error };
      }

      const propertyData = await withGeocodedCoordinates({
        address: addressAndUser.data.address,
        zipCode: addressAndUser.data.zipCode,
        city: addressAndUser.data.city,
        registeredByUid: addressAndUser.data.registeredByUid,
        ...parsedDetails.data,
      });

      const newProperty = await createProperty(propertyData);

      propertyId = newProperty.propertyId;
    }

    await createReview({
      userId: addressAndUser.data.registeredByUid,
      userDisplayName,
      propertyId,
      rating: ratings.overall,
      ratings,
      comment,
      ...(reviewImageUrl ? { imageUrl: reviewImageUrl } : {}),
    });

    return { propertyId };
  } catch (error) {
    console.error("Error submitting unified review flow:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : "No stack trace",
      });
      return { error: error instanceof Error ? error.message : "Noe gikk galt" };
  }
}

export async function getPropertyAction(propertyId: string) {
  try {
    const property = await getPropertyById(propertyId);
    // Map Firebase propertyId to features/properties id format
    return {
      id: property.propertyId,
      address: property.address,
      zipCode: property.zipCode,
      city: property.city,
      registeredByUid: property.registeredByUid,
      updatedByUid: property.updatedByUid,
      imageUrl: property.imageUrl,
      imageUrls: property.imageUrls,
      propertyType: property.propertyType,
      areaSqm: property.areaSqm,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      floors: property.floors,
      buildYear: property.buildYear,
      roomAreaSqm: property.roomAreaSqm,
      hasPrivateBathroom: property.hasPrivateBathroom,
      otherBedsitsInUnit: property.otherBedsitsInUnit,
      latitude: property.latitude,
      longitude: property.longitude,
    };
  } catch (error) {
    console.error("Error fetching property:", error);
    return { error: error instanceof Error ? error.message : "Could not fetch property" };
  }
}

export async function updatePropertyImageUrlsAction(
  propertyId: string,
  imageUrls: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const property = await getPropertyById(propertyId);
    
    // Verify the caller is the property owner
    const { uid } = await adminAuth.getUser(property.registeredByUid).catch(() => ({ uid: null }));
    
    // Update property with new image URLs (keep first as imageUrl for backwards compatibility)
    const updateData: any = { imageUrls };
    if (imageUrls.length > 0) {
      updateData.imageUrl = imageUrls[0];
    }
    
    await (updateProperty as any)(propertyId, updateData);
    return { success: true };
  } catch (error) {
    console.error("Error updating property images:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update property images"
    };
  }
}

/**
 * Delete a property and all its related reviews (admin only)
 */
export async function deletePropertyAction(
    propertyId: string,
    callerIdToken: string
): Promise<{ success: boolean; error?: string; deletedReviews?: number }> {
    try {
        // Verify the ID token and check admin claim
        const decodedToken = await adminAuth.verifyIdToken(callerIdToken);
        
        if (decodedToken.admin !== true) {
            return { 
                success: false, 
                error: "Unauthorized: Only admins can delete properties" 
            };
        }

        // Delete property and all related reviews
        const { deletedReviews } = await deleteProperty(propertyId);

        return { 
            success: true, 
            deletedReviews 
        };
    } catch (error) {
        console.error("Error deleting property:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete property"
        };
    }
}
