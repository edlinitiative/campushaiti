/**
 * Firebase Cloud Firestore Console Script
 * Run this in the Firebase Console to create your first admin user
 * 
 * Instructions:
 * 1. Go to Firebase Console > Firestore Database
 * 2. Open the browser console (F12)
 * 3. Copy and paste this entire script
 * 4. Update the USER_EMAIL and USER_UID variables below
 * 5. Press Enter to run
 */

// ===== CONFIGURE THESE VALUES =====
const USER_EMAIL = "your-email@example.com";  // Your email address
const USER_UID = "your-firebase-auth-uid";     // Get this from Firebase Auth > Users
const FULL_NAME = "Admin User";                // Your full name
// ==================================

// Don't modify below this line
const userData = {
  email: USER_EMAIL,
  displayName: FULL_NAME,
  role: "ADMIN",
  createdAt: Date.now(),
  emailVerified: true,
};

const profileData = {
  uid: USER_UID,
  email: USER_EMAIL,
  fullName: FULL_NAME,
  role: "ADMIN",
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

console.log("Creating admin user documents...");
console.log("User data:", userData);
console.log("Profile data:", profileData);
console.log("\n1. Go to Firestore > users collection > Add document");
console.log(`   Document ID: ${USER_UID}`);
console.log("   Copy this data:", JSON.stringify(userData, null, 2));
console.log("\n2. Go to Firestore > profiles collection > Add document");
console.log(`   Document ID: ${USER_UID}`);
console.log("   Copy this data:", JSON.stringify(profileData, null, 2));
