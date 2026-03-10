"use client";

import { useMemo } from "react";
import { Property } from "../types";

export type PropertySearchFilters = {
    search: string;
    area: string;
    minRating: number;
};

function normalizeString(value: string | undefined) {
    return (value ?? "").trim().toLowerCase();
}

function clampRating(value: number) {
    if (Number.isNaN(value)) return 0;
    return Math.min(5, Math.max(0, value));
}

export function getPropertyOverallRating(property: Property): number | undefined {
    if (typeof property.ratingsSummary?.overall === "number") {
        return property.ratingsSummary.overall;
    }

    if (typeof property.ratingAvg === "number") {
        return property.ratingAvg;
    }

    return undefined;
}

export function filterProperties(properties: Property[], filters: PropertySearchFilters) {
    const normalizedQuery = normalizeString(filters.search);
    const normalizedArea = normalizeString(filters.area);
    const minRating = clampRating(filters.minRating);

    return properties.filter((property) => {
        if (normalizedQuery) {
            const haystack = `${property.address ?? ""} ${property.city ?? ""} ${property.country ?? ""}`.toLowerCase();
            if (!haystack.includes(normalizedQuery)) return false;
        }

        if (normalizedArea) {
            const propertyCity = normalizeString(property.city);
            if (propertyCity !== normalizedArea) return false;
        }

        if (minRating > 0) {
            const rating = getPropertyOverallRating(property);
            if (typeof rating !== "number") return false;
            if (rating < minRating) return false;
        }

        return true;
    });
}

export function usePropertySearch(properties: Property[], filters: PropertySearchFilters) {
    return useMemo(
        () => filterProperties(properties, filters),
        [properties, filters.search, filters.area, filters.minRating],
    );
}
