import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server-auth";
import { getAdminDb, getAdminAuth } from "@/lib/firebase/admin";
import { sendUniversityApprovedEmail } from "@/lib/email/service";

export const dynamic = "force-dynamic";

interface BulkUniversityData {
  name: string;
  slug?: string;
  city: string;
  country: string;
  email: string;
  phone?: string;
  website?: string;
  description?: string;
  contactPersonName: string;
  contactPersonEmail: string;
}

/**
 * POST /api/admin/universities/bulk-import
 * Bulk import universities from CSV/JSON
 */
export async function POST(request: NextRequest) {
  try {
    const db = getAdminDb();
    const user = await getServerUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { universities, sendEmails = true } = body as {
      universities: BulkUniversityData[];
      sendEmails?: boolean;
    };

    if (!universities || !Array.isArray(universities) || universities.length === 0) {
      return NextResponse.json(
        { error: "Universities array is required" },
        { status: 400 }
      );
    }

    const results: any[] = [];
    const errors: any[] = [];

    for (const uniData of universities) {
      try {
        // Validate required fields
        if (!uniData.name || !uniData.city || !uniData.country || !uniData.email) {
          errors.push({
            university: uniData.name || "Unknown",
            error: "Missing required fields (name, city, country, email)",
          });
          continue;
        }

        // Generate slug if not provided
        const slug = uniData.slug || uniData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

        // Check if slug already exists
        const existingUniversity = await db
          .collection("universities")
          .where("slug", "==", slug)
          .limit(1)
          .get();

        if (!existingUniversity.empty) {
          errors.push({
            university: uniData.name,
            error: `Slug '${slug}' already exists`,
          });
          continue;
        }

        // Create university
        const universityId = `uni_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = Date.now();

        await db.collection("universities").doc(universityId).set({
          name: uniData.name,
          slug,
          city: uniData.city,
          country: uniData.country,
          email: uniData.email,
          phone: uniData.phone || "",
          website: uniData.website || "",
          description: uniData.description || "",
          status: "APPROVED",
          adminUids: [],
          team: {},
          createdAt: now,
          updatedAt: now,
          approvedAt: now,
          approvedBy: user.uid,
        });

        // Create school admin user if contact person email provided
        let schoolAdminUid: string | null = null;
        let tempPassword: string | null = null;

        if (uniData.contactPersonEmail) {
          const contactEmail = uniData.contactPersonEmail;
          const contactName = uniData.contactPersonName || uniData.name;
          
          // Generate temporary password
          tempPassword = `CampusHaiti${Math.random().toString(36).slice(2, 10)}!`;

          try {
            // Check if user already exists
            let userRecord;
            try {
              userRecord = await getAdminAuth().getUserByEmail(contactEmail);
              schoolAdminUid = userRecord.uid;
              
              // Update existing user's role
              await getAdminAuth().setCustomUserClaims(userRecord.uid, {
                role: "SCHOOL_ADMIN",
              });
            } catch (getUserError: any) {
              if (getUserError.code === "auth/user-not-found") {
                // Create new user
                userRecord = await getAdminAuth().createUser({
                  email: contactEmail,
                  password: tempPassword,
                  displayName: contactName,
                  emailVerified: false,
                });

                schoolAdminUid = userRecord.uid;

                // Set custom claims
                await getAdminAuth().setCustomUserClaims(userRecord.uid, {
                  role: "SCHOOL_ADMIN",
                });
              } else {
                throw getUserError;
              }
            }

            // Add to university team
            if (schoolAdminUid) {
              await db.collection("universities").doc(universityId).update({
                adminUids: [schoolAdminUid],
                [`team.${schoolAdminUid}`]: {
                  uid: schoolAdminUid,
                  email: contactEmail,
                  name: contactName,
                  role: "OWNER",
                  addedAt: now,
                  addedBy: user.uid,
                },
              });

              // Send welcome email with subdomain URL
              if (sendEmails) {
                await sendUniversityApprovedEmail({
                  universityName: uniData.name,
                  contactName,
                  email: contactEmail,
                  tempPassword: tempPassword || undefined,
                  universitySlug: slug, // Pass the slug for subdomain URL
                });
              }
            }
          } catch (authError) {
            console.error(`Error creating user for ${uniData.name}:`, authError);
            // Don't fail the import, just log the error
          }
        }

        results.push({
          university: uniData.name,
          universityId,
          slug,
          adminCreated: !!schoolAdminUid,
          emailSent: sendEmails && !!schoolAdminUid,
        });
      } catch (error: any) {
        errors.push({
          university: uniData.name,
          error: error.message || "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      imported: results.length,
      failed: errors.length,
      results,
      errors,
    });
  } catch (error) {
    console.error("Error bulk importing universities:", error);
    return NextResponse.json(
      { error: "Failed to bulk import universities" },
      { status: 500 }
    );
  }
}
