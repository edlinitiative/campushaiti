import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getServerUser();
  const cookies = request.cookies.getAll();
  
  return NextResponse.json({
    hasUser: !!user,
    user: user ? {
      uid: user.uid,
      email: user.email,
      role: user.role,
    } : null,
    cookies: cookies.map(c => ({ name: c.name, hasValue: !!c.value })),
  });
}
