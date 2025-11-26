import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server-auth";
import { getSubdomain } from "@/lib/utils/subdomain";
import { db } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/redirect
 * Get the appropriate redirect URL based on user role and context
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser();

    if (!user) {
      return NextResponse.json({ redirectUrl: "/auth/signin" });
    }

    // Redirect based on role
    let redirectUrl = "/dashboard"; // Default for APPLICANT

    if (user.role === "ADMIN") {
      redirectUrl = "/admin";
    } else if (user.role === "SCHOOL_ADMIN") {
      // Check if accessing from a school subdomain
      const hostname = request.headers.get("host") || "";
      const subdomain = getSubdomain(hostname);
      
      if (subdomain && subdomain !== 'admin') {
        // On school subdomain - redirect to that school's dashboard
        redirectUrl = "/dashboard";
      } else {
        // On main domain - check how many schools user has access to
        const universitiesSnapshot = await db
          .collection("universities")
          .where("adminUids", "array-contains", user.uid)
          .get();
        
        if (universitiesSnapshot.empty) {
          // No schools - shouldn't happen but redirect to selector anyway
          redirectUrl = "/schools/selector";
        } else if (universitiesSnapshot.size === 1) {
          // Exactly one school - redirect to that school's subdomain
          const university = universitiesSnapshot.docs[0].data();
          const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'campushaiti.org';
          redirectUrl = `https://${university.slug}.${rootDomain}/dashboard`;
        } else {
          // Multiple schools - show selector on main domain
          redirectUrl = "/schools/selector";
        }
      }
    }

    return NextResponse.json({ redirectUrl });
  } catch (error) {
    console.error("Error determining redirect:", error);
    return NextResponse.json({ redirectUrl: "/dashboard" });
  }
}
