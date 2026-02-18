import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LoginFormUI } from "@/ui/feedback/login-form";

// Generert av ChatGPT

describe("LoginFormUI", () => {
  it("kaller onChange når bruker skriver i email og password", () => {
    const onChange = vi.fn();
    const onBlur = vi.fn();
    const onSubmit = vi.fn((e: any) => e.preventDefault());

    render(
      <LoginFormUI
        email=""
        password=""
        errors={{ email: "", password: "" }}
        touched={{ email: false, password: false }}
        onChange={onChange}
        onBlur={onBlur}
        onSubmit={onSubmit}
        isSubmitting={false}
      />
    );

    const emailInput = screen.getByLabelText("E-post");
    const passwordInput = screen.getByLabelText("Passord");

    fireEvent.change(emailInput, { target: { value: "a@b.no" } });
    fireEvent.change(passwordInput, { target: { value: "passord123" } });

    expect(onChange).toHaveBeenCalledWith("email", "a@b.no");
    expect(onChange).toHaveBeenCalledWith("password", "passord123");
  });

  it("kaller onSubmit når skjema sendes inn", () => {
    const onChange = vi.fn();
    const onBlur = vi.fn();
    const onSubmit = vi.fn((e: any) => e.preventDefault());

    render(
      <LoginFormUI
        email="a@b.no"
        password="passord123"
        errors={{ email: "", password: "" }}
        touched={{ email: false, password: false }}
        onChange={onChange}
        onBlur={onBlur}
        onSubmit={onSubmit}
        isSubmitting={false}
      />
    );

    const button = screen.getByRole("button", { name: /logg inn/i });
    fireEvent.click(button);

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("viser formError når den finnes", () => {
    render(
      <LoginFormUI
        email=""
        password=""
        errors={{ email: "", password: "" }}
        touched={{ email: false, password: false }}
        formError="Feil innlogging"
        onChange={() => {}}
        onBlur={() => {}}
        onSubmit={(e) => e.preventDefault()}
        isSubmitting={false}
      />
    );

    expect(screen.getByText("Feil innlogging")).toBeInTheDocument();
  });
});
