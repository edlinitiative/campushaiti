import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { collection } from "@/lib/firebase/database-helpers";
import {
  generateRegistrationOptions,
  type GenerateRegistrationOptionsOpts,
} from "@simplewebauthn/server";

export const dynamic = "force-dynamic";

const rpName = "Campus Haiti";
const rpID = process.env.NEXT_PUBLIC_RP_ID || "localhost";
const origin = process.env.NEXT_PUBLIC_ORIGIN || "http://localhost:3000";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Get or create user in Firestore
    let userData: any = {};
    try {
      const userDoc = await collection("users").doc(userId).get();
      if (userDoc.exists) {
        userData = userDoc.data();
      } else {
        // If user doesn't exist in Firestore, try to get from Firebase Auth
        try {
          const authUser = await adminAuth.getUser(userId);
          userData = {
            email: authUser.email,
            name: authUser.displayName,
          };
          // Create the user document
          await collection("users").doc(userId).set({
            email: authUser.email,
            displayName: authUser.displayName,
            createdAt: Date.now(),
          }, { merge: true });
        } catch (authError) {
          console.error("Could not fetch user from Auth:", authError);
          // Continue with minimal data
          userData = { email: userId };
        }
      }
    } catch (dbError) {
      console.error("Firestore error:", dbError);
      // Continue with minimal data
      userData = { email: userId };
    }

    // Generate registration options
    const opts: GenerateRegistrationOptionsOpts = {
      rpName,
      rpID,
      userName: userData?.email || userId,
      userDisplayName: userData?.name || userData?.displayName || userData?.email || userId,
      attestationType: "none",
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
      },
    };

    const options = await generateRegistrationOptions(opts);

    // Store challenge in Firestore temporarily
    try {
      await collection("passkey_challenges").doc(userId).set({
        challenge: options.challenge,
        createdAt: Date.now(),
      });
    } catch (challengeError) {
      console.warn("Could not store challenge in Firestore:", challengeError);
      // Continue anyway - verification might fail but we'll handle it there
    }

    return NextResponse.json(options);
  } catch (error: any) {
    console.error("Passkey registration options error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate registration options" },
      { status: 500 }
    );
  }
}
