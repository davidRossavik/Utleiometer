import { describe, expect, it } from "vitest";

import { filterProperties } from "@/features/properties/hooks/usePropertySearch";
import type { Property } from "@/features/properties/types";

const properties: Property[] = [
  {
    id: "1",
    address: "Elgeseter gate 1",
    city: "Trondheim",
    country: "Norway",
    ratingsSummary: { overall: 4.5 },
  },
  {
    id: "2",
    address: "Munkegata 10",
    city: "Trondheim",
    country: "Norway",
    ratingAvg: 3.2,
  },
  {
    id: "3",
    address: "Karl Johans gate 5",
    city: "Oslo",
    country: "Norway",
  },
];

describe("filterProperties", () => {
  it("filters by area only", () => {
    const result = filterProperties(properties, {
      search: "",
      area: " trondheim ",
      minRating: 0,
    });

    expect(result.map((property) => property.id)).toEqual(["1", "2"]);
  });

  it("filters by minimum rating only", () => {
    const result = filterProperties(properties, {
      search: "",
      area: "",
      minRating: 4,
    });

    expect(result.map((property) => property.id)).toEqual(["1"]);
  });

  it("combines area and minimum rating filters", () => {
    const result = filterProperties(properties, {
      search: "",
      area: "trondheim",
      minRating: 4.4,
    });

    expect(result.map((property) => property.id)).toEqual(["1"]);
  });

  it("combines text search with area and rating filters", () => {
    const result = filterProperties(properties, {
      search: "elgeseter",
      area: "trondheim",
      minRating: 4,
    });

    expect(result.map((property) => property.id)).toEqual(["1"]);
  });

  it("excludes unrated properties when minRating is above zero", () => {
    const result = filterProperties(properties, {
      search: "",
      area: "",
      minRating: 0.5,
    });

    expect(result.map((property) => property.id)).toEqual(["1", "2"]);
    expect(result.some((property) => property.id === "3")).toBe(false);
  });

  it("includes unrated properties when minRating is zero", () => {
    const result = filterProperties(properties, {
      search: "",
      area: "",
      minRating: 0,
    });

    expect(result.map((property) => property.id)).toEqual(["1", "2", "3"]);
  });
});
