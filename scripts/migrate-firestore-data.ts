#!/usr/bin/env ts-node
/**
 * Firestore to Firebase Realtime Database Migration Script
 * 
 * This script migrates all data from Firestore to Realtime Database
 * while preserving the structure and relationships.
 * 
 * Usage: npx ts-node scripts/migrate-firestore-data.ts
 */

import { getAdminDb, getAdminDatabase } from '../lib/firebase/admin';

const BATCH_SIZE = 500;

interface MigrationStats {
  collection: string;
  documentsCount: number;
  success: boolean;
  errors: string[];
}

const stats: MigrationStats[] = [];

/**
 * Migrate a Firestore collection to Realtime Database
 */
async function migrateCollection(collectionName: string): Promise<MigrationStats> {
  console.log(`\n📦 Migrating collection: ${collectionName}`);
  
  const stat: MigrationStats = {
    collection: collectionName,
    documentsCount: 0,
    success: true,
    errors: [],
  };

  try {
    const firestore = getAdminDb();
    const rtdb = getAdminDatabase();
    
    // Get all documents from Firestore
    const snapshot = await firestore.collection(collectionName).get();
    stat.documentsCount = snapshot.size;

    console.log(`  Found ${snapshot.size} documents`);

    if (snapshot.empty) {
      console.log(`  ✓ No documents to migrate`);
      return stat;
    }

    // Migrate documents in batches
    const docs = snapshot.docs;
    for (let i = 0; i < docs.length; i += BATCH_SIZE) {
      const batch = docs.slice(i, Math.min(i + BATCH_SIZE, docs.length));
      
      console.log(`  Migrating batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(docs.length / BATCH_SIZE)}...`);

      const updates: { [key: string]: any } = {};

      for (const doc of batch) {
        const data = doc.data();
        
        // Convert Firestore Timestamps to numbers
        const convertedData = convertFirestoreData(data);
        
        updates[`${collectionName}/${doc.id}`] = {
          ...convertedData,
          id: doc.id,
        };
      }

      // Write batch to RTDB
      await rtdb.ref().update(updates);
    }

    console.log(`  ✓ Successfully migrated ${stat.documentsCount} documents`);
  } catch (error) {
    stat.success = false;
    stat.errors.push(error instanceof Error ? error.message : 'Unknown error');
    console.error(`  ✗ Error migrating ${collectionName}:`, error);
  }

  return stat;
}

/**
 * Convert Firestore-specific data types to RTDB-compatible types
 */
function convertFirestoreData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(convertFirestoreData);
  }

  if (typeof data === 'object') {
    // Check if it's a Firestore Timestamp
    if (data.toDate && typeof data.toDate === 'function') {
      return data.toDate().getTime(); // Convert to Unix timestamp
    }

    // Check if it's a Date object
    if (data instanceof Date) {
      return data.getTime();
    }

    // Recursively convert nested objects
    const converted: any = {};
    for (const [key, value] of Object.entries(data)) {
      converted[key] = convertFirestoreData(value);
    }
    return converted;
  }

  return data;
}

/**
 * Main migration function
 */
async function main() {
  console.log('🚀 Starting Firestore to Realtime Database migration...\n');
  console.log('⚠️  WARNING: This will copy all data from Firestore to Realtime Database');
  console.log('   Existing data in RTDB may be overwritten!\n');

  // Collections to migrate (in order of dependencies)
  const collections = [
    'users',
    'universities',
    'programs',
    'schools',
    'applicationItems',
    'documents',
    'payments',
    'passkeys',
    'passkey_challenges',
    'auth_challenges',
    'sms_notifications',
    'bulk_sms_notifications',
    'platform_settings',
    'auditLogs',
    'notifications',
    'universityRegistrations',
  ];

  console.log(`📋 Will migrate ${collections.length} collections:\n   ${collections.join(', ')}\n`);

  // Migrate each collection
  for (const collectionName of collections) {
    const stat = await migrateCollection(collectionName);
    stats.push(stat);
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(60));

  const successful = stats.filter(s => s.success).length;
  const failed = stats.filter(s => !s.success).length;
  const totalDocs = stats.reduce((sum, s) => sum + s.documentsCount, 0);

  console.log(`\nCollections processed: ${stats.length}`);
  console.log(`  ✓ Successful: ${successful}`);
  console.log(`  ✗ Failed: ${failed}`);
  console.log(`\nTotal documents migrated: ${totalDocs}`);

  console.log('\nDetails:');
  for (const stat of stats) {
    const status = stat.success ? '✓' : '✗';
    console.log(`  ${status} ${stat.collection}: ${stat.documentsCount} docs`);
    if (stat.errors.length > 0) {
      stat.errors.forEach(err => console.log(`      Error: ${err}`));
    }
  }

  if (failed > 0) {
    console.log('\n⚠️  Some collections failed to migrate. Please review errors above.');
    process.exit(1);
  } else {
    console.log('\n✅ Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('  1. Verify data in Firebase Console → Realtime Database');
    console.log('  2. Test your application endpoints');
    console.log('  3. Update your database security rules');
    console.log('  4. Deploy the updated application');
  }
}

// Run migration
main().catch(error => {
  console.error('\n❌ Migration failed:', error);
  process.exit(1);
});
