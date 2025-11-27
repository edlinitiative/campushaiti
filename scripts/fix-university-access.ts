// Script to fix university access for a user
// This ensures the user's UID is in the adminUids array

import { getAdminDb } from "../lib/firebase/admin";

const USER_UID = "2BfbxE4d17SQoAKcRylhjCsscO52"; // info@edlight.org
const UNIVERSITY_SLUGS = ["uc", "ueh", "uniq", "uneph"];

async function fixUniversityAccess() {
  console.log("Starting university access fix...\n");
  const db = getAdminDb();

  for (const slug of UNIVERSITY_SLUGS) {
    console.log(`\nProcessing university: ${slug}`);
    
    try {
      const universitiesSnapshot = await db
        .collection("universities")
        .where("slug", "==", slug)
        .limit(1)
        .get();

      if (universitiesSnapshot.empty) {
        console.log(`❌ University not found: ${slug}`);
        continue;
      }

      const universityDoc = universitiesSnapshot.docs[0];
      const universityData = universityDoc.data();
      
      console.log(`✓ Found university: ${universityData.name}`);
      console.log(`  Current adminUids:`, universityData.adminUids || []);

      // Check if user already has access
      const adminUids = universityData.adminUids || [];
      if (adminUids.includes(USER_UID)) {
        console.log(`  ✓ User already has access`);
        continue;
      }

      // Add user to adminUids
      const updatedAdminUids = [...adminUids, USER_UID];
      await universityDoc.ref.update({
        adminUids: updatedAdminUids,
      });

      console.log(`  ✅ Added user to adminUids`);
      console.log(`  New adminUids:`, updatedAdminUids);

    } catch (error) {
      console.error(`❌ Error processing ${slug}:`, error);
    }
  }

  console.log("\n✅ University access fix complete!");
}

fixUniversityAccess()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
