import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    hasFirebaseProjectId: !!process.env.FIREBASE_PROJECT_ID,
    hasFirebaseClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
    hasFirebasePrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
    hasFirebaseDatabaseUrl: !!process.env.FIREBASE_DATABASE_URL,
    hasNextPublicDatabaseUrl: !!process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    nextPhase: process.env.NEXT_PHASE,
  });
}
