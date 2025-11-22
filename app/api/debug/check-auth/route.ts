import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("session")?.value;
    
    if (!token) {
      return NextResponse.json({ 
        authenticated: false,
        step: "no_token",
        error: "No session token found",
        cookies: Object.fromEntries(request.cookies.getAll().map(c => [c.name, c.value.substring(0, 20) + "..."])),
      });
    }

    console.log("Session token found, verifying...");
    const auth = getAdminAuth();
    const db = getAdminDb();
    
    let decodedToken;
    try {
      decodedToken = await auth.verifySessionCookie(token);
      console.log("Token verified, UID:", decodedToken.uid);
    } catch (verifyError: any) {
      return NextResponse.json({
        authenticated: false,
        step: "token_verification_failed",
        error: verifyError.message,
        errorCode: verifyError.code,
      }, { status: 500 });
    }

    console.log("Fetching user document for UID:", decodedToken.uid);
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();
    console.log("User doc exists:", userDoc.exists);
    const userData = userDoc.data();

    return NextResponse.json({
      authenticated: true,
      uid: decodedToken.uid,
      email: decodedToken.email,
      userDocExists: userDoc.exists,
      userData: userData,
      isAdmin: userData?.role === "ADMIN",
      step: "success",
    });
  } catch (error: any) {
    console.error("Check auth error:", error);
    return NextResponse.json({
      authenticated: false,
      step: "unknown_error",
      error: error.message,
      errorCode: error.code,
      errorStack: error.stack,
    }, { status: 500 });
  }
}
