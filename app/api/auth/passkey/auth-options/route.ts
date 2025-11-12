import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import {
  generateAuthenticationOptions,
  type GenerateAuthenticationOptionsOpts,
} from "@simplewebauthn/server";

const rpID = process.env.NEXT_PUBLIC_RP_ID || "localhost";

export async function GET() {
  try {
    // For simplicity, we'll allow any registered passkey
    // In production, you might want to scope this better
    const opts: GenerateAuthenticationOptionsOpts = {
      rpID,
      userVerification: "preferred",
    };

    const options = await generateAuthenticationOptions(opts);

    // Store challenge temporarily in a general collection
    await adminDb.collection("auth_challenges").add({
      challenge: options.challenge,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    return NextResponse.json(options);
  } catch (error: any) {
    console.error("Passkey auth options error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
