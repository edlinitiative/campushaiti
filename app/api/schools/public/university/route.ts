import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb();
    const schoolSlug = request.headers.get('x-school-slug');
    
    console.log('Public university API called:', {
      schoolSlug,
      hostname: request.headers.get('host'),
      pathname: request.nextUrl.pathname,
      allHeaders: Object.fromEntries(request.headers.entries())
    });
    
    if (!schoolSlug) {
      return NextResponse.json({ error: "No school subdomain detected" }, { status: 400 });
    }

    const universitiesSnapshot = await db.collection("universities")
      .where("slug", "==", schoolSlug)
      .limit(1)
      .get();

    if (universitiesSnapshot.empty) {
      return NextResponse.json({ error: "University not found" }, { status: 404 });
    }

    const universityDoc = universitiesSnapshot.docs[0];
    const universityData = universityDoc.data();

    const university = {
      id: universityDoc.id,
      name: universityData.name,
      slug: universityData.slug,
      description: universityData.description,
      city: universityData.city,
      department: universityData.department,
      country: universityData.country,
      website: universityData.website,
      email: universityData.email,
      phone: universityData.phone,
      logo: universityData.logo,
      coverImage: universityData.coverImage,
      address: universityData.address,
    };

    return NextResponse.json({ university });
  } catch (error) {
    console.error("Error fetching university:", error);
    return NextResponse.json({ error: "Failed to fetch university data" }, { status: 500 });
  }
}
