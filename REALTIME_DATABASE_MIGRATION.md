# Firebase Realtime Database Migration Guide

This project has been migrated from Cloud Firestore to Firebase Realtime Database.

## What Changed

### Database Structure
- **Before**: Cloud Firestore (NoSQL document database)
- **After**: Firebase Realtime Database (JSON tree structure)

### API Changes
- All API endpoints now use Realtime Database instead of Firestore
- Database helper utilities provide Firestore-like API for easier migration
- Timestamps changed from `Date` objects to Unix timestamps (numbers)

### Collections Migrated
All Firestore collections have been migrated:
- `users` - User profiles and settings
- `universities` - University information
- `programs` - Academic programs
- `schools` - School data
- `applicationItems` - Student applications
- `documents` - Document metadata
- `payments` - Payment records
- `passkeys` - Passkey authentication data
- `sms_notifications` - SMS notification tracking
- `bulk_sms_notifications` - Bulk SMS records
- `platform_settings` - Platform configuration
- `auditLogs` - Security audit logs
- `notifications` - General notifications
- `universityRegistrations` - University registration requests

## Environment Variables

Add the following environment variable to your `.env` files:

```bash
# Firebase Realtime Database URL
FIREBASE_DATABASE_URL=https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com

# Or for client-side
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com
```

Replace `YOUR_PROJECT_ID` with your actual Firebase project ID.

## Migration Steps

### 1. Enable Realtime Database in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Build → Realtime Database**
4. Click **Create Database**
5. Choose your database location (use same as Firestore for best performance)
6. Start in **test mode** initially (we'll secure it later)

### 2. Update Environment Variables

Add the `FIREBASE_DATABASE_URL` to your environment:

```bash
# Vercel
vercel env add FIREBASE_DATABASE_URL
# Enter: https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com

# Local development
echo "FIREBASE_DATABASE_URL=https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com" >> .env.local
```

### 3. Migrate Data from Firestore

Run the migration script to copy all existing data:

```bash
npx ts-node scripts/migrate-firestore-data.ts
```

This will:
- Read all collections from Firestore
- Convert data types (Dates → timestamps)
- Write to Realtime Database
- Preserve document IDs and relationships

### 4. Deploy Security Rules

Deploy the Realtime Database security rules:

```bash
firebase deploy --only database
```

Or manually copy from `database.rules.json` in Firebase Console → Realtime Database → Rules.

### 5. Test the Application

1. **Test locally**: `npm run dev`
2. **Verify endpoints**: Check that data loads correctly
3. **Test writes**: Create/update/delete operations
4. **Check admin panel**: Ensure admin functions work

### 6. Deploy to Production

```bash
# Commit changes
git add -A
git commit -m "feat: Migrate to Firebase Realtime Database"
git push origin main

# Deploy to Vercel
vercel --prod
```

## API Changes for Developers

### Before (Firestore)
```typescript
import { adminDb } from "@/lib/firebase/admin";

// Get document
const userDoc = await adminDb.collection("users").doc(userId).get();

// Add document
const ref = await adminDb.collection("users").add(data);

// Update document
await adminDb.collection("users").doc(userId).update(data);

// Query
const snapshot = await adminDb
  .collection("users")
  .where("role", "==", "ADMIN")
  .get();
```

### After (Realtime Database)
```typescript
import { collection } from "@/lib/firebase/database-helpers";

// Get document
const userDoc = await collection("users").doc(userId).get();

// Add document
const ref = await collection("users").add(data);

// Update document
await collection("users").doc(userId).update(data);

// Query
const snapshot = await collection("users")
  .where("role", "==", "ADMIN")
  .get();
```

The API is nearly identical! The database helpers provide a Firestore-like interface.

## Key Differences

### 1. Timestamps
- **Firestore**: `new Date()` or `Timestamp.now()`
- **Realtime Database**: `Date.now()` (Unix timestamp in milliseconds)

### 2. Document IDs
- **Firestore**: `ref.id`
- **Realtime Database**: `ref.path.split('/').pop()`

### 3. Batch Operations
- **Firestore**: `batch.commit()`
- **Realtime Database**: Sequential operations (no native batching)

### 4. Transactions
- **Firestore**: Full transaction support
- **Realtime Database**: Use RTDB transactions (different API)

## Security Rules

The Realtime Database uses JSON-based security rules instead of Firestore's rule language.

**Firestore Rules** (`firestore.rules`):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

**Realtime Database Rules** (`database.rules.json`):
```json
{
  "rules": {
    "users": {
      "$userId": {
        ".read": "auth.uid === $userId",
        ".write": "auth.uid === $userId"
      }
    }
  }
}
```

## Performance Considerations

### Advantages of Realtime Database:
- ✅ Real-time synchronization (built-in listeners)
- ✅ Lower latency for small reads/writes
- ✅ Simpler pricing model
- ✅ Better for real-time features (chat, live updates)

### Trade-offs:
- ⚠️ Less flexible querying (single orderBy per query)
- ⚠️ No compound queries like Firestore
- ⚠️ Data structure requires more planning

## Rollback Plan

If you need to rollback to Firestore:

1. **Revert code changes**:
   ```bash
   git revert HEAD
   ```

2. **Restore environment variables**:
   - Remove `FIREBASE_DATABASE_URL`
   - Keep original Firestore config

3. **Redeploy**:
   ```bash
   vercel --prod
   ```

Your Firestore data remains unchanged (migration only copies data).

## Troubleshooting

### Issue: "Cannot connect to Realtime Database"
**Solution**: Verify `FIREBASE_DATABASE_URL` is set correctly in environment variables.

### Issue: "Permission denied" errors
**Solution**: Check `database.rules.json` is deployed and rules allow the operation.

### Issue: "Data not appearing"
**Solution**: Run the migration script to copy data from Firestore.

### Issue: "Timestamps showing as numbers"
**Solution**: This is expected. Use `new Date(timestamp)` to convert back to Date objects.

## Support

For issues or questions:
1. Check Firebase Console → Realtime Database → Data tab
2. Review `database.rules.json` for security rules
3. Check browser console and server logs
4. Verify environment variables are set

## Additional Resources

- [Firebase Realtime Database Docs](https://firebase.google.com/docs/database)
- [Migrating from Firestore Guide](https://firebase.google.com/docs/database/rtdb-vs-firestore)
- [Security Rules Reference](https://firebase.google.com/docs/database/security)
- [Database Helper API](./lib/firebase/database-helpers.ts)
