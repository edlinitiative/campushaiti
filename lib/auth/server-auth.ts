import { cookies } from "next/headers";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { UserRole } from "@/lib/types/firestore";

export interface ServerUser {
  uid: string;
  email: string | null;
  role: UserRole;
  customClaims: Record<string, any>;
  adminAccessLevel?: "VIEWER" | "ADMIN"; // For ADMIN role users
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

    const user: ServerUser = {
      uid: decodedClaims.uid,
      email: decodedClaims.email ?? null,
      role: (decodedClaims.role as UserRole) || "APPLICANT",
      customClaims: decodedClaims,
    };

    // For ADMIN users, check their access level in adminAccess collection
    if (user.role === "ADMIN") {
      try {
        const db = getAdminDb();
        const adminAccessDoc = await db.collection("adminAccess").doc(user.uid).get();
        if (adminAccessDoc.exists) {
          const adminData = adminAccessDoc.data();
          user.adminAccessLevel = adminData?.role || "VIEWER";
        } else {
          // No adminAccess record - default to VIEWER for safety
          user.adminAccessLevel = "VIEWER";
        }
      } catch (error) {
        console.error("[getServerUser] Error fetching admin access level:", error);
        user.adminAccessLevel = "VIEWER"; // Fail safe to VIEWER
      }
    }

    return user;
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
  try {
    const adminAuth = getAdminAuth();
    
    if (!adminAuth || typeof adminAuth.createSessionCookie !== 'function') {
      console.error("Firebase Admin Auth not initialized properly");
      throw new Error("Firebase Admin not initialized. Please check server configuration.");
    }
    
    console.log("Creating session cookie with expiry:", expiresIn);
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    console.log("Session cookie created successfully");
    return sessionCookie;
  } catch (error: any) {
    console.error("Error in createSessionCookie:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      name: error.name,
    });
    throw error;
  }
}

/**
 * Revoke all refresh tokens for a user (force logout)
 */
export async function revokeUserSessions(uid: string): Promise<void> {
  const adminAuth = getAdminAuth();
  await adminAuth.revokeRefreshTokens(uid);
}

/**
 * Check if user has full ADMIN access (not just VIEWER)
 * Returns true only if user has ADMIN role AND ADMIN access level
 */
export async function hasFullAdminAccess(user: ServerUser | null): Promise<boolean> {
  if (!user || user.role !== "ADMIN") {
    return false;
  }
  
  // Check adminAccessLevel if already loaded
  if (user.adminAccessLevel) {
    return user.adminAccessLevel === "ADMIN";
  }
  
  // Otherwise, query the database
  try {
    const db = getAdminDb();
    const adminAccessDoc = await db.collection("adminAccess").doc(user.uid).get();
    if (adminAccessDoc.exists) {
      const adminData = adminAccessDoc.data();
      return adminData?.role === "ADMIN";
    }
    return false; // No access record = no full admin access
  } catch (error) {
    console.error("Error checking admin access:", error);
    return false;
  }
}

/**
 * Require full ADMIN access (not just VIEWER)
 * Throws an error if user doesn't have full admin permissions
 */
export async function requireFullAdminAccess(): Promise<ServerUser> {
  const user = await getServerUser();
  
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }
  
  const hasFullAccess = await hasFullAdminAccess(user);
  
  if (!hasFullAccess) {
    throw new Error("Forbidden: Full admin access required. You have viewer access only.");
  }
  
  return user;
}

