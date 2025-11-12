import { describe, it, expect, vi } from "vitest";

// Mock Firebase Admin SDK
vi.mock("@/lib/firebase/admin", () => ({
  adminAuth: {
    verifySessionCookie: vi.fn(),
    setCustomUserClaims: vi.fn(),
    createSessionCookie: vi.fn(),
    revokeRefreshTokens: vi.fn(),
  },
  adminDb: {},
  adminStorage: {},
}));

// Mock Next.js cookies
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve({
    get: vi.fn(() => ({ value: "mock_session_cookie" })),
  })),
}));

describe("Server Auth Helpers", () => {
  describe("getServerUser", () => {
    it("should return null when no session cookie exists", async () => {
      const { cookies } = await import("next/headers");
      const mockCookies = await cookies();
      (mockCookies.get as any).mockReturnValueOnce(undefined);

      const { getServerUser } = await import("@/lib/auth/server-auth");
      const user = await getServerUser();

      expect(user).toBeNull();
    });

    it("should return user data when session is valid", async () => {
      const { adminAuth } = await import("@/lib/firebase/admin");
      (adminAuth.verifySessionCookie as any).mockResolvedValueOnce({
        uid: "test_uid",
        email: "test@example.com",
        role: "APPLICANT",
      });

      const { getServerUser } = await import("@/lib/auth/server-auth");
      const user = await getServerUser();

      expect(user).not.toBeNull();
      expect(user?.uid).toBe("test_uid");
      expect(user?.role).toBe("APPLICANT");
    });
  });

  describe("requireRole", () => {
    it("should throw error when user is not authenticated", async () => {
      const { cookies } = await import("next/headers");
      const mockCookies = await cookies();
      (mockCookies.get as any).mockReturnValueOnce(undefined);

      const { requireRole } = await import("@/lib/auth/server-auth");

      await expect(requireRole(["ADMIN"])).rejects.toThrow("Unauthorized");
    });

    it("should allow access when user has required role", async () => {
      const { adminAuth } = await import("@/lib/firebase/admin");
      (adminAuth.verifySessionCookie as any).mockResolvedValueOnce({
        uid: "test_uid",
        email: "admin@example.com",
        role: "ADMIN",
      });

      const { requireRole } = await import("@/lib/auth/server-auth");
      const user = await requireRole(["ADMIN"]);

      expect(user).not.toBeNull();
      expect(user.role).toBe("ADMIN");
    });

    it("should deny access when user lacks required role", async () => {
      const { adminAuth } = await import("@/lib/firebase/admin");
      (adminAuth.verifySessionCookie as any).mockResolvedValueOnce({
        uid: "test_uid",
        email: "user@example.com",
        role: "APPLICANT",
      });

      const { requireRole } = await import("@/lib/auth/server-auth");

      await expect(requireRole(["ADMIN"])).rejects.toThrow("Forbidden");
    });
  });
});
