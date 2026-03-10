import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const replaceMock = vi.fn();
const createPropertyAndReviewActionMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => ({ currentUser: { uid: "user-1" } }),
}));

vi.mock("@/app/[locale]/actions/properties", () => ({
  createPropertyAndReviewAction: (...args: unknown[]) => createPropertyAndReviewActionMock(...args),
}));

vi.mock("@/features/reviews/componentes/StarRatingInput", () => ({
  StarRatingInput: ({ id, name, value, onChange, required }: any) => (
    <input
      id={id}
      name={name}
      data-testid={name}
      type="number"
      value={value ?? ""}
      required={required}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  ),
}));

import PropertyRegisterClient from "@/features/properties/client/PropertyRegisterClient";

const texts = {
  cardTitle: "Card",
  cardDescription: "Description",
  sectionRegisterTitle: "Register",
  addressLabel: "Address",
  addressPlaceholder: "",
  zipCodeLabel: "Zip",
  zipCodePlaceholder: "",
  cityLabel: "City",
  cityPlaceholder: "",
  propertyTypeLabel: "Type",
  propertyTypeHouse: "House",
  propertyTypeApartment: "Apartment",
  propertyTypeBedsit: "Bedsit",
  areaSqmLabel: "Area",
  areaSqmPlaceholder: "",
  bedroomsLabel: "Bedrooms",
  bedroomsPlaceholder: "",
  bathroomsLabel: "Bathrooms",
  bathroomsPlaceholder: "",
  floorsLabel: "Floors",
  floorsPlaceholder: "",
  buildYearLabel: "Build year",
  buildYearPlaceholder: "",
  roomAreaSqmLabel: "Room area",
  roomAreaSqmPlaceholder: "",
  hasPrivateBathroomLabel: "Private bathroom",
  hasPrivateBathroomYes: "Yes",
  hasPrivateBathroomNo: "No",
  otherBedsitsInUnitLabel: "Other bedsits",
  otherBedsitsInUnitPlaceholder: "",
  sectionReviewTitle: "Review",
  commentLabel: "Comment",
  commentPlaceholder: "",
  ratingsTitle: "Ratings",
  locationLabel: "Location",
  locationHelp: "",
  noiseLabel: "Noise",
  noiseHelp: "",
  landlordLabel: "Landlord",
  landlordHelp: "",
  conditionLabel: "Condition",
  conditionHelp: "",
  submit: "Submit",
  submitting: "Submitting",
  hint: "Hint",
};

const messages = {
  notLoggedIn: "Not logged in",
  unknownError: "Unknown",
};

describe("PropertyRegisterClient", () => {
  beforeEach(() => {
    replaceMock.mockReset();
    createPropertyAndReviewActionMock.mockReset();
  });

  function fillRequiredFields() {
    fireEvent.change(screen.getByLabelText("Address"), { target: { value: "Street 1" } });
    fireEvent.change(screen.getByLabelText("Zip"), { target: { value: "1234" } });
    fireEvent.change(screen.getByLabelText("City"), { target: { value: "Trondheim" } });
    fireEvent.change(screen.getByLabelText("Area"), { target: { value: "75" } });
    fireEvent.change(screen.getByLabelText("Bedrooms"), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText("Bathrooms"), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText("Floors"), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText("Build year"), { target: { value: "2020" } });

    fireEvent.change(screen.getByTestId("ratingLocation"), { target: { value: "4" } });
    fireEvent.change(screen.getByTestId("ratingNoise"), { target: { value: "4" } });
    fireEvent.change(screen.getByTestId("ratingLandlord"), { target: { value: "4" } });
    fireEvent.change(screen.getByTestId("ratingCondition"), { target: { value: "4" } });
    fireEvent.change(screen.getByLabelText("Comment"), { target: { value: "Solid property" } });
  }

  it("redirects to property reviews page with submitted=property on success", async () => {
    createPropertyAndReviewActionMock.mockResolvedValueOnce({ propertyId: "prop-1" });

    render(<PropertyRegisterClient texts={texts} messages={messages} />);

    fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(createPropertyAndReviewActionMock).toHaveBeenCalledTimes(1);
      expect(replaceMock).toHaveBeenCalledWith("/properties/prop-1/reviews?submitted=property");
    });
  });

  it("shows error and does not redirect when action fails", async () => {
    createPropertyAndReviewActionMock.mockResolvedValueOnce({ error: "Duplicate property" });

    render(<PropertyRegisterClient texts={texts} messages={messages} />);

    fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByText("Duplicate property")).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
