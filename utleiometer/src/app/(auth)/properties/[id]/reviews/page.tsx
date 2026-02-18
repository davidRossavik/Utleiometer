"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { Badge } from "@/ui/feedback/badge";
import { Button } from "@/ui/primitives/button";
import { Input } from "@/ui/primitives/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/feedback/card";

import { AuthButtons } from "@/features/auth/client-components/authButtons";
import { WelcomeMessage } from "@/features/auth/client-components/welcomeMessage";

import { db } from "@/lib/firebase/client";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";

type Property = {
  id: string;
  address?: string;
  city?: string;
  country?: string;
};

type Review = {
  id: string;
  propertyId: string;
  title?: string;
  comment?: string;
  rating?: number; // 1-5
  userDisplayName?: string;
  createdAt?: any; // Firestore Timestamp
};

function formatDate(ts: any) {
  if (!ts?.toDate) return "";
  const d = ts.toDate() as Date;
  return d.toLocaleDateString("no-NO", { year: "numeric", month: "short", day: "numeric" });
}

export default function PropertyReviewsPage() {
  const params = useParams<{ id: string }>();
  const propertyId = params?.id;

  const [property, setProperty] = useState<Property | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewSearch, setReviewSearch] = useState("");

  useEffect(() => {
    if (!propertyId) return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);

        // 1) Property
        const propRef = doc(db, "properties", propertyId);
        const propSnap = await getDoc(propRef);

        if (!cancelled) {
          setProperty(
            propSnap.exists()
              ? ({ id: propSnap.id, ...(propSnap.data() as Omit<Property, "id">) } as Property)
              : null
          );
        }

        // 2) Reviews for property
        const rQ = query(
          collection(db, "reviews"),
          where("propertyId", "==", propertyId),
          orderBy("createdAt", "desc")
        );

        const rSnap = await getDocs(rQ);
        const rData: Review[] = rSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Review, "id">),
        }));

        if (!cancelled) setReviews(rData);
      } catch (e) {
        console.error("Failed to load reviews:", e);
        if (!cancelled) {
          setProperty(null);
          setReviews([]);
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

  const filteredReviews = useMemo(() => {
    const q = reviewSearch.trim().toLowerCase();
    if (!q) return reviews;

    return reviews.filter((r) => {
      const hay = `${r.title ?? ""} ${r.comment ?? ""} ${r.userDisplayName ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [reviews, reviewSearch]);

  const subtitle =
    property
      ? [property.address, property.city, property.country].filter(Boolean).join(", ")
      : "Ukjent bolig";

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
              </div>

              <div className="flex gap-2">
                <Button asChild variant="secondary">
                  <Link href="/properties">Til boliger</Link>
                </Button>
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
            ) : filteredReviews.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-blue-700">Ingen anmeldelser</CardTitle>
                  <CardDescription>
                    Det ser ikke ut som det finnes anmeldelser her enda.
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
                {filteredReviews.map((r) => (
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
