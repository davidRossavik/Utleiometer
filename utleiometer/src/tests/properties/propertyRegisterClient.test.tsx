import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const replaceMock = vi.fn();
const pushMock = vi.fn();
const lookupPropertyByAddressActionMock = vi.fn();
const submitUnifiedReviewActionMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: pushMock }),
}));

vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => ({ currentUser: { uid: "user-1", displayName: "ola_nordmann" } }),
}));

vi.mock("@/app/[locale]/actions/properties", () => ({
  lookupPropertyByAddressAction: (...args: unknown[]) => lookupPropertyByAddressActionMock(...args),
  submitUnifiedReviewAction: (...args: unknown[]) => submitUnifiedReviewActionMock(...args),
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
  cardTitle: "Legg til anmeldelse",
  cardDescription: "Beskrivelse",
  addressStepTitle: "Steg 1",
  propertyDetailsStepTitle: "Steg 2",
  reviewStepTitle: "Steg 3",
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
  continueButton: "Continue",
  cancelButton: "Cancel",
  submitButton: "Submit",
  submittingButton: "Submitting",
  propertyFoundMessage: "Property found",
  propertyNotFoundMessage: "Property not found",
  hint: "Hint",
};

const messages = {
  notLoggedIn: "Not logged in",
  unknownError: "Unknown",
};

describe("PropertyRegisterClient wizard", () => {
  beforeEach(() => {
    replaceMock.mockReset();
    pushMock.mockReset();
    lookupPropertyByAddressActionMock.mockReset();
    submitUnifiedReviewActionMock.mockReset();
  });

  function fillAddressStep() {
    fireEvent.change(screen.getByLabelText("Address"), { target: { value: "Street 1" } });
    fireEvent.change(screen.getByLabelText("Zip"), { target: { value: "7030" } });
    fireEvent.change(screen.getByLabelText("City"), { target: { value: "Trondheim" } });
  }

  function fillRatingsAndComment() {
    fireEvent.change(screen.getByTestId("ratingLocation"), { target: { value: "4" } });
    fireEvent.change(screen.getByTestId("ratingNoise"), { target: { value: "4" } });
    fireEvent.change(screen.getByTestId("ratingLandlord"), { target: { value: "4" } });
    fireEvent.change(screen.getByTestId("ratingCondition"), { target: { value: "4" } });
    fireEvent.change(screen.getByLabelText("Comment"), { target: { value: "Solid property" } });
  }

  it("starts with address step only", () => {
    render(<PropertyRegisterClient texts={texts} messages={messages} />);

    expect(screen.getByLabelText("Address")).toBeInTheDocument();
    expect(screen.getByLabelText("Zip")).toBeInTheDocument();
    expect(screen.getByLabelText("City")).toBeInTheDocument();
    expect(screen.queryByLabelText("Area")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Comment")).not.toBeInTheDocument();
  });

  it("skips property details when property already exists", async () => {
    lookupPropertyByAddressActionMock.mockResolvedValueOnce({
      exists: true,
      propertyId: "existing-1",
      propertyType: "house",
    });

    render(<PropertyRegisterClient texts={texts} messages={messages} />);

    fillAddressStep();
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByLabelText("Comment")).toBeInTheDocument();
    expect(screen.queryByLabelText("Area")).not.toBeInTheDocument();
  });

  it("shows property details step when property does not exist", async () => {
    lookupPropertyByAddressActionMock.mockResolvedValueOnce({ exists: false });

    render(<PropertyRegisterClient texts={texts} messages={messages} />);

    fillAddressStep();
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByLabelText("Type")).toBeInTheDocument();
    expect(screen.getByLabelText("Area")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Type"), { target: { value: "bedsit" } });
    expect(screen.getByLabelText("Room area")).toBeInTheDocument();
  });

  it("cancels and navigates to home", () => {
    render(<PropertyRegisterClient texts={texts} messages={messages} />);

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(pushMock).toHaveBeenCalledWith("/");
  });

  it("redirects to property reviews page with submitted=review on success", async () => {
    lookupPropertyByAddressActionMock.mockResolvedValueOnce({ exists: false });
    submitUnifiedReviewActionMock.mockResolvedValueOnce({ propertyId: "prop-1" });

    render(<PropertyRegisterClient texts={texts} messages={messages} />);

    fillAddressStep();
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await screen.findByLabelText("Type");
    fireEvent.change(screen.getByLabelText("Area"), { target: { value: "75" } });
    fireEvent.change(screen.getByLabelText("Bedrooms"), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText("Bathrooms"), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText("Floors"), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText("Build year"), { target: { value: "2020" } });

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await screen.findByLabelText("Comment");
    fillRatingsAndComment();
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(submitUnifiedReviewActionMock).toHaveBeenCalledTimes(1);
      expect(replaceMock).toHaveBeenCalledWith("/properties/prop-1/reviews?submitted=review");
    });

    const submittedFormData = submitUnifiedReviewActionMock.mock.calls[0][0] as FormData;
    expect(submittedFormData.get("userDisplayName")).toBe("ola_nordmann");
  });
});
