import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

// Temporary endpoint to fix university access
// DELETE THIS FILE after running once
export async function GET() {
  try {
    const db = getAdminDb();
    const USER_UID = "2BfbxE4d17SQoAKcRylhjCsscO52"; // info@edlight.org
    const UNIVERSITY_SLUGS = ["uc", "ueh", "uniq", "uneph"];
    
    const results = [];

    for (const slug of UNIVERSITY_SLUGS) {
      const universitiesSnapshot = await db
        .collection("universities")
        .where("slug", "==", slug)
        .limit(1)
        .get();

      if (universitiesSnapshot.empty) {
        results.push({ slug, status: "not_found" });
        continue;
      }

      const universityDoc = universitiesSnapshot.docs[0];
      const universityData = universityDoc.data();
      const adminUids = universityData.adminUids || [];

      if (adminUids.includes(USER_UID)) {
        results.push({ 
          slug, 
          name: universityData.name,
          status: "already_has_access",
          adminUids 
        });
        continue;
      }

      const updatedAdminUids = [...adminUids, USER_UID];
      await universityDoc.ref.update({
        adminUids: updatedAdminUids,
      });

      results.push({ 
        slug, 
        name: universityData.name,
        status: "access_granted",
        oldAdminUids: adminUids,
        newAdminUids: updatedAdminUids
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "University access fixed",
      results 
    });
  } catch (error: any) {
    console.error("Error fixing university access:", error);
    return NextResponse.json({ 
      error: "Failed to fix university access",
      details: error.message 
    }, { status: 500 });
  }
}
