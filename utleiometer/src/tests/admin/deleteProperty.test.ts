import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Firebase Admin SDK - must use factory function pattern
vi.mock("@/lib/firebase/admin", () => ({
  adminDb: {
    collection: vi.fn(),
    batch: vi.fn(),
  },
  adminAuth: {
    verifyIdToken: vi.fn(),
  },
  FieldValue: {
    increment: vi.fn((n: number) => n),
  },
}));

// Import after mocks
import { deleteProperty } from "@/lib/firebase/properties";
import { deleteReviewsByPropertyId } from "@/lib/firebase/reviews";
import { deletePropertyAction } from "@/app/[locale]/actions/properties";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

describe("deleteProperty - Backend Deletion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete property and all related reviews", async () => {
    const propertyId = "test-property-123";
    
    const mockDelete = vi.fn().mockResolvedValue(undefined);
    const mockGet = vi.fn().mockResolvedValue({
      exists: true,
      data: () => ({ address: "Test St 1", city: "Oslo" }),
    });
    const mockDoc = vi.fn(() => ({
      get: mockGet,
      delete: mockDelete,
    }));

    const mockCommit = vi.fn().mockResolvedValue(undefined);
    const mockBatchDelete = vi.fn();
    const mockBatchInstance = {
      delete: mockBatchDelete,
      commit: mockCommit,
    };

    vi.mocked(adminDb.collection).mockImplementation((collectionName: string) => {
      if (collectionName === "properties") {
        return { doc: mockDoc } as any;
      }
      if (collectionName === "reviews") {
        return {
          where: vi.fn().mockReturnValue({
            get: vi.fn().mockResolvedValue({
              docs: [
                { id: "review-1", ref: "ref-1" },
                { id: "review-2", ref: "ref-2" },
                { id: "review-3", ref: "ref-3" },
              ],
            }),
          }),
        } as any;
      }
      return {} as any;
    });

    vi.mocked(adminDb.batch).mockReturnValue(mockBatchInstance as any);

    const result = await deleteProperty(propertyId);

    expect(result).toEqual({
      propertyId,
      deletedReviews: 3,
    });
    expect(mockDelete).toHaveBeenCalledTimes(1);
  });

  it("should throw error when property does not exist", async () => {
    const propertyId = "non-existent-property";
    
    const mockGet = vi.fn().mockResolvedValue({
      exists: false,
    });
    const mockDelete = vi.fn();
    const mockDoc = vi.fn(() => ({
      get: mockGet,
      delete: mockDelete,
    }));

    vi.mocked(adminDb.collection).mockReturnValue({ doc: mockDoc } as any);

    await expect(deleteProperty(propertyId)).rejects.toThrow("Property not found");
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("should handle property with no reviews", async () => {
    const propertyId = "property-no-reviews";
    
    const mockDelete = vi.fn().mockResolvedValue(undefined);
    const mockGet = vi.fn().mockResolvedValue({
      exists: true,
      data: () => ({ address: "Empty St 5" }),
    });
    const mockDoc = vi.fn(() => ({
      get: mockGet,
      delete: mockDelete,
    }));

    const mockCommit = vi.fn().mockResolvedValue(undefined);
    const mockBatchInstance = {
      delete: vi.fn(),
      commit: mockCommit,
    };

    vi.mocked(adminDb.collection).mockImplementation((collectionName: string) => {
      if (collectionName === "properties") {
        return { doc: mockDoc } as any;
      }
      if (collectionName === "reviews") {
        return {
          where: vi.fn().mockReturnValue({
            get: vi.fn().mockResolvedValue({
              docs: [], // No reviews
            }),
          }),
        } as any;
      }
      return {} as any;
    });

    vi.mocked(adminDb.batch).mockReturnValue(mockBatchInstance as any);

    const result = await deleteProperty(propertyId);

    expect(result).toEqual({
      propertyId,
      deletedReviews: 0,
    });
    expect(mockDelete).toHaveBeenCalledTimes(1);
  });
});

describe("deleteReviewsByPropertyId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete all reviews for a property using batch", async () => {
    const propertyId = "test-property-456";
    
    const mockReviewDocs = [
      { id: "review-1", ref: "ref-1" },
      { id: "review-2", ref: "ref-2" },
      { id: "review-3", ref: "ref-3" },
    ];

    vi.mocked(adminDb.collection).mockReturnValue({
      where: vi.fn().mockReturnValue({
        get: vi.fn().mockResolvedValue({
          docs: mockReviewDocs,
        }),
      }),
    } as any);

    const mockCommit = vi.fn().mockResolvedValue(undefined);
    const mockBatchDelete = vi.fn();
    vi.mocked(adminDb.batch).mockReturnValue({
      delete: mockBatchDelete,
      commit: mockCommit,
    } as any);

    const result = await deleteReviewsByPropertyId(propertyId);

    expect(result.deletedCount).toBe(3);
    expect(mockBatchDelete).toHaveBeenCalledTimes(3);
    expect(mockCommit).toHaveBeenCalledTimes(1);
  });

  it("should handle property with no reviews", async () => {
    const propertyId = "property-no-reviews";
    
    vi.mocked(adminDb.collection).mockReturnValue({
      where: vi.fn().mockReturnValue({
        get: vi.fn().mockResolvedValue({
          docs: [],
        }),
      }),
    } as any);

    const mockCommit = vi.fn().mockResolvedValue(undefined);
    vi.mocked(adminDb.batch).mockReturnValue({
      delete: vi.fn(),
      commit: mockCommit,
    } as any);

    const result = await deleteReviewsByPropertyId(propertyId);

    expect(result.deletedCount).toBe(0);
    expect(mockCommit).toHaveBeenCalledTimes(1);
  });
});

describe("deletePropertyAction - Server Action Authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should allow admin to delete property", async () => {
    const propertyId = "admin-delete-property";
    const adminToken = "valid-admin-token";

    // Mock admin verification
    vi.mocked(adminAuth.verifyIdToken).mockResolvedValue({
      admin: true,
      uid: "admin-user-123",
    } as any);

    // Mock property deletion
    const mockDelete = vi.fn().mockResolvedValue(undefined);
    const mockGet = vi.fn().mockResolvedValue({
      exists: true,
      data: () => ({ address: "Delete Me St 1" }),
    });
    const mockDoc = vi.fn(() => ({
      get: mockGet,
      delete: mockDelete,
    }));

    const mockCommit = vi.fn().mockResolvedValue(undefined);
    const mockBatchInstance = {
      delete: vi.fn(),
      commit: mockCommit,
    };

    vi.mocked(adminDb.collection).mockImplementation((collectionName: string) => {
      if (collectionName === "properties") {
        return { doc: mockDoc } as any;
      }
      if (collectionName === "reviews") {
        return {
          where: vi.fn().mockReturnValue({
            get: vi.fn().mockResolvedValue({
              docs: [{ id: "review-1", ref: "ref-1" }],
            }),
          }),
        } as any;
      }
      return {} as any;
    });

    vi.mocked(adminDb.batch).mockReturnValue(mockBatchInstance as any);

    const result = await deletePropertyAction(propertyId, adminToken);

    expect(result.success).toBe(true);
    expect(result.deletedReviews).toBe(1);
    expect(adminAuth.verifyIdToken).toHaveBeenCalledWith(adminToken);
  });

  it("should deny non-admin user from deleting property", async () => {
    const propertyId = "protected-property";
    const nonAdminToken = "non-admin-token";

    // Mock non-admin verification
    vi.mocked(adminAuth.verifyIdToken).mockResolvedValue({
      admin: false,
      uid: "regular-user-456",
    } as any);

    const result = await deletePropertyAction(propertyId, nonAdminToken);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized: Only admins can delete properties");
  });

  it("should deny user without admin claim", async () => {
    const propertyId = "protected-property";
    const tokenWithoutClaim = "token-no-claim";

    // Mock token without admin claim
    vi.mocked(adminAuth.verifyIdToken).mockResolvedValue({
      uid: "user-789",
    } as any);

    const result = await deletePropertyAction(propertyId, tokenWithoutClaim);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized: Only admins can delete properties");
  });

  it("should handle invalid token", async () => {
    const propertyId = "any-property";
    const invalidToken = "invalid-token";

    // Mock token verification failure
    vi.mocked(adminAuth.verifyIdToken).mockRejectedValue(new Error("Invalid token"));

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await deletePropertyAction(propertyId, invalidToken);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    
    consoleErrorSpy.mockRestore();
  });
});
