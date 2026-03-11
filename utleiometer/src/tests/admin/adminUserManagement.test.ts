import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Firebase admin before importing functions
vi.mock("@/lib/firebase/admin", () => ({
  adminAuth: {
    verifyIdToken: vi.fn(),
    getUser: vi.fn(),
    listUsers: vi.fn(),
    setCustomUserClaims: vi.fn(),
    deleteUser: vi.fn(),
  },
}));

import {
  listUsers,
  setAdminClaim,
  removeAdminClaim,
  deleteUserAsAdmin,
} from "@/app/actions/admin";
import { adminAuth } from "@/lib/firebase/admin";

const mockAdminToken = "admin-token";
const mockNonAdminToken = "non-admin-token";

function setupAdminVerify() {
  vi.mocked(adminAuth.verifyIdToken).mockImplementation(async (token) => {
    if (token === mockAdminToken) return { uid: "admin-uid", admin: true } as any;
    return { uid: "user-uid", admin: false } as any;
  });
}

describe("listUsers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupAdminVerify();
  });

  it("should return list of users for admin", async () => {
    vi.mocked(adminAuth.listUsers).mockResolvedValue({
      users: [
        { uid: "u1", email: "a@test.com", displayName: "Alice", customClaims: { admin: true } },
        { uid: "u2", email: "b@test.com", displayName: "Bob", customClaims: {} },
      ],
    } as any);

    const result = await listUsers(mockAdminToken);

    expect(result.users).toHaveLength(2);
    expect(result.users?.[0]).toMatchObject({ uid: "u1", isAdmin: true });
    expect(result.users?.[1]).toMatchObject({ uid: "u2", isAdmin: false });
    expect(result.error).toBeUndefined();
  });

  it("should deny non-admin user", async () => {
    const result = await listUsers(mockNonAdminToken);
    expect(result.error).toContain("Unauthorized");
    expect(result.users).toBeUndefined();
  });

  it("should handle Firebase error gracefully", async () => {
    vi.mocked(adminAuth.listUsers).mockRejectedValue(new Error("Firebase error"));
    const result = await listUsers(mockAdminToken);
    expect(result.error).toBe("Firebase error");
  });
});

describe("setAdminClaim", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupAdminVerify();
    vi.mocked(adminAuth.getUser).mockResolvedValue({ uid: "target-uid" } as any);
    vi.mocked(adminAuth.setCustomUserClaims).mockResolvedValue();
  });

  it("should grant admin claim when caller is admin", async () => {
    const result = await setAdminClaim("target-uid", mockAdminToken);
    expect(result.success).toBe(true);
    expect(adminAuth.setCustomUserClaims).toHaveBeenCalledWith("target-uid", { admin: true });
  });

  it("should deny non-admin caller", async () => {
    const result = await setAdminClaim("target-uid", mockNonAdminToken);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Unauthorized");
    expect(adminAuth.setCustomUserClaims).not.toHaveBeenCalled();
  });
});

describe("removeAdminClaim", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupAdminVerify();
    vi.mocked(adminAuth.setCustomUserClaims).mockResolvedValue();
  });

  it("should remove admin claim when caller is admin", async () => {
    const result = await removeAdminClaim("target-uid", mockAdminToken);
    expect(result.success).toBe(true);
    expect(adminAuth.setCustomUserClaims).toHaveBeenCalledWith("target-uid", { admin: false });
  });

  it("should deny non-admin caller", async () => {
    const result = await removeAdminClaim("target-uid", mockNonAdminToken);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Unauthorized");
  });
});

describe("deleteUserAsAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupAdminVerify();
    vi.mocked(adminAuth.deleteUser).mockResolvedValue();
  });

  it("should delete another user when caller is admin", async () => {
    const result = await deleteUserAsAdmin("other-uid", mockAdminToken);
    expect(result.success).toBe(true);
    expect(adminAuth.deleteUser).toHaveBeenCalledWith("other-uid");
  });

  it("should prevent admin from deleting their own account", async () => {
    const result = await deleteUserAsAdmin("admin-uid", mockAdminToken);
    expect(result.success).toBe(false);
    expect(result.error).toContain("own account");
    expect(adminAuth.deleteUser).not.toHaveBeenCalled();
  });

  it("should deny non-admin caller", async () => {
    const result = await deleteUserAsAdmin("other-uid", mockNonAdminToken);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Unauthorized");
    expect(adminAuth.deleteUser).not.toHaveBeenCalled();
  });

  it("should handle Firebase error gracefully", async () => {
    vi.mocked(adminAuth.deleteUser).mockRejectedValue(new Error("User not found"));
    const result = await deleteUserAsAdmin("other-uid", mockAdminToken);
    expect(result.success).toBe(false);
    expect(result.error).toBe("User not found");
  });
});
