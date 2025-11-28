/**
 * Migration Script: Add Staff to Universities
 * 
 * This script migrates existing adminUids to the new staff subcollection
 * Run this once to set up the new granular role system
 * 
 * Usage:
 * 1. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY env vars
 * 2. Run: node --loader ts-node/esm scripts/migrate-staff.ts
 */

import * as admin from "firebase-admin";

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

const db = admin.firestore();

async function migrateStaff() {
  console.log("Starting staff migration...\n");

  try {
    // Get all universities
    const universitiesSnapshot = await db.collection("universities").get();
    console.log(`Found ${universitiesSnapshot.size} universities\n`);

    let totalStaffAdded = 0;

    for (const universityDoc of universitiesSnapshot.docs) {
      const universityId = universityDoc.id;
      const universityData = universityDoc.data();
      const universityName = universityData.name || universityId;

      console.log(`Processing: ${universityName} (${universityId})`);

      // Check if adminUids exist
      const adminUids = universityData.adminUids || [];
      if (adminUids.length === 0) {
        console.log(`  ⚠️  No adminUids found, skipping\n`);
        continue;
      }

      console.log(`  Found ${adminUids.length} admin(s)`);

      // Create staff subcollection entries
      const staffRef = db
        .collection("universities")
        .doc(universityId)
        .collection("staff");

      for (const userId of adminUids) {
        // Check if staff entry already exists
        const existingStaff = await staffRef.doc(userId).get();
        if (existingStaff.exists) {
          console.log(`  ✓ Staff entry already exists for user: ${userId}`);
          continue;
        }

        // Get user details if available
        let userName = "Unknown";
        let userEmail = "unknown@example.com";

        try {
          const userDoc = await db.collection("users").doc(userId).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            userName = userData?.name || userData?.displayName || "Unknown";
            userEmail = userData?.email || "unknown@example.com";
          }
        } catch (error) {
          console.log(`  ⚠️  Could not fetch user details for ${userId}`);
        }

        // Create staff entry with UNI_ADMIN role (legacy admins get full access)
        await staffRef.doc(userId).set({
          userId,
          role: "UNI_ADMIN",
          permissions: [], // Permissions are determined by role
          email: userEmail,
          name: userName,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          invitedBy: "system",
          invitedAt: admin.firestore.FieldValue.serverTimestamp(),
          migratedFromAdminUids: true,
        });

        console.log(`  ✓ Created staff entry: ${userName} (${userEmail})`);
        totalStaffAdded++;
      }

      console.log();
    }

    console.log("=====================================");
    console.log(`Migration complete!`);
    console.log(`Total staff entries created: ${totalStaffAdded}`);
    console.log("=====================================\n");

    console.log("Next steps:");
    console.log("1. Deploy updated Firestore rules");
    console.log("2. Test permissions with existing admin users");
    console.log("3. Optionally remove adminUids arrays (keep for backward compatibility)");
    console.log();
  } catch (error) {
    console.error("Error during migration:", error);
    process.exit(1);
  }
}

// Run migration
migrateStaff()
  .then(() => {
    console.log("Migration script finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
