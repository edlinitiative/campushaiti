# Firestore Deployment Guide

## Prerequisites
- Firebase CLI installed: `npm install -g firebase-tools`
- Logged in to Firebase: `firebase login`
- Project initialized: `firebase init` (select Firestore)

## Deploy Firestore Rules and Indexes

### Option 1: Deploy Everything
```bash
firebase deploy
```

### Option 2: Deploy Only Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### Option 3: Deploy Only Firestore Indexes
```bash
firebase deploy --only firestore:indexes
```

## Manual Deployment (Firebase Console)

If you prefer to deploy manually through the Firebase Console:

### Deploy Rules:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `campus-haiti`
3. Navigate to **Firestore Database** → **Rules**
4. Copy contents of `firestore.rules`
5. Paste into the rules editor
6. Click **Publish**

### Deploy Indexes:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `campus-haiti`
3. Navigate to **Firestore Database** → **Indexes**
4. For each index in `firestore.indexes.json`:
   - Click **Create Index**
   - Select the collection group
   - Add fields with their order (ASCENDING/DESCENDING)
   - Click **Create**

## Required Indexes

The following composite indexes are required for the admin system:

### adminInvitations
- `email` (ASCENDING) + `status` (ASCENDING)
- `status` (ASCENDING) + `createdAt` (DESCENDING)
- `token` (ASCENDING) + `status` (ASCENDING)

### adminAccess
- `grantedAt` (DESCENDING)

### teamInvitations
- `token` (ASCENDING) + `status` (ASCENDING)
- `universityId` (ASCENDING) + `status` (ASCENDING)

### universities
- `slug` (ASCENDING)

### applications
- `programId` (ASCENDING) + `status` (ASCENDING)
- `applicantUid` (ASCENDING) + `createdAt` (DESCENDING)

## Verify Deployment

After deploying, verify:

1. **Rules are active:**
   - Try accessing admin endpoints as a non-admin user
   - Should receive 401/403 errors

2. **Indexes are built:**
   - Check Firebase Console → Firestore → Indexes
   - All indexes should show status: "Enabled"
   - If status is "Building", wait for completion

3. **Queries work:**
   - Test admin invitation flow
   - Test listing administrators
   - Check for any missing index errors in console

## Troubleshooting

### Missing Index Error
If you see an error like "The query requires an index", the error message will include a direct link to create the index. Click the link to auto-create it.

### Permission Denied
- Verify Firestore rules are deployed
- Check that user has correct role in Firebase Auth custom claims
- Verify adminAccess collection has the user's access level

### Slow Queries
- Ensure all indexes are created and status is "Enabled"
- Check query patterns match the defined indexes
