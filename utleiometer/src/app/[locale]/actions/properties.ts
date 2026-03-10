"use server";

import {
  createProperty,
  getAllProperties,
  getPropertyByAddress,
  getPropertyById,
  type Property,
  type PropertyType,
} from "@/lib/firebase/properties";
import { createReview } from "@/lib/firebase/reviews";
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
    const newProperty = await createProperty(data);
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
    const newProperty = await createProperty(data);

    await createReview({
      userId: data.registeredByUid,
      propertyId: newProperty.propertyId,
      rating: ratings.overall,
      ratings,
      comment,
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

      const newProperty = await createProperty({
        address: addressAndUser.data.address,
        zipCode: addressAndUser.data.zipCode,
        city: addressAndUser.data.city,
        registeredByUid: addressAndUser.data.registeredByUid,
        ...parsedDetails.data,
      });

      propertyId = newProperty.propertyId;
    }

    await createReview({
      userId: addressAndUser.data.registeredByUid,
      propertyId,
      rating: ratings.overall,
      ratings,
      comment,
    });

    return { propertyId };
  } catch (error) {
    console.error("Error submitting unified review flow:", error);
    return { error: "Noe gikk galt" };
  }
}

export async function getPropertyAction(propertyId: string) {
  try {
    const property = await getPropertyById(propertyId);
    return property;
  } catch (error) {
    console.error("Error fetching property:", error);
    return { error: "Could not fetch property" };
  }
}
