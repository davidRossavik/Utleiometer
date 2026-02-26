"use client";

import { Review } from "@/features/reviews/types";
import { Property } from "@/features/properties/types";
import { useMemo, useState } from "react";
import { useReviews } from "../hooks/useReviews";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { WelcomeMessage } from "@/features/auth/client-components/welcomeMessage";
import { AuthButtons } from "@/features/auth/client-components/authButtons";
import { Badge } from "@/ui/feedback/badge";
import Link from "next/link";
import { Button } from "@/ui/primitives/button";
import { Input } from "@/ui/primitives/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/feedback/card";

type SortKey = "newest" | "oldest" | "rating_desc" | "rating_asc"

function formatDate(ts: any) {
    if (!ts?.toDate) return "";
    const d = ts.toDate() as Date;
    return d.toLocaleDateString("no-NO", { year: "numeric", month: "short", day: "numeric"});
}

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

function buildSubtitle(property: Property | null) {
    return property 
        ? [property.address, property.city, property.country].filter(Boolean).join(", ") 
        : "Ukjent bolig";
}


export default function ReviewsClient({ propertyId, property }: { propertyId: string, property: Property | null}) {
    const { reviews, loading, error } = useReviews({ propertyId });
    const { currentUser } = useAuth();

    const [reviewSearch, setReviewSearch] = useState("");
    const [sort, setSort] = useState<SortKey>("newest");

    const visible = useMemo(() => {
        const filtered = filterReviews(reviews ?? [], reviewSearch);
        return sortReviews(filtered, sort);
    }, [reviews, reviewSearch, sort]);

    const subtitle = useMemo(() => buildSubtitle(property), [property]);

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* NAV */}
            <header className="border-b">
                <div className="container mx-auto flex items-center justify-between px-4 py-4">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-muted" />
                    <span className="font-semibold">Utleiometer</span>
                    <WelcomeMessage />
                </div>
                <AuthButtons />
                </div>
            </header>

            <main>
                {/* HEADER */}
                <section className="container mx-auto px-4 py-12">
                <div className="mx-auto max-w-5xl">
                    <Badge className="mb-4">Anmeldelser</Badge>

                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-blue-700">
                        Se anmeldelser
                        </h1>
                        <p className="mt-2 text-muted-foreground">{subtitle}</p>
                        {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
                    </div>

                    <div className="flex gap-2">
                        <Button asChild variant="secondary">
                        <Link href="/properties">Til boliger</Link>
                        </Button>

                        {currentUser && (
                        <Button asChild>
                            <Link
                            href={`/properties/${propertyId}/reviews/new?propertyId=${propertyId}&address=${encodeURIComponent(
                                subtitle
                            )}`}
                            >
                            Legg til ny anmeldelse
                            </Link>
                        </Button>
                        )}
                    </div>
                    </div>

                    {/* SEARCH IN REVIEWS */}
                    <div className="mt-8">
                    <Input
                        id="review-search"
                        placeholder="Søk i anmeldelser…"
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
                            <CardTitle className="text-xl text-blue-700">Laster…</CardTitle>
                            <CardDescription>Henter anmeldelser fra databasen.</CardDescription>
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
                        <CardTitle className="text-xl text-blue-700">Ingen anmeldelser</CardTitle>
                        <CardDescription>
                            {reviewSearch.trim()
                            ? "Ingen treff på søket ditt."
                            : "Det ser ikke ut som det finnes anmeldelser her enda."}
                        </CardDescription>
                        </CardHeader>
                        <CardContent>
                        <Button variant="secondary" onClick={() => setReviewSearch("")}>
                            Tøm søk
                        </Button>
                        </CardContent>
                    </Card>
                    ) : (
                    <div className="flex flex-col gap-6">
                        {visible.map((r) => (
                        <Card key={r.id} className="transition-shadow hover:shadow-md">
                            <CardHeader>
                            <CardTitle className="text-xl text-blue-700">
                                {r.title?.trim() ? r.title : "Anmeldelse"}
                            </CardTitle>
                            <CardDescription>
                                <span className="mr-2">
                                {typeof r.rating === "number" ? `${r.rating}/5` : "Ingen rating"}
                                </span>
                                {r.userDisplayName ? `• ${r.userDisplayName}` : null}
                                {r.createdAt ? ` • ${formatDate(r.createdAt)}` : null}
                            </CardDescription>
                            </CardHeader>

                            <CardContent>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">
                                {r.comment?.trim() ? r.comment : "Ingen tekst."}
                            </p>
                            </CardContent>
                        </Card>
                        ))}
                    </div>
                    )}
                </div>
                </section>
            </main>

            {/* FOOTER */}
            <footer className="border-t">
                <div className="container mx-auto px-4 py-10 text-sm text-muted-foreground">
                © {new Date().getFullYear()} Utleiometer. Laget av Lillian, Katharina, Robert, David og Marius / PU-gruppe 4.
                </div>
            </footer>
            </div>
        );
}
