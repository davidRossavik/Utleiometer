"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Badge } from "@/ui/feedback/badge";
import { Button } from "@/ui/primitives/button";
import { Input } from "@/ui/primitives/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/feedback/card";

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

function capitalizeFirstLetter(str: string | undefined): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function PropertyCard({ p }: { p: Property }) {
  const displayAddress = capitalizeFirstLetter(p.address) || "Ukjent adresse";
  
  return (
    <Link href={`/properties/${p.id}/reviews`} className="block">
      <Card className="cursor-pointer transition-all hover:shadow-lg hover:shadow-blue-100/50">
        <CardHeader>
          <CardTitle className="text-xl text-blue-700">
            {displayAddress}
          </CardTitle>
          <CardDescription>
            {[p.city, p.country].filter(Boolean).join(", ") || "Ukjent sted"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-end">
          <span className="text-sm font-medium text-blue-700">
            Se anmeldelser →
          </span>
        </CardContent>
      </Card>
    </Link>
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
  );
}