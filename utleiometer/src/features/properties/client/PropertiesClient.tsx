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

export type PropertiesClientTexts = {
  badge: string;
  title: string;
  subtitle: string;
  homeButton: string;
  searchPlaceholder: string;
  loadingTitle: string;
  loadingDescription1: string;
  loadingDescription2: string;
  emptyTitle: string;
  emptyDescription: string;
  clearSearch: string;
  unknownAddress: string;
  unknownPlace: string;
  seeReviews: string;
};

export type PropertiesClientMessages = {
  loadPropertiesError: string;
};

type PropertiesClientProps = {
  texts: PropertiesClientTexts;
  messages: PropertiesClientMessages;
};

function PropertiesSearch({ value, onChange, placeholder }: { value: string; onChange: (next: string) => void; placeholder: string}) {
    return (
        <div className="mt-8">
            <Input
                id="propery-search"
        placeholder={placeholder}
                className="h-12 w-full text-base"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

function PropertiesLoading({ title, description1, description2 }: { title: string; description1: string; description2: string }) {
    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
        <CardTitle className="text-xl text-blue-700">{title}</CardTitle>
        <CardDescription>{description1}</CardDescription>
                </CardHeader>
                <CardContent>
                <div className="h-4 w-2/3 rounded bg-muted" />
                <div className="mt-3 h-4 w-1/2 rounded bg-muted" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
              <CardTitle className="text-xl text-blue-700">{title}</CardTitle>
              <CardDescription>{description2}</CardDescription>
                </CardHeader>
                <CardContent>
                <div className="h-4 w-3/5 rounded bg-muted" />
                <div className="mt-3 h-4 w-2/5 rounded bg-muted" />
                </CardContent>
            </Card>
            </div>
    );
}

      function PropertiesEmpty({ onClear, title, description, clearText }: { onClear: () => void; title: string; description: string; clearText: string }) {
    return (
        <Card>
            <CardHeader>
              <CardTitle className="text-xl text-blue-700">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <Button variant="secondary" onClick={onClear}>
              {clearText}
                </Button>
            </CardContent>
        </Card>
    );
}

function capitalizeFirstLetter(str: string | undefined): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function PropertyCard({ p, unknownAddress, unknownPlace, seeReviews }: { p: Property; unknownAddress: string; unknownPlace: string; seeReviews: string }) {
  const displayAddress = capitalizeFirstLetter(p.address) || unknownAddress;
  
  return (
    <Link href={`/properties/${p.id}/reviews`} className="block">
      <Card className="cursor-pointer transition-all hover:shadow-lg hover:shadow-blue-100/50">
        <CardHeader>
          <CardTitle className="text-xl text-blue-700">
            {displayAddress}
          </CardTitle>
          <CardDescription>
            {[p.city, p.country].filter(Boolean).join(", ") || unknownPlace}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-end">
          <span className="text-sm font-medium text-blue-700">
            {seeReviews} →
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}

// PropertiesClient

export default function PropertiesClient({ texts, messages }: PropertiesClientProps) {
    const searchParams = useSearchParams();
    const initialQ = searchParams.get("q") ?? "";

  const { properties, loading, error } = useProperties(messages);
    
    const [search, setSearch] = useState(initialQ);
    useEffect(() => setSearch(initialQ), [initialQ]);

    const filtered = usePropertySearch(properties, search);

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
                <p className="mt-2 text-muted-foreground">
                  {texts.subtitle}
                </p>
              </div>

              <Button asChild variant="secondary">
                <Link href="/">{texts.homeButton}</Link>
              </Button>
            </div>

            <PropertiesSearch value={search} onChange={setSearch} placeholder={texts.searchPlaceholder} />

            {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
          </div>
        </section>

        {/* LIST */}
        <section className="container mx-auto px-4 pb-16">
          <div className="mx-auto max-w-5xl">
            {loading ? (
              <PropertiesLoading
                title={texts.loadingTitle}
                description1={texts.loadingDescription1}
                description2={texts.loadingDescription2}
              />
            ) : filtered.length === 0 ? (
              <PropertiesEmpty
                onClear={() => setSearch("")}
                title={texts.emptyTitle}
                description={texts.emptyDescription}
                clearText={texts.clearSearch}
              />
            ) : (
              <div className="flex flex-col gap-6">
                {filtered.map((p) => (
                  <PropertyCard
                    key={p.id}
                    p={p}
                    unknownAddress={texts.unknownAddress}
                    unknownPlace={texts.unknownPlace}
                    seeReviews={texts.seeReviews}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
  );
}