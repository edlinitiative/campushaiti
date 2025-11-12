/**
 * Admin User Setup Script
 * 
 * Usage:
 * 1. Set environment variables for Firebase Admin
 * 2. Run: npx ts-node scripts/create-admin.ts <user-email>
 */

import { adminAuth, adminDb } from "../lib/firebase/admin";

async function createAdmin(email: string) {
  try {
    // Find user by email
    const user = await adminAuth.getUserByEmail(email);
    
    // Set admin role via custom claims
    await adminAuth.setCustomUserClaims(user.uid, {
      role: "ADMIN",
    });

    // Update user document in Firestore
    await adminDb.collection("users").doc(user.uid).set(
      {
        uid: user.uid,
        email: user.email,
        role: "ADMIN",
        updatedAt: new Date(),
      },
      { merge: true }
    );

    console.log(`✅ Successfully set ${email} as ADMIN`);
    console.log(`User ID: ${user.uid}`);
    console.log("\nNote: The user needs to sign out and sign back in for changes to take effect.");
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

// Get email from command line
const email = process.argv[2];

if (!email) {
  console.error("Usage: npx ts-node scripts/create-admin.ts <user-email>");
  process.exit(1);
}

createAdmin(email).then(() => process.exit(0));
