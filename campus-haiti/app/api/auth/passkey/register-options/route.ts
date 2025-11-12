import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import {
  generateRegistrationOptions,
  type GenerateRegistrationOptionsOpts,
} from "@simplewebauthn/server";

const rpName = "Campus Haiti";
const rpID = process.env.NEXT_PUBLIC_RP_ID || "localhost";
const origin = process.env.NEXT_PUBLIC_ORIGIN || "http://localhost:3000";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Get user from Firestore
    const userDoc = await adminDb.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();

    // Generate registration options
    const opts: GenerateRegistrationOptionsOpts = {
      rpName,
      rpID,
      userName: userData?.email || userId,
      userDisplayName: userData?.name || userData?.email || userId,
      attestationType: "none",
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
      },
    };

    const options = await generateRegistrationOptions(opts);

    // Store challenge in Firestore temporarily
    await adminDb.collection("passkey_challenges").doc(userId).set({
      challenge: options.challenge,
      createdAt: new Date(),
    });

    return NextResponse.json(options);
  } catch (error: any) {
    console.error("Passkey registration options error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
