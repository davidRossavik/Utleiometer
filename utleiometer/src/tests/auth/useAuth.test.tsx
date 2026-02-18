import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// Generert av ChatGPT

// 1) Mock module - IKKE bruk top-level variabler inni factory
vi.mock("@/lib/firebase/client", () => {
  return {
    auth: {
      onAuthStateChanged: vi.fn(),
    },
  };
});

// 2) Importer hook etter mock
import { useAuth } from "@/features/auth/hooks/useAuth";

// 3) Hent mocken ut fra modulen
import { auth } from "@/lib/firebase/client";

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starter med loading=true og ender med loading=false + currentUser når onAuthStateChanged fyrer", () => {
    const unsubscribe = vi.fn();

    // Sett implementasjon på mocken
    const onAuthStateChangedMock = vi.mocked(auth.onAuthStateChanged);
    onAuthStateChangedMock.mockImplementation((cb: (user: any) => void) => {
      // trigges manuelt i testen
      (onAuthStateChangedMock as any)._cb = cb;
      return unsubscribe;
    });

    const { result, unmount } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(true);
    expect(result.current.currentUser).toBe(null);

    const fakeUser = { uid: "abc", email: "test@test.no" };
    act(() => {
      (onAuthStateChangedMock as any)._cb(fakeUser);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.currentUser).toEqual(fakeUser);

    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("setter currentUser=null når brukeren er utlogget", () => {
    const onAuthStateChangedMock = vi.mocked(auth.onAuthStateChanged);
    onAuthStateChangedMock.mockImplementation((cb: (user: any) => void) => {
      (onAuthStateChangedMock as any)._cb = cb;
      return vi.fn();
    });

    const { result } = renderHook(() => useAuth());

    act(() => {
      (onAuthStateChangedMock as any)._cb(null);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.currentUser).toBe(null);
  });
});
