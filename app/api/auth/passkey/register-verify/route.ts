import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  verifyRegistrationResponse,
  type VerifyRegistrationResponseOpts,
} from "@simplewebauthn/server";

export const dynamic = "force-dynamic";

const rpID = process.env.NEXT_PUBLIC_RP_ID || "localhost";
const origin = process.env.NEXT_PUBLIC_ORIGIN || "http://localhost:3000";



export async function POST(request: NextRequest) {
  try {
    const db = getAdminDb();

    const { userId, attestationResponse } = await request.json();

    if (!userId || !attestationResponse) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get stored challenge
    const challengeDoc = await db.collection("passkey_challenges")
      .doc(userId)
      .get();

    if (!challengeDoc.exists) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 400 }
      );
    }

    const { challenge } = challengeDoc.data()!;

    // Verify registration response
    const opts: VerifyRegistrationResponseOpts = {
      response: attestationResponse,
      expectedChallenge: challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    };

    const verification = await verifyRegistrationResponse(opts);

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json(
        { error: "Verification failed" },
        { status: 400 }
      );
    }

    const { credential } = verification.registrationInfo;

    // Store credential in Firestore
    await db.collection("passkeys").add({
      userId: userId,
      credentialID: Buffer.from(credential.id).toString("base64"),
        credentialPublicKey: Buffer.from(credential.publicKey).toString("base64"),
        counter: credential.counter,
        createdAt: Date.now(),
      });

    // Delete challenge
    await challengeDoc.ref.delete();

    return NextResponse.json({ verified: true });
  } catch (error: any) {
    console.error("Passkey registration verification error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
