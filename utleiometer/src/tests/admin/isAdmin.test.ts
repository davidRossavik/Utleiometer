import { describe, it, expect, vi, beforeEach } from "vitest";
import { isAdmin, refreshUserToken, getIdToken } from "@/lib/auth";
import { User } from "firebase/auth";

describe("isAdmin - Authorization Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return false when user is null", async () => {
    const result = await isAdmin(null);
    expect(result).toBe(false);
  });

  it("should return true when user has admin claim set to true", async () => {
    const mockUser = {
      getIdTokenResult: vi.fn().mockResolvedValue({
        claims: { admin: true }
      })
    } as unknown as User;

    const result = await isAdmin(mockUser);
    expect(result).toBe(true);
    expect(mockUser.getIdTokenResult).toHaveBeenCalledTimes(1);
  });

  it("should return false when user has admin claim set to false", async () => {
    const mockUser = {
      getIdTokenResult: vi.fn().mockResolvedValue({
        claims: { admin: false }
      })
    } as unknown as User;

    const result = await isAdmin(mockUser);
    expect(result).toBe(false);
  });

  it("should return false when user has no admin claim", async () => {
    const mockUser = {
      getIdTokenResult: vi.fn().mockResolvedValue({
        claims: {}
      })
    } as unknown as User;

    const result = await isAdmin(mockUser);
    expect(result).toBe(false);
  });

  it("should return false when getIdTokenResult throws an error", async () => {
    const mockUser = {
      getIdTokenResult: vi.fn().mockRejectedValue(new Error("Token error"))
    } as unknown as User;

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await isAdmin(mockUser);
    expect(result).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error checking admin status:", expect.any(Error));
    
    consoleErrorSpy.mockRestore();
  });

  it("should return false for unauthenticated users (null)", async () => {
    const result = await isAdmin(null);
    expect(result).toBe(false);
  });
});

describe("refreshUserToken", () => {
  it("should call getIdToken with force refresh flag", async () => {
    const mockUser = {
      getIdToken: vi.fn().mockResolvedValue("new-token")
    } as unknown as User;

    await refreshUserToken(mockUser);
    expect(mockUser.getIdToken).toHaveBeenCalledWith(true);
  });

  it("should handle null user gracefully", async () => {
    await expect(refreshUserToken(null)).resolves.not.toThrow();
  });

  it("should handle token refresh errors", async () => {
    const mockUser = {
      getIdToken: vi.fn().mockRejectedValue(new Error("Refresh failed"))
    } as unknown as User;

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await refreshUserToken(mockUser);
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error refreshing token:", expect.any(Error));
    
    consoleErrorSpy.mockRestore();
  });
});

describe("getIdToken", () => {
  it("should return null when user is null", async () => {
    const result = await getIdToken(null);
    expect(result).toBeNull();
  });

  it("should return the ID token for authenticated user", async () => {
    const mockToken = "mock-id-token-12345";
    const mockUser = {
      getIdToken: vi.fn().mockResolvedValue(mockToken)
    } as unknown as User;

    const result = await getIdToken(mockUser);
    expect(result).toBe(mockToken);
    expect(mockUser.getIdToken).toHaveBeenCalledTimes(1);
  });

  it("should return null when getIdToken throws an error", async () => {
    const mockUser = {
      getIdToken: vi.fn().mockRejectedValue(new Error("Token retrieval failed"))
    } as unknown as User;

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await getIdToken(mockUser);
    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error getting ID token:", expect.any(Error));
    
    consoleErrorSpy.mockRestore();
  });
});
