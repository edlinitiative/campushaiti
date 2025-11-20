import { NextRequest, NextResponse } from "next/server";
import { collection } from "@/lib/firebase/database-helpers";
import {
  verifyRegistrationResponse,
  type VerifyRegistrationResponseOpts,
} from "@simplewebauthn/server";

const rpID = process.env.NEXT_PUBLIC_RP_ID || "localhost";
const origin = process.env.NEXT_PUBLIC_ORIGIN || "http://localhost:3000";

export async function POST(request: NextRequest) {
  try {
    const { userId, attestationResponse } = await request.json();

    if (!userId || !attestationResponse) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get stored challenge
    const challengeDoc = await collection("passkey_challenges")
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
    await collection("passkeys").add({
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
