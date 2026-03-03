import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Firebase admin før import av deleteUserData
vi.mock("@/lib/firebase/admin", () => {
  return {
    adminDb: {
      collection: vi.fn(),
    },
    FieldValue: {
      increment: vi.fn((n: number) => `increment(${n})`),
    },
  };
});

import { deleteUserData } from "@/app/actions/deleteUser";
import { adminDb } from "@/lib/firebase/admin";

describe("deleteUserData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sletter alle brukerens reviews og returnerer success", async () => {
    const mockReviewDocs = [
      {
        id: "review1",
        ref: { delete: vi.fn() },
        data: () => ({ userId: "user123", propertyId: "prop1" }),
      },
      {
        id: "review2",
        ref: { delete: vi.fn() },
        data: () => ({ userId: "user123", propertyId: "prop1" }),
      },
    ];

    const mockPropertyDoc = {
      exists: true,
      data: () => ({ reviewCount: 2 }),
    };

    const mockPropertyRef = {
      get: vi.fn().mockResolvedValue(mockPropertyDoc),
      delete: vi.fn(),
      update: vi.fn(),
    };

    const mockCollection = vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        get: vi.fn().mockResolvedValue({
          docs: mockReviewDocs,
          size: 2,
        }),
      }),
      doc: vi.fn().mockReturnValue(mockPropertyRef),
    });

    vi.mocked(adminDb.collection).mockImplementation(mockCollection as any);

    const result = await deleteUserData("user123");

    expect(result.success).toBe(true);
    expect(result.deletedReviews).toBe(2);
    expect(mockReviewDocs[0].ref.delete).toHaveBeenCalled();
    expect(mockReviewDocs[1].ref.delete).toHaveBeenCalled();
  });

  it("sletter property når reviewCount blir 0", async () => {
    const mockReviewDocs = [
      {
        id: "review1",
        ref: { delete: vi.fn() },
        data: () => ({ userId: "user123", propertyId: "prop1" }),
      },
    ];

    const mockPropertyDoc = {
      exists: true,
      data: () => ({ reviewCount: 1 }),
    };

    const mockPropertyRef = {
      get: vi.fn().mockResolvedValue(mockPropertyDoc),
      delete: vi.fn(),
      update: vi.fn(),
    };

    const mockCollection = vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        get: vi.fn().mockResolvedValue({
          docs: mockReviewDocs,
          size: 1,
        }),
      }),
      doc: vi.fn().mockReturnValue(mockPropertyRef),
    });

    vi.mocked(adminDb.collection).mockImplementation(mockCollection as any);

    await deleteUserData("user123");

    expect(mockPropertyRef.delete).toHaveBeenCalled();
    expect(mockPropertyRef.update).not.toHaveBeenCalled();
  });

  it("oppdaterer reviewCount når property har flere reviews", async () => {
    const mockReviewDocs = [
      {
        id: "review1",
        ref: { delete: vi.fn() },
        data: () => ({ userId: "user123", propertyId: "prop1" }),
      },
    ];

    const mockPropertyDoc = {
      exists: true,
      data: () => ({ reviewCount: 5 }),
    };

    const mockPropertyRef = {
      get: vi.fn().mockResolvedValue(mockPropertyDoc),
      delete: vi.fn(),
      update: vi.fn(),
    };

    const mockCollection = vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        get: vi.fn().mockResolvedValue({
          docs: mockReviewDocs,
          size: 1,
        }),
      }),
      doc: vi.fn().mockReturnValue(mockPropertyRef),
    });

    vi.mocked(adminDb.collection).mockImplementation(mockCollection as any);

    await deleteUserData("user123");

    expect(mockPropertyRef.update).toHaveBeenCalledWith({
      reviewCount: "increment(-1)",
    });
    expect(mockPropertyRef.delete).not.toHaveBeenCalled();
  });

  it("håndterer flere reviews på samme property", async () => {
    const mockReviewDocs = [
      {
        id: "review1",
        ref: { delete: vi.fn() },
        data: () => ({ userId: "user123", propertyId: "prop1" }),
      },
      {
        id: "review2",
        ref: { delete: vi.fn() },
        data: () => ({ userId: "user123", propertyId: "prop1" }),
      },
      {
        id: "review3",
        ref: { delete: vi.fn() },
        data: () => ({ userId: "user123", propertyId: "prop1" }),
      },
    ];

    const mockPropertyDoc = {
      exists: true,
      data: () => ({ reviewCount: 5 }),
    };

    const mockPropertyRef = {
      get: vi.fn().mockResolvedValue(mockPropertyDoc),
      delete: vi.fn(),
      update: vi.fn(),
    };

    const mockCollection = vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        get: vi.fn().mockResolvedValue({
          docs: mockReviewDocs,
          size: 3,
        }),
      }),
      doc: vi.fn().mockReturnValue(mockPropertyRef),
    });

    vi.mocked(adminDb.collection).mockImplementation(mockCollection as any);

    await deleteUserData("user123");

    // Skal trekke fra 3 reviews fra total count
    expect(mockPropertyRef.update).toHaveBeenCalledWith({
      reviewCount: "increment(-3)",
    });
    expect(mockPropertyRef.delete).not.toHaveBeenCalled();
  });

  it("håndterer bruker uten reviews", async () => {
    const mockCollection = vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        get: vi.fn().mockResolvedValue({
          docs: [],
          size: 0,
        }),
      }),
    });

    vi.mocked(adminDb.collection).mockImplementation(mockCollection as any);

    const result = await deleteUserData("user123");

    expect(result.success).toBe(true);
    expect(result.deletedReviews).toBe(0);
  });

  it("håndterer reviews på forskjellige properties", async () => {
    const mockReviewDocs = [
      {
        id: "review1",
        ref: { delete: vi.fn() },
        data: () => ({ userId: "user123", propertyId: "prop1" }),
      },
      {
        id: "review2",
        ref: { delete: vi.fn() },
        data: () => ({ userId: "user123", propertyId: "prop2" }),
      },
    ];

    const mockPropertyDoc1 = {
      exists: true,
      data: () => ({ reviewCount: 1 }),
    };

    const mockPropertyDoc2 = {
      exists: true,
      data: () => ({ reviewCount: 3 }),
    };

    const mockPropertyRef1 = {
      get: vi.fn().mockResolvedValue(mockPropertyDoc1),
      delete: vi.fn(),
      update: vi.fn(),
    };

    const mockPropertyRef2 = {
      get: vi.fn().mockResolvedValue(mockPropertyDoc2),
      delete: vi.fn(),
      update: vi.fn(),
    };

    const mockDocFn = vi.fn((propertyId: string) => {
      return propertyId === "prop1" ? mockPropertyRef1 : mockPropertyRef2;
    });

    const mockCollection = vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        get: vi.fn().mockResolvedValue({
          docs: mockReviewDocs,
          size: 2,
        }),
      }),
      doc: mockDocFn,
    });

    vi.mocked(adminDb.collection).mockImplementation(mockCollection as any);

    await deleteUserData("user123");

    // prop1 skal slettes (1 review -> 0)
    expect(mockPropertyRef1.delete).toHaveBeenCalled();
    expect(mockPropertyRef1.update).not.toHaveBeenCalled();

    // prop2 skal oppdateres (3 reviews -> 2)
    expect(mockPropertyRef2.update).toHaveBeenCalledWith({
      reviewCount: "increment(-1)",
    });
    expect(mockPropertyRef2.delete).not.toHaveBeenCalled();
  });

  it("kaster feil ved database-problemer", async () => {
    const mockCollection = vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        get: vi.fn().mockRejectedValue(new Error("Database error")),
      }),
    });

    vi.mocked(adminDb.collection).mockImplementation(mockCollection as any);

    await expect(deleteUserData("user123")).rejects.toThrow(
      "Kunne ikke slette brukerdata"
    );
  });

  it("håndterer property som ikke eksisterer lenger", async () => {
    const mockReviewDocs = [
      {
        id: "review1",
        ref: { delete: vi.fn() },
        data: () => ({ userId: "user123", propertyId: "prop1" }),
      },
    ];

    const mockPropertyDoc = {
      exists: false,
      data: () => null,
    };

    const mockPropertyRef = {
      get: vi.fn().mockResolvedValue(mockPropertyDoc),
      delete: vi.fn(),
      update: vi.fn(),
    };

    const mockCollection = vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        get: vi.fn().mockResolvedValue({
          docs: mockReviewDocs,
          size: 1,
        }),
      }),
      doc: vi.fn().mockReturnValue(mockPropertyRef),
    });

    vi.mocked(adminDb.collection).mockImplementation(mockCollection as any);

    const result = await deleteUserData("user123");

    expect(result.success).toBe(true);
    expect(mockReviewDocs[0].ref.delete).toHaveBeenCalled();
    // Skal ikke prøve å oppdatere/slette property som ikke eksisterer
    expect(mockPropertyRef.delete).not.toHaveBeenCalled();
    expect(mockPropertyRef.update).not.toHaveBeenCalled();
  });
});
