import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { collection } from "@/lib/firebase/database-helpers";
import { School } from "@/lib/types/firestore";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // Get the session token from cookie
    const sessionCookie = request.cookies.get("session")?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify the session
    const decodedClaims = await getAdminAuth().verifySessionCookie(sessionCookie);
    const uid = decodedClaims.uid;

    // Parse request body
    const body = await request.json();
    const {
      name,
      description,
      city,
      country,
      website,
      email,
      phone,
      street,
      state,
      postalCode,
    } = body;

    // Validate required fields
    if (!name || !description || !city || !country || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check if slug already exists
    const existingSchool = await collection("schools")
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (!existingSchool.empty) {
      return NextResponse.json(
        { error: "A school with this name already exists" },
        { status: 409 }
      );
    }

    // Check if user already has a pending/approved school
    const userSchools = await collection("schools")
      .where("adminUids", "array-contains", uid)
      .limit(1)
      .get();

    if (!userSchools.empty) {
      return NextResponse.json(
        { error: "You already have a school registration" },
        { status: 409 }
      );
    }

    // Create school document
    const schoolId = Date.now().toString();
    const schoolRef = collection("schools").doc(schoolId);
    const now = new Date();

    const schoolData: Omit<School, "id"> = {
      name,
      slug,
      description,
      city,
      country,
      website: website || undefined,
      email,
      phone: phone || undefined,
      address: {
        street: street || undefined,
        city,
        state: state || undefined,
        country,
        postalCode: postalCode || undefined,
      },
      status: "PENDING",
      adminUids: [uid],
      settings: {
        acceptsApplications: false,
        requiresPayment: false,
      },
      statistics: {
        totalApplications: 0,
        pendingApplications: 0,
        acceptedApplications: 0,
        rejectedApplications: 0,
      },
      createdAt: now,
      updatedAt: now,
    };

    await schoolRef.set(schoolData);

    // Update user role to SCHOOL_ADMIN
    await getAdminAuth().setCustomUserClaims(uid, { role: "SCHOOL_ADMIN" });

    // Update user document
    await collection("users").doc(uid).update({
      role: "SCHOOL_ADMIN",
      schoolId: schoolId,
      updatedAt: now,
    });

    // Create notification for admins
    const adminsSnapshot = await collection("users")
      .where("role", "==", "ADMIN")
      .get();

    const notificationPromises = adminsSnapshot.docs.map((doc) =>
      collection("notifications").add({
        recipientUid: doc.id,
        type: "SCHOOL_REGISTRATION",
        title: "New School Registration",
        message: `${name} has applied to become a partner school.`,
        read: false,
        metadata: {
          schoolId: schoolId,
          schoolName: name,
        },
        createdAt: now,
      })
    );

    await Promise.all(notificationPromises);

    return NextResponse.json({
      success: true,
      schoolId: schoolId,
    });
  } catch (error) {
    console.error("School registration error:", error);
    return NextResponse.json(
      { error: "Failed to register school" },
      { status: 500 }
    );
  }
}
