import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

let submittedParam: string | null = null;

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: (key: string) => (key === "submitted" ? submittedParam : null),
  }),
}));

vi.mock("@/features/reviews/hooks/useReviews", () => ({
  useReviews: () => ({ reviews: [], loading: false, error: null }),
}));

vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => ({ currentUser: null }),
}));

vi.mock("@/features/properties/data/fetchProperties", () => ({
  fetchPropertyById: vi.fn(),
}));

vi.mock("@/app/[locale]/actions/reviews", () => ({
  updateReviewAction: vi.fn(),
  deleteReviewAction: vi.fn(),
}));

import ReviewsClient from "@/features/reviews/client/ReviewsClient";

const texts = {
  badge: "Badge",
  title: "Title",
  toProperties: "To properties",
  addReview: "Add review",
  searchPlaceholder: "Search",
  loadingTitle: "Loading",
  loadingDescription: "Loading description",
  emptyTitle: "Empty",
  emptyNoMatch: "No match",
  emptyNoReviews: "No reviews",
  clearSearch: "Clear",
  unknownProperty: "Unknown",
  averageTitle: "Average",
  overallLabel: "Overall",
  locationLabel: "Location",
  noiseLabel: "Noise",
  landlordLabel: "Landlord",
  conditionLabel: "Condition",
  notRated: "Not rated",
  reviewDefaultTitle: "Review",
  reviewEditTitle: "Edit",
  reviewEmptyComment: "No comment",
  reviewConfirmDelete: "Confirm",
  reviewDeleteYes: "Yes",
  reviewDeleteNo: "No",
  reviewEdit: "Edit",
  reviewDelete: "Delete",
  propertyDetailsTitle: "Property details",
  propertyTypeLabel: "Type",
  areaSqmLabel: "Area",
  bedroomsLabel: "Bedrooms",
  bathroomsLabel: "Bathrooms",
  floorsLabel: "Floors",
  buildYearLabel: "Build year",
  roomAreaSqmLabel: "Room area",
  hasPrivateBathroomLabel: "Private bathroom",
  otherBedsitsInUnitLabel: "Other bedsits",
  yes: "Yes",
  no: "No",
  notProvided: "Not provided",
  propertyTypeHouse: "House",
  propertyTypeApartment: "Apartment",
  propertyTypeBedsit: "Bedsit",
  reviewSubmittedSuccess: "Review submitted",
  propertySubmittedSuccess: "Property submitted",
};

const messages = {
  loadReviewsError: "Could not load",
};

const property = {
  id: "prop-1",
  address: "street 1",
  city: "trondheim",
  country: "norway",
  propertyType: "house" as const,
};

describe("ReviewsClient success banner", () => {
  beforeEach(() => {
    submittedParam = null;
  });

  it("shows review success banner for submitted=review", () => {
    submittedParam = "review";

    render(<ReviewsClient propertyId="prop-1" property={property} texts={texts} messages={messages} />);

    expect(screen.getByText("Review submitted")).toBeInTheDocument();
  });

  it("shows property success banner for submitted=property", () => {
    submittedParam = "property";

    render(<ReviewsClient propertyId="prop-1" property={property} texts={texts} messages={messages} />);

    expect(screen.getByText("Property submitted")).toBeInTheDocument();
  });

  it("does not show success banner for unknown or missing submitted", () => {
    submittedParam = "unknown";

    const { rerender } = render(
      <ReviewsClient propertyId="prop-1" property={property} texts={texts} messages={messages} />,
    );

    expect(screen.queryByText("Review submitted")).not.toBeInTheDocument();
    expect(screen.queryByText("Property submitted")).not.toBeInTheDocument();

    submittedParam = null;
    rerender(<ReviewsClient propertyId="prop-1" property={property} texts={texts} messages={messages} />);

    expect(screen.queryByText("Review submitted")).not.toBeInTheDocument();
    expect(screen.queryByText("Property submitted")).not.toBeInTheDocument();
  });
});
