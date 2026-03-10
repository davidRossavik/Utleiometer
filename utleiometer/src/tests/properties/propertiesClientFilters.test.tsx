import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import PropertiesClient, {
  type PropertiesClientTexts,
} from "@/features/properties/client/PropertiesClient";
import type { Property } from "@/features/properties/types";

const replaceMock = vi.fn();
const mockSearchParamsState = { value: new URLSearchParams() };

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => "/properties",
  useSearchParams: () => mockSearchParamsState.value,
}));

const properties: Property[] = [
  {
    id: "1",
    address: "elgeseter gate 1",
    city: "trondheim",
    country: "Norway",
    ratingsSummary: { overall: 4.5 },
    ratingCount: 8,
  },
  {
    id: "2",
    address: "munkegata 10",
    city: "Trondheim",
    country: "Norway",
    ratingAvg: 3.5,
    ratingCount: 4,
  },
  {
    id: "3",
    address: "kirkegata 2",
    city: "Oslo",
    country: "Norway",
    ratingCount: 0,
  },
];

vi.mock("@/features/properties/hooks/useProperties", () => ({
  useProperties: () => ({
    properties,
    loading: false,
    error: null,
  }),
}));

const texts: PropertiesClientTexts = {
  badge: "Boliger",
  title: "Utforsk boliger",
  subtitle: "Finn bolig",
  homeButton: "Til forsiden",
  searchPlaceholder: "Søk",
  loadingTitle: "Laster",
  loadingDescription1: "Laster 1",
  loadingDescription2: "Laster 2",
  emptyTitle: "Ingen treff",
  emptyDescription: "Ingen boliger tilgjengelig",
  clearFilters: "Nullstill filtre",
  areaFilterPlaceholder: "Område",
  minRatingPlaceholder: "Minimum rating",
  minRatingValue: "{value} stjerner",
  minRatingAriaLabel: "Minimum rating",
  sortByLabel: "Sorter etter",
  sortByAlphabetical: "Alfabetisk",
  sortByLatestReview: "Nyligst (lagt til anmeldelse)",
  sortByPopularity: "Popularitet (best rating)",
  emptyFilteredDescription: "Ingen boliger matcher valgt område og rating.",
  unknownAddress: "Ukjent adresse",
  unknownPlace: "Ukjent sted",
  seeReviews: "Se anmeldelser",
  totalLabel: "Total",
  locationLabel: "Beliggenhet",
  noiseLabel: "Støy",
  landlordLabel: "Utleier",
  conditionLabel: "Standard",
  notRated: "Ikke vurdert",
  reviewCountLabel: "Antall anmeldelser",
  propertyTypeLabel: "Boligtype",
  areaSqmLabel: "Størrelse",
  buildYearLabel: "Byggeår",
  notProvided: "Ikke oppgitt",
  propertyTypeHouse: "Hus",
  propertyTypeApartment: "Leilighet",
  propertyTypeBedsit: "Hybel",
};

describe("PropertiesClient filters", () => {
  beforeEach(() => {
    replaceMock.mockReset();
    mockSearchParamsState.value = new URLSearchParams();
  });

  it("reads initial filters from query params", () => {
    mockSearchParamsState.value = new URLSearchParams("q=elgeseter&area=Trondheim&minRating=4.0");

    render(
      <PropertiesClient
        texts={texts}
        messages={{ loadPropertiesError: "Kunne ikke hente boliger" }}
      />,
    );

    expect(screen.getByText("Elgeseter gate 1")).toBeInTheDocument();
    expect(screen.queryByText("Munkegata 10")).not.toBeInTheDocument();
    expect(screen.queryByText("Kirkegata 2")).not.toBeInTheDocument();
  });

  it("updates property list and URL when area and rating are changed", () => {
    render(
      <PropertiesClient
        texts={texts}
        messages={{ loadPropertiesError: "Kunne ikke hente boliger" }}
      />,
    );

    expect(screen.getByRole("option", { name: "Trondheim" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Område"), { target: { value: "trondheim" } });
    fireEvent.change(screen.getByLabelText("Minimum rating"), { target: { value: "4" } });

    expect(screen.getByText("Elgeseter gate 1")).toBeInTheDocument();
    expect(screen.queryByText("Munkegata 10")).not.toBeInTheDocument();
    expect(screen.queryByText("Kirkegata 2")).not.toBeInTheDocument();

    expect(replaceMock).toHaveBeenCalled();
    const lastCall = replaceMock.mock.calls[replaceMock.mock.calls.length - 1];
    expect(lastCall?.[0]).toContain("area=trondheim");
    expect(lastCall?.[0]).toContain("minRating=4.0");
  });

  it("shows empty state when no match and resets all filters", () => {
    render(
      <PropertiesClient
        texts={texts}
        messages={{ loadPropertiesError: "Kunne ikke hente boliger" }}
      />,
    );

    fireEvent.change(screen.getByLabelText("Område"), { target: { value: "oslo" } });
    fireEvent.change(screen.getByLabelText("Minimum rating"), { target: { value: "5" } });

    expect(screen.getByText("Ingen treff")).toBeInTheDocument();
    expect(screen.getByText("Ingen boliger matcher valgt område og rating.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Nullstill filtre" }));

    expect(screen.getByText("Elgeseter gate 1")).toBeInTheDocument();
    expect(screen.getByText("Munkegata 10")).toBeInTheDocument();
    expect(screen.getByText("Kirkegata 2")).toBeInTheDocument();
  });

  it("updates URL when sort order is changed", () => {
    render(
      <PropertiesClient
        texts={texts}
        messages={{ loadPropertiesError: "Kunne ikke hente boliger" }}
      />,
    );

    fireEvent.change(screen.getByLabelText("Sorter etter"), { target: { value: "popularity" } });

    expect(replaceMock).toHaveBeenCalled();
    const lastCall = replaceMock.mock.calls[replaceMock.mock.calls.length - 1];
    expect(lastCall?.[0]).toContain("sort=popularity");
  });
});
