"use client";

import { useMemo } from "react";
import { Property } from "../types";

export function usePropertySearch(properties: Property[], search: string) {
    return useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return properties;

        return properties.filter((p) => {
            const hay = `${p.address ?? ""} ${p.city ?? ""} ${p.country ?? ""}`.toLowerCase();
            return hay.includes(q);
        });
    }, [properties, search]);
}