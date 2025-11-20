import { NextResponse } from "next/server";
import { collection } from "@/lib/firebase/database-helpers";
import {
  generateAuthenticationOptions,
  type GenerateAuthenticationOptionsOpts,
} from "@simplewebauthn/server";

export const dynamic = "force-dynamic";

const rpID = process.env.NEXT_PUBLIC_RP_ID || "localhost";

export async function GET() {
  try {
    // Try to get all registered passkeys from the database
    // If the collection doesn't exist yet, that's okay - we'll just use an empty array
    let allowCredentials: any[] = [];
    
    try {
      const passkeysSnapshot = await collection("passkeys")
        .where("counter", ">=", 0) // Get all valid passkeys
        .get();

      allowCredentials = passkeysSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: data.credentialID,
          type: "public-key" as const,
          transports: data.transports || [],
        };
      });
    } catch (dbError: any) {
      console.warn("Could not fetch passkeys (collection may not exist yet):", dbError.message);
      // Continue with empty allowCredentials
    }

    const opts: GenerateAuthenticationOptionsOpts = {
      rpID,
      userVerification: "preferred",
      allowCredentials: allowCredentials.length > 0 ? allowCredentials : undefined,
    };

    const options = await generateAuthenticationOptions(opts);

    // Store challenge temporarily in a general collection
    await collection("auth_challenges").add({
      challenge: options.challenge,
      createdAt: Date.now(),
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
