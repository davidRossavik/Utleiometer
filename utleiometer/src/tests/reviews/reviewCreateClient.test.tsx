import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const replaceMock = vi.fn();
const createReviewActionMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => ({ currentUser: { uid: "user-1" } }),
}));

vi.mock("@/app/[locale]/actions/reviews", () => ({
  createReviewAction: (...args: unknown[]) => createReviewActionMock(...args),
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

import ReviewCreateClient from "@/features/reviews/client/ReviewCreateClient";

const texts = {
  brand: "Brand",
  cardTitlePrefix: "Title",
  cardDescription: "Description",
  commentLabel: "Comment",
  commentPlaceholder: "Write",
  ratingsTitle: "Ratings",
  locationLabel: "Location",
  locationHelp: "Help",
  noiseLabel: "Noise",
  noiseHelp: "Help",
  landlordLabel: "Landlord",
  landlordHelp: "Help",
  conditionLabel: "Condition",
  conditionHelp: "Help",
  submit: "Submit",
  submitting: "Submitting",
  hint: "Hint",
};

const messages = {
  notLoggedIn: "Not logged in",
  missingPropertyId: "Missing property",
  unknownError: "Unknown",
};

describe("ReviewCreateClient", () => {
  beforeEach(() => {
    replaceMock.mockReset();
    createReviewActionMock.mockReset();
  });

  function fillRequiredFields() {
    fireEvent.change(screen.getByTestId("ratingLocation"), { target: { value: "4" } });
    fireEvent.change(screen.getByTestId("ratingNoise"), { target: { value: "4" } });
    fireEvent.change(screen.getByTestId("ratingLandlord"), { target: { value: "4" } });
    fireEvent.change(screen.getByTestId("ratingCondition"), { target: { value: "4" } });
    fireEvent.change(screen.getByLabelText("Comment"), { target: { value: "Good place" } });
  }

  it("redirects to property reviews page with submitted=review on success", async () => {
    createReviewActionMock.mockResolvedValueOnce({ reviewId: "r1" });

    render(
      <ReviewCreateClient
        propertyId="property-1"
        address="Street 1"
        texts={texts}
        messages={messages}
      />,
    );

    fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(createReviewActionMock).toHaveBeenCalledTimes(1);
      expect(replaceMock).toHaveBeenCalledWith("/properties/property-1/reviews?submitted=review");
    });
  });

  it("shows error and does not redirect when action fails", async () => {
    createReviewActionMock.mockResolvedValueOnce({ error: "Server error" });

    render(
      <ReviewCreateClient
        propertyId="property-1"
        address="Street 1"
        texts={texts}
        messages={messages}
      />,
    );

    fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByText("Server error")).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
