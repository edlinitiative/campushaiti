import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("session")?.value;
    
    if (!token) {
      return NextResponse.json({ 
        authenticated: false,
        error: "No session token found" 
      });
    }

    const auth = getAdminAuth();
    const db = getAdminDb();
    
    const decodedToken = await auth.verifySessionCookie(token);
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();
    const userData = userDoc.data();

    return NextResponse.json({
      authenticated: true,
      uid: decodedToken.uid,
      email: decodedToken.email,
      userDocExists: userDoc.exists,
      userData: userData,
      isAdmin: userData?.role === "ADMIN",
    });
  } catch (error: any) {
    return NextResponse.json({
      authenticated: false,
      error: error.message,
      errorCode: error.code,
    }, { status: 500 });
  }
}
