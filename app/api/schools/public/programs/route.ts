import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb();
    const schoolSlug = request.headers.get('x-school-slug');
    
    console.log('Public programs API called:', {
      schoolSlug,
      hostname: request.headers.get('host'),
      pathname: request.nextUrl.pathname
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

    const universityId = universitiesSnapshot.docs[0].id;

    const programsSnapshot = await db.collection("programs")
      .where("universityId", "==", universityId)
      .get();

    const programs = programsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        degree: data.degree,
        field: data.field,
        description: data.description,
        duration: data.duration,
        tuition: data.tuition,
        applicationFee: data.applicationFee,
        deadline: data.deadline,
        startDate: data.startDate,
        requirements: data.requirements,
      };
    });

    return NextResponse.json({ programs });
  } catch (error) {
    console.error("Error fetching programs:", error);
    return NextResponse.json({ error: "Failed to fetch programs" }, { status: 500 });
  }
}
