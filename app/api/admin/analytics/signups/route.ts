import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { requireRole } from "@/lib/auth/server-auth";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check admin permission
    await requireRole(["ADMIN"]);

    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get("timeRange") || "6months";

    // Fetch all users
    const listUsersResult = await adminAuth.listUsers(1000);
    const users = listUsersResult.users;

    // Calculate provider distribution
    const byProvider = {
      google: 0,
      password: 0,
      phone: 0,
      other: 0,
    };

    users.forEach((user) => {
      const providers = user.providerData.map((p) => p.providerId);
      if (providers.includes("google.com")) {
        byProvider.google++;
      } else if (providers.includes("password")) {
        byProvider.password++;
      } else if (providers.includes("phone")) {
        byProvider.phone++;
      } else {
        byProvider.other++;
      }
    });

    // Calculate signups by month
    const now = new Date();
    const monthsToShow = timeRange === "12months" ? 12 : 6;
    const monthlyData: { [key: string]: { google: number; password: number; phone: number; total: number } } = {};

    // Initialize months
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      monthlyData[monthKey] = { google: 0, password: 0, phone: 0, total: 0 };
    }

    // Count users by creation month
    users.forEach((user) => {
      const createdDate = new Date(user.metadata.creationTime);
      const monthKey = createdDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      
      if (monthlyData[monthKey]) {
        const providers = user.providerData.map((p) => p.providerId);
        if (providers.includes("google.com")) {
          monthlyData[monthKey].google++;
        } else if (providers.includes("password")) {
          monthlyData[monthKey].password++;
        } else if (providers.includes("phone")) {
          monthlyData[monthKey].phone++;
        }
        monthlyData[monthKey].total++;
      }
    });

    // Convert to array
    const byMonth = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data,
    }));

    // Calculate recent signups (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentSignups = users.filter(
      (user) => new Date(user.metadata.creationTime) >= thirtyDaysAgo
    ).length;

    // Calculate growth rate (comparing last 30 days to previous 30 days)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const previousPeriodSignups = users.filter(
      (user) => {
        const createdDate = new Date(user.metadata.creationTime);
        return createdDate >= sixtyDaysAgo && createdDate < thirtyDaysAgo;
      }
    ).length;

    const growthRate = previousPeriodSignups > 0
      ? ((recentSignups - previousPeriodSignups) / previousPeriodSignups) * 100
      : recentSignups > 0 ? 100 : 0;

    return NextResponse.json({
      totalUsers: users.length,
      byProvider,
      byMonth,
      recentSignups,
      growthRate,
    });
  } catch (error: any) {
    console.error("Error fetching analytics:", error);
    
    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
