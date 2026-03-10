// Common types related to properties
export type PropertyRatingsSummary = {
    overall?: number;
    location?: number;
    noise?: number;
    landlord?: number;
    condition?: number;
};

export type PropertyType = "house" | "apartment" | "bedsit";

export type Property = {
    id: string;
    address?: string;
    zipCode?: string;
    city?: string;
    country?: string;
    ownerName?: string;
    ratingAvg?: number;
    ratingCount?: number;
    ratingsSummary?: PropertyRatingsSummary;
    propertyType?: PropertyType;
    areaSqm?: number;
    bedrooms?: number;
    bathrooms?: number;
    floors?: number;
    buildYear?: number;
    roomAreaSqm?: number;
    hasPrivateBathroom?: boolean;
    otherBedsitsInUnit?: number;
};
