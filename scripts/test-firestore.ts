/**
 * Test Firestore collections and verify data
 */
import { getAdminDb } from "@/lib/firebase/admin";

async function testFirestore() {
  console.log("🔍 Testing Firestore collections...\n");

  const db = getAdminDb();

  const collections = [
    "users",
    "applicationItems",
    "documents",
    "programs",
    "universities",
    "auditLogs",
    "profiles",
    "schools",
    "notifications",
  ];

  for (const collectionName of collections) {
    try {
      const snapshot = await db.collection(collectionName).limit(5).get();
      console.log(`✅ ${collectionName}: ${snapshot.size} documents (showing first 5)`);
      
      if (snapshot.size > 0) {
        console.log(`   Sample IDs: ${snapshot.docs.map(doc => doc.id).join(", ")}`);
      }
    } catch (error: any) {
      console.log(`❌ ${collectionName}: Error - ${error.message}`);
    }
  }

  console.log("\n✅ Firestore test complete!");
}

testFirestore().catch(console.error);
