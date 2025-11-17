import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server-auth";
import { GDPRService } from "@/lib/security/gdpr";
import { withAPIMiddleware } from "@/lib/security/api-middleware";
import { AuditAction } from "@/lib/security/audit-logger";

/**
 * GET - Export user data (GDPR Right to Access)
 */
export async function GET(request: NextRequest) {
  const middleware = await withAPIMiddleware(request, {
    rateLimiter: "api",
    auditAction: AuditAction.GDPR_DATA_REQUEST,
  });

  if (middleware.error) return middleware.error;

  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Export user's data
    const data = await GDPRService.exportUserData(user.uid);

    return NextResponse.json({
      success: true,
      data,
      message: "Your data has been exported successfully",
    });
  } catch (error) {
    console.error("Error exporting user data:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}

/**
 * POST - Request data deletion (GDPR Right to Erasure)
 */
export async function POST(request: NextRequest) {
  const middleware = await withAPIMiddleware(request, {
    rateLimiter: "api",
    auditAction: AuditAction.GDPR_DATA_DELETION,
  });

  if (middleware.error) return middleware.error;

  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { deleteApplications, deleteDocuments, anonymizeAuditLogs } = body;

    // Delete user's data
    const result = await GDPRService.deleteUserData(user.uid, {
      deleteApplications: deleteApplications || false,
      deleteDocuments: deleteDocuments || false,
      anonymizeAuditLogs: anonymizeAuditLogs !== false, // Default true
    });

    return NextResponse.json({
      success: result.success,
      deleted: result.deleted,
      retained: result.retained,
      message: "Your data deletion request has been processed",
    });
  } catch (error) {
    console.error("Error deleting user data:", error);
    return NextResponse.json(
      { error: "Failed to delete data" },
      { status: 500 }
    );
  }
}

/**
 * Download data export as JSON file
 */
export async function PUT(request: NextRequest) {
  const middleware = await withAPIMiddleware(request, {
    rateLimiter: "api",
  });

  if (middleware.error) return middleware.error;

  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jsonData = await GDPRService.generateDataExportFile(user.uid);

    return new NextResponse(jsonData, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="user-data-${user.uid}-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    console.error("Error generating data export file:", error);
    return NextResponse.json(
      { error: "Failed to generate export file" },
      { status: 500 }
    );
  }
}
