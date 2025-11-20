import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server-auth";
import { auditLogger, AuditAction } from "@/lib/security/audit-logger";
import { withAPIMiddleware } from "@/lib/security/api-middleware";
import { PermissionChecker, Permission, Role } from "@/lib/security/permissions";

export const dynamic = "force-dynamic";

/**
 * GET - Query audit logs (Admin only)
 */
export async function GET(request: NextRequest) {
  const middleware = await withAPIMiddleware(request, {
    rateLimiter: "api",
  });

  if (middleware.error) return middleware.error;

  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to view audit logs
    const userRole = (user as any).role || Role.APPLICANT;
    if (!PermissionChecker.hasPermission(userRole, Permission.VIEW_AUDIT_LOGS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || undefined;
    const action = searchParams.get("action") as AuditAction | undefined;
    const limit = parseInt(searchParams.get("limit") || "100");
    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!).getTime()
      : undefined;
    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!).getTime()
      : undefined;

    const logs = await auditLogger.query({
      userId,
      action,
      startDate,
      endDate,
      limit,
    });

    return NextResponse.json({
      success: true,
      logs,
      count: logs.length,
    });
  } catch (error) {
    console.error("Error querying audit logs:", error);
    return NextResponse.json(
      { error: "Failed to query audit logs" },
      { status: 500 }
    );
  }
}
