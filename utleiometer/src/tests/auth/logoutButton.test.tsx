import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { waitFor } from "@testing-library/react";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const signOutMock = vi.fn();
vi.mock("firebase/auth", () => ({
  signOut: (...args: any[]) => signOutMock(...args),
}));

vi.mock("@/lib/firebase/client", () => ({
  auth: { _mock: true },
}));

import { LogoutButton } from "@/features/auth/client-components/logoutButton"; // juster path

describe("LogoutButton", () => {
  beforeEach(() => {
    signOutMock.mockReset();
    pushMock.mockReset();
  });

  it("viser feilmelding hvis signOut feiler", async () => {
    signOutMock.mockRejectedValueOnce(new Error("fail"));

    render(<LogoutButton />);

    fireEvent.click(screen.getByRole("button", { name: /logg ut/i }));

    // Vent til feilmeldingen faktisk er rendret
    expect(
      await screen.findByText("Kunne ikke logge ut. Prøv igjen.")
    ).toBeInTheDocument();

    // Og gjerne verifiser at knappen ikke er stuck i loading
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /logg ut/i })).toBeEnabled();
    });
  });
});
