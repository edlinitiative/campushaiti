import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebase/admin";
import { UserRole } from "@/lib/types/firestore";

export interface ServerUser {
  uid: string;
  email: string | null;
  role: UserRole;
  customClaims: Record<string, any>;
}

/**
 * Get the currently authenticated user from the server-side
 * Verifies the Firebase ID token from the session cookie
 */
export async function getServerUser(): Promise<ServerUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) {
      console.log("[getServerUser] No session cookie found");
      return null;
    }

    console.log("[getServerUser] Verifying session cookie");
    
    // Verify the session cookie
    const adminAuth = getAdminAuth();
    
    // Check if adminAuth is properly initialized
    if (!adminAuth || typeof adminAuth.verifySessionCookie !== 'function') {
      console.error("[getServerUser] Firebase Admin Auth not properly initialized:", {
        hasAuth: !!adminAuth,
        hasMethod: adminAuth ? typeof adminAuth.verifySessionCookie : 'N/A'
      });
      return null;
    }
    
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);

    console.log("[getServerUser] Session verified successfully for user:", decodedClaims.uid);

    return {
      uid: decodedClaims.uid,
      email: decodedClaims.email ?? null,
      role: (decodedClaims.role as UserRole) || "APPLICANT",
      customClaims: decodedClaims,
    };
  } catch (error) {
    console.error("[getServerUser] Error verifying session:", error);
    return null;
  }
}

/**
 * Require that the current user has one of the specified roles
 * Throws an error if the user is not authenticated or doesn't have the required role
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<ServerUser> {
  const user = await getServerUser();

  if (!user) {
    throw new Error("Unauthorized: No valid session");
  }

  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Forbidden: Required role(s): ${allowedRoles.join(", ")}`);
  }

  return user;
}

/**
 * Set custom claims for a user (for RBAC)
 * Should only be called by admin endpoints
 */
export async function setUserRole(uid: string, role: UserRole): Promise<void> {
  const adminAuth = getAdminAuth();
  await adminAuth.setCustomUserClaims(uid, { role });
}

/**
 * Create a session cookie from an ID token
 * Used after successful authentication
 */
export async function createSessionCookie(idToken: string, expiresIn: number = 60 * 60 * 24 * 5 * 1000): Promise<string> {
  const adminAuth = getAdminAuth();
  return await adminAuth.createSessionCookie(idToken, { expiresIn });
}

/**
 * Revoke all refresh tokens for a user (force logout)
 */
export async function revokeUserSessions(uid: string): Promise<void> {
  const adminAuth = getAdminAuth();
  await adminAuth.revokeRefreshTokens(uid);
}

