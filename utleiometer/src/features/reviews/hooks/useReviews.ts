"use client";

import { useEffect, useState } from "react";
import { Review } from "../types";
import { fetchReviews } from "../data/fetchReviews";

type UseReviewsMessages = {
    loadReviewsError: string;
};

const defaultMessages: UseReviewsMessages = {
    loadReviewsError: "Kunne ikke hente anmeldelser",
};

export function useReviews({ propertyId, messages = defaultMessages }: { propertyId: string; messages?: UseReviewsMessages }) {
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
                    setError(messages.loadReviewsError);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [propertyId, messages]);

    return { reviews, loading, error };
}