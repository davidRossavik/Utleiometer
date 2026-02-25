"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Badge } from "@/ui/feedback/badge";
import { Button } from "@/ui/primitives/button";
import { Input } from "@/ui/primitives/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/feedback/card";

import { AuthButtons } from "@/features/auth/client-components/authButtons";
import { WelcomeMessage } from "@/features/auth/client-components/welcomeMessage";

import { useProperties } from "../hooks/useProperties";
import { usePropertySearch } from "../hooks/usePropertySearch";
import { Property } from "../types";

function PropertiesSearch({ value, onChange }: { value: string; onChange: (next: string) => void}) {
    return (
        <div className="mt-8">
            <Input
                id="propery-search"
                placeholder = "Søk på adresse, by eller land..."
                className="h-12 w-full text-base"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

function PropertiesLoading() {
    return (
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
    );
}

function PropertiesEmpty({ onClear }: { onClear: () => void}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl text-blue-700">Ingen treff</CardTitle>
                <CardDescription>Prøv et annet søk, eller fjern filteret.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button variant="secondary" onClick={onClear}>
                Tøm søk
                </Button>
            </CardContent>
        </Card>
    );
}

function PropertyCard({ p }: { p: Property }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-xl text-blue-700">
          {p.address ?? "Ukjent adresse"}
        </CardTitle>
        <CardDescription>
          {[p.city, p.country].filter(Boolean).join(", ") || "Ukjent sted"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-end">
        <Button asChild>
          <Link href={`/properties/${p.id}/reviews`}>Se anmeldelser</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// PropertiesClient

export default function PropertiesClient() {
    const searchParams = useSearchParams();
    const initialQ = searchParams.get("q") ?? "";

    const { properties, loading, error } = useProperties();
    
    const [search, setSearch] = useState(initialQ);
    useEffect(() => setSearch(initialQ), [initialQ]);

    const filtered = usePropertySearch(properties, search);

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

              <Button asChild variant="secondary">
                <Link href="/">Til forsiden</Link>
              </Button>
            </div>

            <PropertiesSearch value={search} onChange={setSearch} />

            {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
          </div>
        </section>

        {/* LIST */}
        <section className="container mx-auto px-4 pb-16">
          <div className="mx-auto max-w-5xl">
            {loading ? (
              <PropertiesLoading />
            ) : filtered.length === 0 ? (
              <PropertiesEmpty onClear={() => setSearch("")} />
            ) : (
              <div className="flex flex-col gap-6">
                {filtered.map((p) => (
                  <PropertyCard key={p.id} p={p} />
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