"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Badge } from "@/ui/feedback/badge";
import { Button } from "@/ui/primitives/button";
import { Input } from "@/ui/primitives/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/feedback/card";
import { StarRatingDisplay } from "@/features/reviews/componentes/StarRatingDisplay";

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
  clearFilters: string;
  areaFilterPlaceholder: string;
  minRatingPlaceholder: string;
  minRatingValue: string;
  minRatingAriaLabel: string;
  emptyFilteredDescription: string;
  unknownAddress: string;
  unknownPlace: string;
  seeReviews: string;
  totalLabel: string;
  locationLabel: string;
  noiseLabel: string;
  landlordLabel: string;
  conditionLabel: string;
  notRated: string;
  reviewCountLabel: string;
  propertyTypeLabel: string;
  areaSqmLabel: string;
  buildYearLabel: string;
  notProvided: string;
  propertyTypeHouse: string;
  propertyTypeApartment: string;
  propertyTypeBedsit: string;
};

export type PropertiesClientMessages = {
  loadPropertiesError: string;
};

type PropertiesClientProps = {
  texts: PropertiesClientTexts;
  messages: PropertiesClientMessages;
};

function PropertiesSearch({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
}) {
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

function PropertyFilters({
  area,
  onAreaChange,
  areas,
  areaPlaceholder,
  minRating,
  onMinRatingChange,
  minRatingPlaceholder,
  minRatingTemplate,
  minRatingAriaLabel,
}: {
  area: string;
  onAreaChange: (next: string) => void;
  areas: Array<{ value: string; label: string }>;
  areaPlaceholder: string;
  minRating: number | null;
  onMinRatingChange: (next: number | null) => void;
  minRatingPlaceholder: string;
  minRatingTemplate: string;
  minRatingAriaLabel: string;
}) {
  const ratingOptions = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

  return (
    <div className="mt-3 flex flex-wrap justify-end gap-3">
      <select
        value={area}
        onChange={(e) => onAreaChange(e.target.value)}
        className="h-10 min-w-44 appearance-none rounded-full border border-input bg-white/90 px-4 text-sm text-slate-700 shadow-sm transition-all outline-none [background-image:none] hover:shadow focus-visible:ring-2 focus-visible:ring-ring/30"
        aria-label={areaPlaceholder}
      >
        <option value="">{areaPlaceholder}</option>
        {areas.map((city) => (
          <option key={city.value} value={city.value}>
            {city.label}
          </option>
        ))}
      </select>

      <select
        value={minRating === null ? "" : String(minRating)}
        onChange={(e) => onMinRatingChange(e.target.value ? Number(e.target.value) : null)}
        className="h-10 min-w-44 appearance-none rounded-full border border-input bg-white/90 px-4 text-sm text-slate-700 shadow-sm transition-all outline-none [background-image:none] hover:shadow focus-visible:ring-2 focus-visible:ring-ring/30"
        aria-label={minRatingAriaLabel}
      >
        <option value="">{minRatingPlaceholder}</option>
        {ratingOptions.map((rating) => (
          <option key={rating} value={String(rating)}>
            {formatRatingValue(minRatingTemplate, rating)}
          </option>
        ))}
      </select>
    </div>
  );
}

function PropertiesLoading({
  title,
  description1,
  description2,
}: {
  title: string;
  description1: string;
  description2: string;
}) {
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

function PropertiesEmpty({
  onClear,
  title,
  description,
  clearText,
}: {
  onClear: () => void;
  title: string;
  description: string;
  clearText: string;
}) {
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

function parseMinRating(raw: string | null) {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return 0;
  const clamped = Math.min(5, Math.max(0, parsed));
  return Math.round(clamped * 2) / 2;
}

function normalizeAreaValue(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function formatRatingValue(template: string, value: number) {
  const safeTemplate = resolveMinRatingTemplate(template);
  return safeTemplate.replace("{value}", value.toFixed(1));
}

function resolveMinRatingTemplate(template: string) {
  const trimmed = template.trim();
  if (!trimmed || trimmed === "PublicPropertiesPage.minRatingValue") {
    return "{value} stjerner";
  }

  return trimmed;
}

function formatCityLabel(city: string) {
  return city
    .trim()
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
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

function getPropertyTypeLabel(type: Property["propertyType"], texts: PropertiesClientTexts) {
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

type PropertyMetaTile = {
  label: string;
  value: string;
};

function getAreaValue(property: Property, texts: PropertiesClientTexts) {
  if (property.propertyType === "bedsit") {
    return formatValue(property.roomAreaSqm, texts.notProvided);
  }
  return formatValue(property.areaSqm, texts.notProvided);
}

function buildMetaTiles(property: Property, texts: PropertiesClientTexts): PropertyMetaTile[] {
  return [
    {
      label: texts.propertyTypeLabel,
      value: getPropertyTypeLabel(property.propertyType, texts),
    },
    {
      label: texts.areaSqmLabel,
      value: getAreaValue(property, texts),
    },
    {
      label: texts.buildYearLabel,
      value: formatValue(property.buildYear, texts.notProvided),
    },
  ];
}

function PropertyCard({
  p,
  unknownAddress,
  unknownPlace,
  seeReviews,
  texts,
}: {
  p: Property;
  unknownAddress: string;
  unknownPlace: string;
  seeReviews: string;
  texts: PropertiesClientTexts;
}) {
  const displayAddress = capitalizeFirstLetter(p.address) || unknownAddress;
  const displayCity = capitalizeWords(p.city);
  const displayCountry = capitalizeWords(p.country);
  const displayPlace = [displayCity, displayCountry].filter(Boolean).join(", ") || unknownPlace;
  const metadataTiles = buildMetaTiles(p, texts);
  const summary = p.ratingsSummary;

  return (
    <Link href={`/properties/${p.id}/reviews`} className="block">
      <Card className="cursor-pointer transition-all hover:shadow-lg hover:shadow-blue-100/50">
        <CardHeader>
          <CardTitle className="text-xl text-blue-700">{displayAddress}</CardTitle>
          <CardDescription>{displayPlace}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          <div className="rounded-lg border bg-muted/20 p-3">
            <div className="mb-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {texts.propertyTypeLabel}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {metadataTiles.map((tile) => (
                <div key={tile.label} className="rounded-md border bg-background px-3 py-2">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {tile.label}
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">{tile.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-blue-100 bg-blue-50/40 p-3">
            <div className="mb-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-800">
                {texts.reviewCountLabel}: {p.ratingCount ?? 0}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              <div className="rounded-md border bg-background px-3 py-2">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{texts.totalLabel}</p>
                <StarRatingDisplay
                  value={summary?.overall ?? p.ratingAvg}
                  fallbackLabel={texts.notRated}
                  showDecimalLabel
                />
              </div>
              <div className="rounded-md border bg-background px-3 py-2">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{texts.locationLabel}</p>
                <StarRatingDisplay value={summary?.location} fallbackLabel={texts.notRated} showDecimalLabel />
              </div>
              <div className="rounded-md border bg-background px-3 py-2">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{texts.noiseLabel}</p>
                <StarRatingDisplay value={summary?.noise} fallbackLabel={texts.notRated} showDecimalLabel />
              </div>
              <div className="rounded-md border bg-background px-3 py-2">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{texts.landlordLabel}</p>
                <StarRatingDisplay value={summary?.landlord} fallbackLabel={texts.notRated} showDecimalLabel />
              </div>
              <div className="rounded-md border bg-background px-3 py-2">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{texts.conditionLabel}</p>
                <StarRatingDisplay value={summary?.condition} fallbackLabel={texts.notRated} showDecimalLabel />
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <span className="text-sm font-medium text-blue-700">
                {seeReviews} -&gt;
              </span>
            </div>
          </div>

        </CardContent>
      </Card>
    </Link>
  );
}

export default function PropertiesClient({ texts, messages }: PropertiesClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const initialArea = normalizeAreaValue(searchParams.get("area"));
  const initialMinRating = parseMinRating(searchParams.get("minRating"));

  const { properties, loading, error } = useProperties(messages);

  const [search, setSearch] = useState(initialQ);
  const [area, setArea] = useState(initialArea);
  const [minRating, setMinRating] = useState<number | null>(initialMinRating > 0 ? initialMinRating : null);

  useEffect(() => setSearch(initialQ), [initialQ]);
  useEffect(() => setArea(initialArea), [initialArea]);
  useEffect(() => setMinRating(initialMinRating > 0 ? initialMinRating : null), [initialMinRating]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const normalizedSearch = search.trim();
    const normalizedArea = normalizeAreaValue(area);
    const normalizedMinRating = parseMinRating(minRating === null ? null : String(minRating));

    if (normalizedSearch) params.set("q", normalizedSearch);
    else params.delete("q");

    if (normalizedArea) params.set("area", normalizedArea);
    else params.delete("area");

    if (normalizedMinRating > 0) params.set("minRating", normalizedMinRating.toFixed(1));
    else params.delete("minRating");

    const current = searchParams.toString();
    const next = params.toString();
    if (current === next) return;

    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [area, minRating, pathname, router, search, searchParams]);

  const availableAreas = useMemo(() => {
    const uniqueCities = new Set<string>();
    properties.forEach((property) => {
      const city = property.city?.trim();
      const normalizedCity = normalizeAreaValue(city);
      if (normalizedCity) uniqueCities.add(normalizedCity);
    });

    return Array.from(uniqueCities)
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({ value, label: formatCityLabel(value) }));
  }, [properties]);

  const filtered = usePropertySearch(properties, { search, area, minRating: minRating ?? 0 });
  const hasActiveFilters = search.trim().length > 0 || area.trim().length > 0 || (minRating !== null && minRating > 0);

  function clearAllFilters() {
    setSearch("");
    setArea("");
    setMinRating(null);
  }

  return (
    <main>
      <section className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <Badge className="mb-4">{texts.badge}</Badge>

          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-blue-700 md:text-4xl">{texts.title}</h1>
              <p className="mt-2 text-muted-foreground">{texts.subtitle}</p>
            </div>

            <Button asChild variant="secondary">
              <Link href="/">{texts.homeButton}</Link>
            </Button>
          </div>

          <PropertiesSearch value={search} onChange={setSearch} placeholder={texts.searchPlaceholder} />
          <PropertyFilters
            area={area}
            onAreaChange={setArea}
            areas={availableAreas}
            areaPlaceholder={texts.areaFilterPlaceholder}
            minRating={minRating}
            onMinRatingChange={setMinRating}
            minRatingPlaceholder={texts.minRatingPlaceholder}
            minRatingTemplate={texts.minRatingValue}
            minRatingAriaLabel={texts.minRatingAriaLabel}
          />

          {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
        </div>
      </section>

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
              onClear={clearAllFilters}
              title={texts.emptyTitle}
              description={hasActiveFilters ? texts.emptyFilteredDescription : texts.emptyDescription}
              clearText={texts.clearFilters}
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
                  texts={texts}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
