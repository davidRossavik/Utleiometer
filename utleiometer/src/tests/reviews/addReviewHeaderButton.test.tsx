import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { AddReviewHeaderButton } from "@/features/reviews/componentes/AddReviewHeaderButton";

const authState = {
  currentUser: { uid: "user-1" },
  loading: false,
};

vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => authState,
}));

describe("AddReviewHeaderButton", () => {
  it("shows button for logged in users", () => {
    authState.currentUser = { uid: "user-1" };
    authState.loading = false;

    render(<AddReviewHeaderButton label="Legg til anmeldelse" />);

    const link = screen.getByRole("link", { name: "Legg til anmeldelse" });
    expect(link).toHaveAttribute("href", "/properties/new");
  });

  it("hides button for logged out users", () => {
    authState.currentUser = null as any;
    authState.loading = false;

    render(<AddReviewHeaderButton label="Legg til anmeldelse" />);

    expect(screen.queryByRole("link", { name: "Legg til anmeldelse" })).not.toBeInTheDocument();
  });
});
