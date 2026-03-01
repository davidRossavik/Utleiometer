"use client";

import { useEffect, useState } from "react";
import { fetchProperties } from "../data/fetchProperties";
import { Property } from "../types";

export function useProperties() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchProperties();
                if (!cancelled) setProperties(data);
            } catch (e) {
                console.error("Failed to load properties:", e);
                if (!cancelled) {
                    setProperties([]);
                    setError("Kunne ikke hente boliger");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    return { properties, loading, error };
}