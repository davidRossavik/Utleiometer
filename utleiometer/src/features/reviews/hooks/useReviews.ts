"use client";

import { useEffect, useState } from "react";
import { Review } from "../types";
import { fetchReviews } from "../data/fetchReviews";

export function useReviews({ propertyId }: { propertyId: string }) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!propertyId) {
            setReviews([]);
            setLoading(false);
            setError(null);
            return;
        }

        let cancelled = false;

        async function load() {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchReviews(propertyId);
                if (!cancelled) setReviews(data);

            } catch (e) {
                console.error("Failed to load reviews:", e);
                if (!cancelled) {
                    setReviews([]);
                    setError("Kunne ikke hente anmeldelser");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [propertyId]);

    return { reviews, loading, error };
}