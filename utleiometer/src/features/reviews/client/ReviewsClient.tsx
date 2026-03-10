"use client";

import { Review } from "@/features/reviews/types";
import { Property } from "@/features/properties/types";
import { useEffect, useMemo, useState } from "react";
import { useReviews } from "../hooks/useReviews";
import { fetchPropertyById } from "@/features/properties/data/fetchProperties";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Badge } from "@/ui/feedback/badge";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/ui/primitives/button";
import { Input } from "@/ui/primitives/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/feedback/card";
import { ReviewCard } from "../componentes/ReviewCard";
import { StarRatingDisplay } from "../componentes/StarRatingDisplay";
import { updateReviewAction, deleteReviewAction } from "@/app/[locale]/actions/reviews";
import PropertyMap from "@/ui/map/propertyMap";

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
    averageTitle: string;
    overallLabel: string;
    locationLabel: string;
    noiseLabel: string;
    landlordLabel: string;
    conditionLabel: string;
    notRated: string;
    reviewDefaultTitle: string;
    reviewEditTitle: string;
    reviewEmptyComment: string;
    reviewConfirmDelete: string;
    reviewDeleteYes: string;
    reviewDeleteNo: string;
    reviewEdit: string;
    reviewDelete: string;
    propertyDetailsTitle: string;
    propertyTypeLabel: string;
    areaSqmLabel: string;
    bedroomsLabel: string;
    bathroomsLabel: string;
    floorsLabel: string;
    buildYearLabel: string;
    roomAreaSqmLabel: string;
    hasPrivateBathroomLabel: string;
    otherBedsitsInUnitLabel: string;
    yes: string;
    no: string;
    notProvided: string;
    propertyTypeHouse: string;
    propertyTypeApartment: string;
    propertyTypeBedsit: string;
    reviewSubmittedSuccess: string;
    propertySubmittedSuccess: string;
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

type DetailRow = {
    label: string;
    value: string;
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

function capitalizeWords(str: string | undefined): string {
    if (!str) return "";
    return str
        .split(" ")
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function buildSubtitle(property: Property | null, unknownProperty: string) {
    if (!property) return unknownProperty;
    
    const address = capitalizeFirstLetter(property.address);
    const city = capitalizeWords(property.city);
    const country = capitalizeWords(property.country);
    return [address, city, country].filter(Boolean).join(", ");
}

function buildHeading(property: Property | null, unknownProperty: string) {
    if (!property) return unknownProperty;

    const address = capitalizeFirstLetter(property.address);
    const city = capitalizeWords(property.city);
    return [address, city].filter(Boolean).join(", ") || unknownProperty;
}

function getPropertyTypeLabel(type: Property["propertyType"], texts: ReviewsClientTexts) {
    if (type === "house") return texts.propertyTypeHouse;
    if (type === "apartment") return texts.propertyTypeApartment;
    if (type === "bedsit") return texts.propertyTypeBedsit;
    return texts.notProvided;
}

function formatValue(value: string | number | undefined, notProvided: string) {
    if (value === undefined || value === null || value === "") {
        return notProvided;
    }
    return String(value);
}

function buildDetailRows(property: Property | null, texts: ReviewsClientTexts): DetailRow[] {
    const rows: DetailRow[] = [
        {
            label: texts.propertyTypeLabel,
            value: getPropertyTypeLabel(property?.propertyType, texts),
        },
    ];

    if (property?.propertyType === "house" || property?.propertyType === "apartment") {
        rows.push(
            { label: texts.areaSqmLabel, value: formatValue(property.areaSqm, texts.notProvided) },
            { label: texts.buildYearLabel, value: formatValue(property.buildYear, texts.notProvided) },
            { label: texts.floorsLabel, value: formatValue(property.floors, texts.notProvided) },
            { label: texts.bedroomsLabel, value: formatValue(property.bedrooms, texts.notProvided) },
            { label: texts.bathroomsLabel, value: formatValue(property.bathrooms, texts.notProvided) },
        );
    }

    if (property?.propertyType === "bedsit") {
        rows.push(
            { label: texts.roomAreaSqmLabel, value: formatValue(property.roomAreaSqm, texts.notProvided) },
            {
                label: texts.hasPrivateBathroomLabel,
                value:
                    property.hasPrivateBathroom === undefined
                        ? texts.notProvided
                        : property.hasPrivateBathroom
                          ? texts.yes
                          : texts.no,
            },
            {
                label: texts.otherBedsitsInUnitLabel,
                value: formatValue(property.otherBedsitsInUnit, texts.notProvided),
            },
        );
    }

    return rows;
}

type RatingSummary = {
    overall?: number;
    location?: number;
    noise?: number;
    landlord?: number;
    condition?: number;
};

function average(values: number[]) {
    if (!values.length) return undefined;
    return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1));
}

function computeRatingSummary(reviews: Review[]): RatingSummary {
    const overall: number[] = [];
    const location: number[] = [];
    const noise: number[] = [];
    const landlord: number[] = [];
    const condition: number[] = [];

    for (const review of reviews) {
        if (typeof review.ratings?.overall === "number") overall.push(review.ratings.overall);
        else if (typeof review.rating === "number") overall.push(review.rating); // legacy fallback for overall only

        if (typeof review.ratings?.location === "number") location.push(review.ratings.location);
        if (typeof review.ratings?.noise === "number") noise.push(review.ratings.noise);
        if (typeof review.ratings?.landlord === "number") landlord.push(review.ratings.landlord);
        if (typeof review.ratings?.condition === "number") condition.push(review.ratings.condition);
    }

    return {
        overall: average(overall),
        location: average(location),
        noise: average(noise),
        landlord: average(landlord),
        condition: average(condition),
    };
}

export default function ReviewsClient({ propertyId, property, texts, messages }: ReviewsClientProps) {
    const searchParams = useSearchParams();
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

    async function handleSaveReview(updated: Review) {
        try {
            const formData = new FormData();
            formData.append("ratingLocation", String(updated.ratings?.location ?? updated.rating ?? 3));
            formData.append("ratingNoise", String(updated.ratings?.noise ?? updated.rating ?? 3));
            formData.append("ratingLandlord", String(updated.ratings?.landlord ?? updated.rating ?? 3));
            formData.append("ratingCondition", String(updated.ratings?.condition ?? updated.rating ?? 3));
            formData.append("comment", updated.comment ?? "");
            if (updated.title) formData.append("title", updated.title);

            const result = await updateReviewAction(updated.id, formData);
            
            if (result.error) {
                alert(`Feil: ${result.error}`);
                return;
            }

            alert("Anmeldelse oppdatert!");
            window.location.reload();
        } catch (error) {
            console.error("Update failed:", error);
            alert("Kunne ikke oppdatere anmeldelse");
        }
    }

    async function handleDeleteReview(reviewId: string) {
        try {
            const result = await deleteReviewAction(reviewId, propertyId);
            
            if (result.error) {
                alert(`Feil: ${result.error}`);
                return;
            }

            alert("Anmeldelse slettet!");
            window.location.reload();
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Kunne ikke slette anmeldelse");
        }
    }

    const visible = useMemo(() => {
        const filtered = filterReviews(reviews ?? [], reviewSearch);
        return sortReviews(filtered, sort);
    }, [reviews, reviewSearch, sort]);

    const subtitle = useMemo(
        () => buildSubtitle(fetchedProperty, texts.unknownProperty),
        [fetchedProperty, texts.unknownProperty],
    );
    const heading = useMemo(
        () => buildHeading(fetchedProperty, texts.unknownProperty),
        [fetchedProperty, texts.unknownProperty],
    );
    const ratingSummary = useMemo(() => computeRatingSummary(reviews ?? []), [reviews]);
    const detailRows = useMemo(
        () => buildDetailRows(fetchedProperty, texts),
        [fetchedProperty, texts],
    );

    const hasCoordinates =
        typeof fetchedProperty?.latitude === "number" &&
        typeof fetchedProperty?.longitude === "number";

    const submitted = searchParams.get("submitted");
    const successMessage =
        submitted === "review"
            ? texts.reviewSubmittedSuccess
            : submitted === "property"
              ? texts.propertySubmittedSuccess
              : null;

    return (
            <main>
                {/* HEADER */}
                <section className="container mx-auto px-4 py-12">
                <div className="mx-auto max-w-5xl">
                    <Badge className="mb-4">{texts.badge}</Badge>

                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-blue-700">
                        {heading}
                        </h1>
                        {successMessage ? (
                            <div className="mt-3 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                                {successMessage}
                            </div>
                        ) : null}
                        {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}

                        <div className="mt-5 overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-br from-background to-blue-50/40 shadow-sm">
                            <div className="border-b border-blue-100 px-4 py-3">
                                <p className="text-sm font-semibold text-blue-800">{texts.propertyDetailsTitle}</p>
                            </div>
                            <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-3">
                                {detailRows.map((row) => (
                                    <div key={row.label} className="rounded-lg border bg-background/90 px-3 py-2">
                                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                            {row.label}
                                        </p>
                                        <p className="mt-1 text-sm font-medium text-foreground">{row.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-blue-100 p-3">
                                {hasCoordinates ? (
                                    <PropertyMap
                                        lat={fetchedProperty!.latitude!}
                                        lng={fetchedProperty!.longitude!}
                                        title={heading}
                                    />
                                ) : (
                                    <p className="rounded-lg border bg-background/90 px-3 py-2 text-sm text-muted-foreground">
                                        Kart er ikke tilgjengelig for denne boligen ennå.
                                    </p>
                                )}
                            </div>
                        </div>
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

                    <div className="mt-4 border-b pb-4 overflow-x-auto">
                        <div className="flex min-w-max items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm font-medium whitespace-nowrap">{texts.overallLabel}</span>
                                <StarRatingDisplay
                                    value={ratingSummary.overall}
                                    fallbackLabel={texts.notRated}
                                    className="whitespace-nowrap"
                                    showDecimalLabel
                                />
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm font-medium whitespace-nowrap">{texts.locationLabel}</span>
                                <StarRatingDisplay
                                    value={ratingSummary.location}
                                    fallbackLabel={texts.notRated}
                                    className="whitespace-nowrap"
                                    showDecimalLabel
                                />
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm font-medium whitespace-nowrap">{texts.noiseLabel}</span>
                                <StarRatingDisplay
                                    value={ratingSummary.noise}
                                    fallbackLabel={texts.notRated}
                                    className="whitespace-nowrap"
                                    showDecimalLabel
                                />
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm font-medium whitespace-nowrap">{texts.landlordLabel}</span>
                                <StarRatingDisplay
                                    value={ratingSummary.landlord}
                                    fallbackLabel={texts.notRated}
                                    className="whitespace-nowrap"
                                    showDecimalLabel
                                />
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm font-medium whitespace-nowrap">{texts.conditionLabel}</span>
                                <StarRatingDisplay
                                    value={ratingSummary.condition}
                                    fallbackLabel={texts.notRated}
                                    className="whitespace-nowrap"
                                    showDecimalLabel
                                />
                            </div>
                        </div>
                    </div>

                    {/* SEARCH IN REVIEWS */}
                    <div className="mt-6">
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
                            texts={{
                                editTitle: texts.reviewEditTitle,
                                defaultTitle: texts.reviewDefaultTitle,
                                notRated: texts.notRated,
                                overall: texts.overallLabel,
                                location: texts.locationLabel,
                                noise: texts.noiseLabel,
                                landlord: texts.landlordLabel,
                                condition: texts.conditionLabel,
                                emptyComment: texts.reviewEmptyComment,
                                confirmDelete: texts.reviewConfirmDelete,
                                deleteYes: texts.reviewDeleteYes,
                                deleteNo: texts.reviewDeleteNo,
                                edit: texts.reviewEdit,
                                delete: texts.reviewDelete,
                            }}
                        />
                        ))}
                    </div>
                    )}
                </div>
                </section>
            </main>
        );
}
