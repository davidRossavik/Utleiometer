"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Badge } from "@/ui/feedback/badge";
import { Button } from "@/ui/primitives/button";
import { Input } from "@/ui/primitives/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/feedback/card";

import { AuthButtons } from "@/features/auth/client-components/authButtons";
import { WelcomeMessage } from "@/features/auth/client-components/welcomeMessage";

// Firebase (juster import-stien til deres db)
import { db } from "@/lib/firebase/client";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

type Property = {
  id: string;
  address?: string;
  city?: string;
  country?: string;
  ownerName?: string;
  ratingAvg?: number;
  ratingCount?: number;
};

export default function PropertiesPage() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const q = query(collection(db, "properties"), orderBy("address", "asc"));
        const snap = await getDocs(q);

        const data: Property[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Property, "id">),
        }));

        if (!cancelled) setProperties(data);
      } catch (e) {
        console.error("Failed to load properties:", e);
        if (!cancelled) setProperties([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setSearch(initialQ);
  }, [initialQ]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return properties;

    return properties.filter((p) => {
      const hay = `${p.address ?? ""} ${p.city ?? ""} ${p.country ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [properties, search]);

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
            <Badge className="mb-4">Boliger</Badge>

            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-blue-700">
                  Utforsk boliger
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Finn en bolig og se anmeldelser fra andre studenter.
                </p>
              </div>

              <div className="flex gap-2">
                <Button asChild variant="secondary">
                  <Link href="/">Til forsiden</Link>
                </Button>
              </div>
            </div>

            {/* SEARCH */}
            <div className="mt-8">
              <Input
                id="property-search"
                placeholder="Søk på adresse, by eller land…"
                className="h-12 w-full text-base"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
                    <CardDescription>Henter boliger fra databasen.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 w-2/3 rounded bg-muted" />
                    <div className="mt-3 h-4 w-1/2 rounded bg-muted" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-700">Laster…</CardTitle>
                    <CardDescription>Dette tar vanligvis bare et øyeblikk.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 w-3/5 rounded bg-muted" />
                    <div className="mt-3 h-4 w-2/5 rounded bg-muted" />
                  </CardContent>
                </Card>
              </div>
            ) : filtered.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-blue-700">Ingen treff</CardTitle>
                  <CardDescription>
                    Prøv et annet søk, eller fjern filteret.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="secondary" onClick={() => setSearch("")}>
                    Tøm søk
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col gap-6">
                {filtered.map((p) => (
                  <Card key={p.id} className="transition-shadow hover:shadow-md">
                    <CardHeader>
                      <CardTitle className="text-xl text-blue-700">
                        {p.address ?? "Ukjent adresse"}
                      </CardTitle>
                      <CardDescription>
                        {[p.city, p.country].filter(Boolean).join(", ") || "Ukjent sted"}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="flex items-center justify-end gap-4">
                      <div>
                        <Button asChild>
                            <Link href={`/properties/${p.id}/reviews`}>
                            Se anmeldelser
                            </Link>
                        </Button>
                      </div>

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
