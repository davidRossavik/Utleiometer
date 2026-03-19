"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Badge } from "@/ui/feedback/badge";
import { Button } from "@/ui/primitives/button";
import { Input } from "@/ui/primitives/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/feedback/card";
import { StarRatingDisplay } from "@/features/reviews/componentes/StarRatingDisplay";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { deletePropertyAction } from "@/app/[locale]/actions/properties";

import { useProperties } from "../hooks/useProperties";
import { getPropertyOverallRating, usePropertySearch } from "../hooks/usePropertySearch";
import { Property } from "../types";
import { PropertyReviewImages } from "./PropertyReviewImages";

type SortBy = "alphabetical" | "latestReview" | "popularity";

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
  sortByLabel: string;
  sortByAlphabetical: string;
  sortByLatestReview: string;
  sortByPopularity: string;
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
  adminDeleteProperty?: string;
  adminDeletePropertyConfirm?: string;
  adminDeletePropertySuccess?: string;
  adminDeletePropertyError?: string;
  adminDeletePropertyUnauthorized?: string;
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
  sortBy,
  onSortByChange,
  sortByLabel,
  sortByAlphabetical,
  sortByLatestReview,
  sortByPopularity,
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
  sortBy: SortBy;
  onSortByChange: (next: SortBy) => void;
  sortByLabel: string;
  sortByAlphabetical: string;
  sortByLatestReview: string;
  sortByPopularity: string;
}) {
  const ratingOptions = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
  const selectStyle =
    "h-10 min-w-44 appearance-none rounded-full border border-input bg-white/90 px-4 text-sm text-slate-700 shadow-sm transition-all outline-none [background-image:none] hover:shadow focus-visible:ring-2 focus-visible:ring-ring/30";

  return (
    <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={area}
          onChange={(e) => onAreaChange(e.target.value)}
          className={selectStyle}
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
          className={selectStyle}
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

      <div className="flex justify-start md:justify-end">
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(parseSortBy(e.target.value))}
          className={selectStyle}
          aria-label={sortByLabel}
        >
          <option value="alphabetical">{sortByAlphabetical}</option>
          <option value="latestReview">{sortByLatestReview}</option>
          <option value="popularity">{sortByPopularity}</option>
        </select>
      </div>
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

function parseSortBy(value: string | null | undefined): SortBy {
  if (value === "latestReview") return "latestReview";
  if (value === "popularity") return "popularity";
  return "alphabetical";
}

function normalizeAddressValue(value: string | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function sortProperties(properties: Property[], sortBy: SortBy) {
  const sorted = [...properties];

  sorted.sort((a, b) => {
    if (sortBy === "latestReview") {
      const aTime = a.latestReviewAt ?? Number.NEGATIVE_INFINITY;
      const bTime = b.latestReviewAt ?? Number.NEGATIVE_INFINITY;
      if (bTime !== aTime) return bTime - aTime;
      return normalizeAddressValue(a.address).localeCompare(normalizeAddressValue(b.address));
    }

    if (sortBy === "popularity") {
      const ratingA = getPropertyOverallRating(a) ?? Number.NEGATIVE_INFINITY;
      const ratingB = getPropertyOverallRating(b) ?? Number.NEGATIVE_INFINITY;
      if (ratingB !== ratingA) return ratingB - ratingA;

      const countA = a.ratingCount ?? 0;
      const countB = b.ratingCount ?? 0;
      if (countB !== countA) return countB - countA;
      return normalizeAddressValue(a.address).localeCompare(normalizeAddressValue(b.address));
    }

    return normalizeAddressValue(a.address).localeCompare(normalizeAddressValue(b.address));
  });

  return sorted;
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
  isAdmin,
  isDeleting,
  onDeleteProperty,
}: {
  p: Property;
  unknownAddress: string;
  unknownPlace: string;
  seeReviews: string;
  texts: PropertiesClientTexts;
  isAdmin: boolean;
  isDeleting: boolean;
  onDeleteProperty: (property: Property) => void;
}) {
  const displayAddress = capitalizeFirstLetter(p.address) || unknownAddress;
  const displayCity = capitalizeWords(p.city);
  const displayCountry = capitalizeWords(p.country);
  const displayPlace = [displayCity, displayCountry].filter(Boolean).join(", ") || unknownPlace;
  const metadataTiles = buildMetaTiles(p, texts);
  const summary = p.ratingsSummary;
  const deleteLabel = texts.adminDeleteProperty ?? "Slett bolig";

  return (
      <Card className="transition-all hover:shadow-lg hover:shadow-blue-100/50">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="flex flex-1 flex-col gap-1">
              <CardTitle className="text-2xl text-blue-700">
                <Link href={`/properties/${p.id}/reviews`} className="hover:underline">
                  {displayAddress}
                </Link>
              </CardTitle>
              <CardDescription>{displayPlace}</CardDescription>

              {isAdmin ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDeleteProperty(p)}
                  disabled={isDeleting}
                  className="mt-2 self-start"
                >
                  {isDeleting ? `${deleteLabel}...` : deleteLabel}
                </Button>
              ) : null}
            </div>

            {p.imageUrl ? (
              <div className="h-44 w-2/3 shrink-0 overflow-hidden rounded-lg border bg-muted/20">
                <img
                  src={p.imageUrl}
                  alt={displayAddress}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            ) : null}
          </div>
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

            <div className="mt-3 flex items-center justify-end">
              <Link href={`/properties/${p.id}/reviews`} className="text-sm font-medium text-blue-700 hover:underline">
                {seeReviews} -&gt;
              </Link>
            </div>
          </div>

        </CardContent>
      </Card>
  );
}

export default function PropertiesClient({ texts, messages }: PropertiesClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { currentUser, isAdmin } = useAuth();
  const initialQ = searchParams.get("q") ?? "";
  const initialArea = normalizeAreaValue(searchParams.get("area"));
  const initialMinRating = parseMinRating(searchParams.get("minRating"));
  const initialSortBy = parseSortBy(searchParams.get("sort"));

  const { properties, loading, error } = useProperties(messages);
  const [deletingPropertyId, setDeletingPropertyId] = useState<string | null>(null);
  const [deletedPropertyIds, setDeletedPropertyIds] = useState<Set<string>>(new Set());

  const [search, setSearch] = useState(initialQ);
  const [area, setArea] = useState(initialArea);
  const [minRating, setMinRating] = useState<number | null>(initialMinRating > 0 ? initialMinRating : null);
  const [sortBy, setSortBy] = useState<SortBy>(initialSortBy);

  useEffect(() => setSearch(initialQ), [initialQ]);
  useEffect(() => setArea(initialArea), [initialArea]);
  useEffect(() => setMinRating(initialMinRating > 0 ? initialMinRating : null), [initialMinRating]);
  useEffect(() => setSortBy(initialSortBy), [initialSortBy]);

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

    if (sortBy !== "alphabetical") params.set("sort", sortBy);
    else params.delete("sort");

    const current = searchParams.toString();
    const next = params.toString();
    if (current === next) return;

    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [area, minRating, pathname, router, search, searchParams, sortBy]);

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
  const sorted = useMemo(() => sortProperties(filtered, sortBy), [filtered, sortBy]);
  const visibleProperties = useMemo(
    () => sorted.filter((property) => !deletedPropertyIds.has(property.id)),
    [deletedPropertyIds, sorted],
  );
  const hasActiveFilters = search.trim().length > 0 || area.trim().length > 0 || (minRating !== null && minRating > 0);

  async function handleDeleteProperty(property: Property) {
    const unauthorizedMessage = texts.adminDeletePropertyUnauthorized ?? "Kun administratorer kan slette boliger.";
    const confirmMessage = texts.adminDeletePropertyConfirm ?? "Er du sikker på at du vil slette boligen og alle anmeldelsene?";
    const successMessage = texts.adminDeletePropertySuccess ?? "Boligen og alle anmeldelser ble slettet.";
    const errorMessage = texts.adminDeletePropertyError ?? "Kunne ikke slette bolig.";

    if (!currentUser || !isAdmin) {
      alert(unauthorizedMessage);
      return;
    }

    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) {
      return;
    }

    setDeletingPropertyId(property.id);
    try {
      const callerIdToken = await currentUser.getIdToken();
      const result = await deletePropertyAction(property.id, callerIdToken);

      if (!result.success) {
        alert(result.error ?? errorMessage);
        return;
      }

      setDeletedPropertyIds((prev) => new Set(prev).add(property.id));
      alert(successMessage);
    } catch (deleteError) {
      console.error("Error deleting property:", deleteError);
      alert(errorMessage);
    } finally {
      setDeletingPropertyId(null);
    }
  }

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
            sortBy={sortBy}
            onSortByChange={setSortBy}
            sortByLabel={texts.sortByLabel}
            sortByAlphabetical={texts.sortByAlphabetical}
            sortByLatestReview={texts.sortByLatestReview}
            sortByPopularity={texts.sortByPopularity}
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
          ) : visibleProperties.length === 0 ? (
            <PropertiesEmpty
              onClear={clearAllFilters}
              title={texts.emptyTitle}
              description={hasActiveFilters ? texts.emptyFilteredDescription : texts.emptyDescription}
              clearText={texts.clearFilters}
            />
          ) : (
            <div className="flex flex-col gap-6">
              {visibleProperties.map((p) => (
                <PropertyCard
                  key={p.id}
                  p={p}
                  unknownAddress={texts.unknownAddress}
                  unknownPlace={texts.unknownPlace}
                  seeReviews={texts.seeReviews}
                  texts={texts}
                  isAdmin={isAdmin}
                  isDeleting={deletingPropertyId === p.id}
                  onDeleteProperty={handleDeleteProperty}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
