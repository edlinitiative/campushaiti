#!/usr/bin/env node
/**
 * Firestore to Firebase Realtime Database Migration Script
 * 
 * This script migrates all data from Firestore to Realtime Database
 * 
 * Usage: node scripts/migrate-firestore-data.js
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  // Try to use environment variables first (recommended for Codespaces/CI)
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    console.log('✓ Using Firebase credentials from environment variables');
    
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    // Handle escaped newlines
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, "\n");
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
  } else {
    // Fallback to service account key file (for local development only)
    try {
      console.log('✓ Using serviceAccountKey.json (this file should NOT be committed to git)');
      const serviceAccount = require('../serviceAccountKey.json');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL || serviceAccount.databaseURL
      });
    } catch (error) {
      console.error('❌ Error: No Firebase credentials found.');
      console.error('   Either set environment variables:');
      console.error('     - FIREBASE_PROJECT_ID');
      console.error('     - FIREBASE_CLIENT_EMAIL');
      console.error('     - FIREBASE_PRIVATE_KEY');
      console.error('     - FIREBASE_DATABASE_URL');
      console.error('   Or download serviceAccountKey.json from Firebase Console');
      process.exit(1);
    }
  }
}

const firestore = admin.firestore();
const database = admin.database();

const BATCH_SIZE = 500;
const stats = [];

/**
 * Convert Firestore data to RTDB-compatible format
 */
function convertData(data) {
  if (data === null || data === undefined) return data;
  
  if (Array.isArray(data)) {
    return data.map(convertData);
  }
  
  if (typeof data === 'object') {
    // Convert Firestore Timestamp
    if (data._seconds !== undefined) {
      return data._seconds * 1000 + Math.floor(data._nanoseconds / 1000000);
    }
    
    // Convert Date
    if (data instanceof Date) {
      return data.getTime();
    }
    
    // Recursively convert object
    const converted = {};
    for (const [key, value] of Object.entries(data)) {
      converted[key] = convertData(value);
    }
    return converted;
  }
  
  return data;
}

/**
 * Migrate a single collection
 */
async function migrateCollection(collectionName) {
  console.log(`\n📦 Migrating collection: ${collectionName}`);
  
  const stat = {
    collection: collectionName,
    documentsCount: 0,
    success: true,
    errors: []
  };
  
  try {
    const snapshot = await firestore.collection(collectionName).get();
    stat.documentsCount = snapshot.size;
    
    console.log(`   Found ${snapshot.size} documents`);
    
    if (snapshot.empty) {
      console.log(`   ✓ No documents to migrate`);
      return stat;
    }
    
    // Process in batches
    const docs = snapshot.docs;
    for (let i = 0; i < docs.length; i += BATCH_SIZE) {
      const batch = docs.slice(i, Math.min(i + BATCH_SIZE, docs.length));
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(docs.length / BATCH_SIZE);
      
      console.log(`   Batch ${batchNum}/${totalBatches}...`);
      
      const updates = {};
      
      for (const doc of batch) {
        const data = doc.data();
        const converted = convertData(data);
        
        updates[`${collectionName}/${doc.id}`] = {
          ...converted,
          id: doc.id
        };
      }
      
      await database.ref().update(updates);
    }
    
    console.log(`   ✓ Migrated ${stat.documentsCount} documents`);
    
  } catch (error) {
    stat.success = false;
    stat.errors.push(error.message);
    console.error(`   ✗ Error: ${error.message}`);
  }
  
  return stat;
}

/**
 * Main migration
 */
async function main() {
  console.log('🚀 Starting Firestore → Realtime Database migration\n');
  console.log('⚠️  WARNING: This will copy data from Firestore to RTDB');
  console.log('   Existing RTDB data may be overwritten!\n');
  
  // Collections to migrate
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
    'universityRegistrations'
  ];
  
  console.log(`📋 Migrating ${collections.length} collections\n`);
  
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
  
  console.log(`\nCollections: ${stats.length}`);
  console.log(`  ✓ Success: ${successful}`);
  console.log(`  ✗ Failed: ${failed}`);
  console.log(`\nTotal documents: ${totalDocs}`);
  
  console.log('\nDetails:');
  stats.forEach(stat => {
    const icon = stat.success ? '✓' : '✗';
    console.log(`  ${icon} ${stat.collection}: ${stat.documentsCount} docs`);
    if (stat.errors.length > 0) {
      stat.errors.forEach(err => console.log(`      Error: ${err}`));
    }
  });
  
  if (failed > 0) {
    console.log('\n⚠️  Some collections failed. Review errors above.');
    process.exit(1);
  } else {
    console.log('\n✅ Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('  1. Check data in Firebase Console → Realtime Database');
    console.log('  2. Deploy security rules: firebase deploy --only database');
    console.log('  3. Update environment variables with FIREBASE_DATABASE_URL');
    console.log('  4. Test your application');
  }
  
  process.exit(0);
}

main().catch(error => {
  console.error('\n❌ Migration failed:', error);
  process.exit(1);
});
