import { db } from "@/lib/firebase/client";
import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";
import { Property } from "../types";

type RatingAggregate = {
    sum: number;
    count: number;
};

type RatingAggregatesByCategory = {
    overall: RatingAggregate;
    location: RatingAggregate;
    noise: RatingAggregate;
    landlord: RatingAggregate;
    condition: RatingAggregate;
};

type FirestoreTimestampLike = {
    toDate: () => Date;
};

function createEmptyCategoryAggregates(): RatingAggregatesByCategory {
    return {
        overall: { sum: 0, count: 0 },
        location: { sum: 0, count: 0 },
        noise: { sum: 0, count: 0 },
        landlord: { sum: 0, count: 0 },
        condition: { sum: 0, count: 0 },
    };
}

function getNumericRating(value: unknown): number | null {
    return typeof value === "number" ? value : null;
}

function addRating(aggregate: RatingAggregate, value: number | null) {
    if (typeof value !== "number") return;
    aggregate.sum += value;
    aggregate.count += 1;
}

function getReviewRatings(raw: unknown) {
    if (!raw || typeof raw !== "object") return null;
    const review = raw as {
        rating?: unknown;
        ratings?: {
            overall?: unknown;
            location?: unknown;
            noise?: unknown;
            landlord?: unknown;
            condition?: unknown;
        };
    };

    return {
        overall: getNumericRating(review.ratings?.overall) ?? getNumericRating(review.rating), // legacy fallback
        location: getNumericRating(review.ratings?.location),
        noise: getNumericRating(review.ratings?.noise),
        landlord: getNumericRating(review.ratings?.landlord),
        condition: getNumericRating(review.ratings?.condition),
    };
}

function averageValue(aggregate: RatingAggregate): number | undefined {
    if (!aggregate.count) return undefined;
    return Number((aggregate.sum / aggregate.count).toFixed(1));
}

function getTimestampMs(value: unknown): number | undefined {
    if (value instanceof Date) {
        const ms = value.getTime();
        return Number.isFinite(ms) ? ms : undefined;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === "string") {
        const ms = Date.parse(value);
        return Number.isFinite(ms) ? ms : undefined;
    }

    if (value && typeof value === "object" && "toDate" in value) {
        const maybeTimestamp = value as FirestoreTimestampLike;
        if (typeof maybeTimestamp.toDate === "function") {
            const date = maybeTimestamp.toDate();
            const ms = date.getTime();
            return Number.isFinite(ms) ? ms : undefined;
        }
    }

    return undefined;
}

export async function fetchProperties(): Promise<Property[]> {
    
    const q = query(
        collection(db, "properties"), 
        orderBy("address", "asc")
    );
    
    const [propertySnap, reviewSnap] = await Promise.all([
        getDocs(q),
        getDocs(collection(db, "reviews")),
    ]);

    const ratingsByProperty = new Map<string, RatingAggregatesByCategory>();
    const latestReviewAtByProperty = new Map<string, number>();
    reviewSnap.docs.forEach((reviewDoc) => {
        const reviewData = reviewDoc.data() as { propertyId?: unknown; createdAt?: unknown };
        if (typeof reviewData.propertyId !== "string") return;

        const reviewRatings = getReviewRatings(reviewDoc.data());
        if (!reviewRatings) return;

        const current = ratingsByProperty.get(reviewData.propertyId) ?? createEmptyCategoryAggregates();
        addRating(current.overall, reviewRatings.overall);
        addRating(current.location, reviewRatings.location);
        addRating(current.noise, reviewRatings.noise);
        addRating(current.landlord, reviewRatings.landlord);
        addRating(current.condition, reviewRatings.condition);
        ratingsByProperty.set(reviewData.propertyId, current);

        const createdAtMs = getTimestampMs(reviewData.createdAt);
        if (typeof createdAtMs === "number") {
            const previousLatest = latestReviewAtByProperty.get(reviewData.propertyId) ?? Number.NEGATIVE_INFINITY;
            if (createdAtMs > previousLatest) {
                latestReviewAtByProperty.set(reviewData.propertyId, createdAtMs);
            }
        }
    });

    return propertySnap.docs.map((d) => {
        const aggregate = ratingsByProperty.get(d.id);
        const ratingAvg = aggregate ? averageValue(aggregate.overall) : undefined;
        const ratingCount = aggregate?.overall.count ?? 0;

        return {
            id: d.id,
            ...(d.data() as Omit<Property, "id">),
            ratingAvg,
            ratingCount,
            latestReviewAt: latestReviewAtByProperty.get(d.id),
            ratingsSummary: aggregate
                ? {
                    overall: averageValue(aggregate.overall),
                    location: averageValue(aggregate.location),
                    noise: averageValue(aggregate.noise),
                    landlord: averageValue(aggregate.landlord),
                    condition: averageValue(aggregate.condition),
                }
                : undefined,
        };
    });
}

export async function fetchPropertyById(propertyId: string): Promise<Property | null> {
    const docRef = doc(db, "properties", propertyId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
        return null;
    }
    
    return {
        id: docSnap.id,
        ...(docSnap.data() as Omit<Property, "id">),
    };
}
