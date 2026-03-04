"use client";

import { Review } from "@/features/reviews/types";
import { Property } from "@/features/properties/types";
import { useEffect, useMemo, useState } from "react";
import { useReviews } from "../hooks/useReviews";
import { fetchPropertyById } from "@/features/properties/data/fetchProperties";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Badge } from "@/ui/feedback/badge";
import Link from "next/link";
import { Button } from "@/ui/primitives/button";
import { Input } from "@/ui/primitives/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/feedback/card";
import { ReviewCard } from "../componentes/ReviewCard";

type SortKey = "newest" | "oldest" | "rating_desc" | "rating_asc"

export type ReviewsClientTexts = {
    badge: string;
    title: string;
    toProperties: string;
    addReview: string;
    searchPlaceholder: string;
    loadingTitle: string;
    loadingDescription: string;
    emptyTitle: string;
    emptyNoMatch: string;
    emptyNoReviews: string;
    clearSearch: string;
    unknownProperty: string;
};

export type ReviewsClientMessages = {
    loadReviewsError: string;
};

type ReviewsClientProps = {
    propertyId: string;
    property: Property | null;
    texts: ReviewsClientTexts;
    messages: ReviewsClientMessages;
};

function filterReviews(reviews: Review[], reviewSearch: string) {
    const q = reviewSearch.trim().toLowerCase();
    if (!q) return reviews;

    return reviews.filter((r) => {
        const hay = `${r.title ?? ""} ${r.comment ?? ""} ${r.userDisplayName ?? ""}`.toLowerCase();
        return hay.includes(q);
    });
}

function sortReviews(reviews: Review[], sort: SortKey) {
    const copy = [...reviews];

    const getDateMs = (r: Review) => (r.createdAt?.toDate ? r.createdAt.toDate().getTime() : 0);

    switch (sort) {
        case "newest":
            return copy.sort((a, b) => getDateMs(b) - getDateMs(a));
        case "oldest":
            return copy.sort((a, b) => getDateMs(a) - getDateMs(b));
        default:
            return copy;
    }
}

function capitalizeFirstLetter(str: string | undefined): string {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function buildSubtitle(property: Property | null, unknownProperty: string) {
    if (!property) return unknownProperty;
    
    const address = capitalizeFirstLetter(property.address);
    return [address, property.city, property.country].filter(Boolean).join(", ");
}

function handleSaveReview(updated: Review) {
    // Placeholder – Firestore-logikk implementeres i egen issue
    console.log("Save review:", updated);
}

function handleDeleteReview(reviewId: string) {
    // Placeholder – Firestore-logikk implementeres i egen issue
    console.log("Delete review:", reviewId);
}

export default function ReviewsClient({ propertyId, property, texts, messages }: ReviewsClientProps) {
    const { reviews, loading, error } = useReviews({ propertyId, messages });
    const { currentUser } = useAuth();
    const [fetchedProperty, setFetchedProperty] = useState<Property | null>(property);
    
    useEffect(() => {
        if (!property && propertyId) {
            fetchPropertyById(propertyId).then(setFetchedProperty);
        }
    }, [propertyId, property]);

    const [reviewSearch, setReviewSearch] = useState("");
    const [sort, setSort] = useState<SortKey>("newest");

    const visible = useMemo(() => {
        const filtered = filterReviews(reviews ?? [], reviewSearch);
        return sortReviews(filtered, sort);
    }, [reviews, reviewSearch, sort]);

    const subtitle = useMemo(
        () => buildSubtitle(fetchedProperty, texts.unknownProperty),
        [fetchedProperty, texts.unknownProperty],
    );

    return (
            <main>
                {/* HEADER */}
                <section className="container mx-auto px-4 py-12">
                <div className="mx-auto max-w-5xl">
                    <Badge className="mb-4">{texts.badge}</Badge>

                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-blue-700">
                        {texts.title}
                        </h1>
                        <p className="mt-2 text-muted-foreground">{subtitle}</p>
                        {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
                    </div>

                    <div className="flex gap-2">
                        <Button asChild variant="secondary">
                        <Link href="/properties">{texts.toProperties}</Link>
                        </Button>

                        {currentUser && (
                        <Button asChild>
                            <Link
                            href={`/properties/${propertyId}/reviews/new?address=${encodeURIComponent(
                                subtitle
                            )}`}
                            >
                            {texts.addReview}
                            </Link>
                        </Button>
                        )}
                    </div>
                    </div>

                    {/* SEARCH IN REVIEWS */}
                    <div className="mt-8">
                    <Input
                        id="review-search"
                        placeholder={texts.searchPlaceholder}
                        className="h-12 w-full text-base"
                        value={reviewSearch}
                        onChange={(e) => setReviewSearch(e.target.value)}
                    />
                    </div>
                </div>
                </section>

                {/* LIST */}
                <section className="container mx-auto px-4 pb-16">
                <div className="mx-auto max-w-5xl">
                    {loading ? (
                    <div className="flex flex-col gap-6">
                        <Card>
                        <CardHeader>
                            <CardTitle className="text-xl text-blue-700">{texts.loadingTitle}</CardTitle>
                            <CardDescription>{texts.loadingDescription}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-4 w-2/3 rounded bg-muted" />
                            <div className="mt-3 h-4 w-1/2 rounded bg-muted" />
                        </CardContent>
                        </Card>
                    </div>
                    ) : visible.length === 0 ? (
                    <Card>
                        <CardHeader>
                        <CardTitle className="text-xl text-blue-700">{texts.emptyTitle}</CardTitle>
                        <CardDescription>
                            {reviewSearch.trim()
                            ? texts.emptyNoMatch
                            : texts.emptyNoReviews}
                        </CardDescription>
                        </CardHeader>
                        <CardContent>
                        <Button variant="secondary" onClick={() => setReviewSearch("")}>
                            {texts.clearSearch}
                        </Button>
                        </CardContent>
                    </Card>
                    ) : (
                    <div className="flex flex-col gap-6">
                        {visible.map((r) => (
                        <ReviewCard
                            key={r.id}
                            review={r}
                            currentUserId={currentUser?.uid}
                            onSave={handleSaveReview}
                            onDelete={handleDeleteReview}
                        />
                        ))}
                    </div>
                    )}
                </div>
                </section>
            </main>
        );
}
