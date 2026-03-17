"use client";

import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/feedback/card";
import { StarRatingDisplay } from "@/features/reviews/componentes/StarRatingDisplay";
import { Button } from "@/ui/primitives/button";

import { useProperties } from "../hooks/useProperties";
import type { Property } from "../types";

type PopularPropertiesTexts = {
  title: string;
  emptyDescription: string;
  imagePlaceholder: string;
  ratingLabel: string;
  propertyTypeLabel: string;
  areaSqmLabel: string;
  notProvided: string;
  propertyTypeHouse: string;
  propertyTypeApartment: string;
  propertyTypeBedsit: string;
  notRated: string;
  viewAllButton: string;
};

type PopularPropertiesMessages = {
  loadPropertiesError: string;
};

type PopularPropertiesSectionProps = {
  texts: PopularPropertiesTexts;
  messages: PopularPropertiesMessages;
};

function getOverallRating(property: Property) {
  if (typeof property.ratingsSummary?.overall === "number") {
    return property.ratingsSummary.overall;
  }

  if (typeof property.ratingAvg === "number") {
    return property.ratingAvg;
  }

  return null;
}

function getSortableAddress(property: Property) {
  return (property.address ?? "").trim().toLowerCase();
}

export function selectPopularProperties(properties: Property[]) {
  return properties
    .filter((property) => {
      const rating = getOverallRating(property);
      const ratingCount = property.ratingCount ?? 0;
      return typeof rating === "number" && Number.isFinite(rating) && ratingCount >= 1;
    })
    .sort((a, b) => {
      const ratingA = getOverallRating(a) ?? -1;
      const ratingB = getOverallRating(b) ?? -1;
      if (ratingB !== ratingA) return ratingB - ratingA;

      const countA = a.ratingCount ?? 0;
      const countB = b.ratingCount ?? 0;
      if (countB !== countA) return countB - countA;

      return getSortableAddress(a).localeCompare(getSortableAddress(b));
    })
    .slice(0, 9);
}

function getPropertyTypeLabel(propertyType: Property["propertyType"], texts: PopularPropertiesTexts) {
  if (propertyType === "house") return texts.propertyTypeHouse;
  if (propertyType === "apartment") return texts.propertyTypeApartment;
  if (propertyType === "bedsit") return texts.propertyTypeBedsit;
  return texts.notProvided;
}

function getAreaSqm(property: Property, texts: PopularPropertiesTexts) {
  if (property.propertyType === "bedsit") {
    return property.roomAreaSqm ?? texts.notProvided;
  }

  return property.areaSqm ?? texts.notProvided;
}

function formatAddress(address: string | undefined, fallback: string) {
  if (!address) return fallback;
  return address
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function PopularPropertiesSection({ texts, messages }: PopularPropertiesSectionProps) {
  const { properties, loading, error } = useProperties(messages);
  const popularProperties = selectPopularProperties(properties);

  return (
    <section className="container mx-auto px-4 py-8 md:py-12">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{texts.title}</h2>

        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

        {loading ? (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={`popular-loading-${index}`}>
                <CardHeader>
                  <div className="h-40 w-full rounded-lg bg-muted" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="h-4 w-2/3 rounded bg-muted" />
                  <div className="h-4 w-1/2 rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : popularProperties.length === 0 ? (
          <p className="mt-4 text-muted-foreground">{texts.emptyDescription}</p>
        ) : (
          <>
            <div data-testid="popular-properties-grid" className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {popularProperties.map((property) => {
                const overallRating = getOverallRating(property) ?? undefined;
                const areaSqm = getAreaSqm(property, texts);

                return (
                  <Link key={property.id} href={`/properties/${property.id}/reviews`} className="block">
                    <Card className="h-full cursor-pointer gap-4 transition-all hover:shadow-lg hover:shadow-blue-100/50">
                      <CardHeader className="gap-1">
                        <div className="mb-3 h-40 overflow-hidden rounded-lg border bg-muted/30">
                          {property.imageUrl ? (
                            <img
                              src={property.imageUrl}
                              alt={formatAddress(property.address, texts.notProvided)}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                              {texts.imagePlaceholder}
                            </div>
                          )}
                        </div>
                        <CardTitle className="text-xl text-blue-700">
                          {formatAddress(property.address, texts.notProvided)}
                        </CardTitle>
                        <CardDescription className="text-base font-semibold text-muted-foreground/90">
                          {getPropertyTypeLabel(property.propertyType, texts)}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{texts.ratingLabel}</p>
                          <StarRatingDisplay value={overallRating} fallbackLabel={texts.notRated} showDecimalLabel />
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{texts.areaSqmLabel}</p>
                          <p className="text-sm font-medium">{areaSqm === texts.notProvided ? areaSqm : `${areaSqm} m²`}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            <div className="mt-8 flex justify-center">
              <Button asChild size="lg" className="rounded-xl px-8">
                <Link href="/properties">{texts.viewAllButton}</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export type { PopularPropertiesTexts, PopularPropertiesMessages };
