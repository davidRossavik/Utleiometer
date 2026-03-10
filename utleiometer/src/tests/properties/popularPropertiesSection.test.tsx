import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

import {
  PopularPropertiesSection,
  selectPopularProperties,
  type PopularPropertiesTexts,
} from "@/features/properties/components/popularPropertiesSection";
import type { Property } from "@/features/properties/types";

const mockState: { properties: Property[]; loading: boolean; error: string | null } = {
  properties: [],
  loading: false,
  error: null,
};

vi.mock("@/features/properties/hooks/useProperties", () => ({
  useProperties: () => ({
    properties: mockState.properties,
    loading: mockState.loading,
    error: mockState.error,
  }),
}));

const texts: PopularPropertiesTexts = {
  title: "Mest populære boliger",
  emptyDescription: "Ingen boliger med vurderinger er tilgjengelige akkurat nå.",
  imagePlaceholder: "Bilde kommer snart",
  ratingLabel: "Totalvurdering",
  propertyTypeLabel: "Boligtype",
  areaSqmLabel: "Kvadratmeter",
  notProvided: "Ikke oppgitt",
  propertyTypeHouse: "Hus",
  propertyTypeApartment: "Leilighet",
  propertyTypeBedsit: "Hybel",
  notRated: "Ikke vurdert",
  viewAllButton: "Vis alle boliger",
};

describe("selectPopularProperties", () => {
  it("filters, sorts and limits to 9 by rating, then rating count, then address", () => {
    const manyProperties: Property[] = [
      { id: "ignored-no-rating", address: "A Street", ratingCount: 3 },
      { id: "ignored-no-reviews", address: "B Street", ratingsSummary: { overall: 4.9 }, ratingCount: 0 },
      { id: "zeta", address: "zeta gate", ratingsSummary: { overall: 4.8 }, ratingCount: 10 },
      { id: "alpha", address: "alpha gate", ratingsSummary: { overall: 4.8 }, ratingCount: 10 },
      { id: "beta", address: "beta gate", ratingsSummary: { overall: 4.8 }, ratingCount: 8 },
      { id: "legacy-1", address: "legacy 1", ratingAvg: 4.7, ratingCount: 4 },
      { id: "r1", address: "r1", ratingsSummary: { overall: 4.6 }, ratingCount: 4 },
      { id: "r2", address: "r2", ratingsSummary: { overall: 4.5 }, ratingCount: 4 },
      { id: "r3", address: "r3", ratingsSummary: { overall: 4.4 }, ratingCount: 4 },
      { id: "r4", address: "r4", ratingsSummary: { overall: 4.3 }, ratingCount: 4 },
      { id: "r5", address: "r5", ratingsSummary: { overall: 4.2 }, ratingCount: 4 },
      { id: "r6", address: "r6", ratingsSummary: { overall: 4.1 }, ratingCount: 4 },
      { id: "r7", address: "r7", ratingsSummary: { overall: 4.0 }, ratingCount: 4 },
      { id: "r8", address: "r8", ratingsSummary: { overall: 3.9 }, ratingCount: 4 },
      { id: "r9", address: "r9", ratingsSummary: { overall: 3.8 }, ratingCount: 4 },
    ];

    const selected = selectPopularProperties(manyProperties);

    expect(selected).toHaveLength(9);
    expect(selected.map((property) => property.id)).toEqual([
      "alpha",
      "zeta",
      "beta",
      "legacy-1",
      "r1",
      "r2",
      "r3",
      "r4",
      "r5",
    ]);
  });
});

describe("PopularPropertiesSection", () => {
  beforeEach(() => {
    mockState.properties = [];
    mockState.loading = false;
    mockState.error = null;
  });

  it("renders popular property cards with required info and links", () => {
    mockState.properties = [
      {
        id: "prop-1",
        address: "elgeseter gate 1",
        propertyType: "house",
        areaSqm: 80,
        ratingsSummary: { overall: 4.8 },
        ratingCount: 3,
      },
      {
        id: "prop-2",
        address: "munkegata 10",
        propertyType: "bedsit",
        roomAreaSqm: 22,
        ratingAvg: 4.2,
        ratingCount: 1,
      },
    ];

    render(
      <PopularPropertiesSection
        texts={texts}
        messages={{ loadPropertiesError: "Kunne ikke hente boliger" }}
      />,
    );

    expect(screen.getByText("Mest populære boliger")).toBeInTheDocument();
    expect(screen.getByText("Elgeseter Gate 1")).toBeInTheDocument();
    expect(screen.getByText("Munkegata 10")).toBeInTheDocument();
    expect(screen.getAllByText("Bilde kommer snart")).toHaveLength(2);
    expect(screen.getByText("Hus")).toBeInTheDocument();
    expect(screen.getByText("Hybel")).toBeInTheDocument();
    expect(screen.getByText("80 m²")).toBeInTheDocument();
    expect(screen.getByText("22 m²")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Vis alle boliger" })).toHaveAttribute("href", "/properties");
    expect(screen.getByRole("link", { name: /elgeseter gate 1/i })).toHaveAttribute("href", "/properties/prop-1/reviews");
    expect(screen.getByRole("link", { name: /munkegata 10/i })).toHaveAttribute("href", "/properties/prop-2/reviews");

    const grid = screen.getByTestId("popular-properties-grid");
    expect(grid.className).toContain("lg:grid-cols-3");
  });

  it("shows empty state when no popular properties are available", () => {
    mockState.properties = [
      { id: "no-reviews", address: "street 1", ratingsSummary: { overall: 5 }, ratingCount: 0 },
      { id: "no-rating", address: "street 2", ratingCount: 5 },
    ];

    render(
      <PopularPropertiesSection
        texts={texts}
        messages={{ loadPropertiesError: "Kunne ikke hente boliger" }}
      />,
    );

    expect(screen.getByText("Ingen boliger med vurderinger er tilgjengelige akkurat nå.")).toBeInTheDocument();
  });
});
