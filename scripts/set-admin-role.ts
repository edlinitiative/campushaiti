#!/usr/bin/env tsx

/**
 * Script to set a user as ADMIN
 * Usage: npx tsx scripts/set-admin-role.ts <email>
 */

import { getAdminAuth } from "../lib/firebase/admin";

async function setAdminRole(email: string) {
  try {
    const adminAuth = getAdminAuth();
    
    // Get user by email
    console.log(`Looking up user: ${email}`);
    const user = await adminAuth.getUserByEmail(email);
    console.log(`Found user: ${user.uid}`);
    
    // Set custom claims
    console.log(`Setting ADMIN role for ${email}...`);
    await adminAuth.setCustomUserClaims(user.uid, { role: "ADMIN" });
    
    console.log("✅ Successfully set ADMIN role!");
    console.log("\nUser must sign out and sign in again for role to take effect.");
    
  } catch (error) {
    console.error("❌ Error setting admin role:", error);
    process.exit(1);
  }
}

const email = process.argv[2];

if (!email) {
  console.error("Usage: npx tsx scripts/set-admin-role.ts <email>");
  process.exit(1);
}

setAdminRole(email);
