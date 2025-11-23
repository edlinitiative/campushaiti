# File Upload Troubleshooting Guide

## Issue: Upload stuck at "Uploading... 0%"

This indicates Firebase Storage is not properly configured or the storage rules haven't been deployed.

## Required Actions

### 1. **Deploy Storage Rules** (CRITICAL)

The storage rules in `storage.rules` must be deployed to Firebase.

#### Option A: Firebase CLI
```bash
firebase deploy --only storage
```

#### Option B: Firebase Console (Manual)
1. Go to https://console.firebase.google.com
2. Select project: `campus-haiti`
3. Navigate to **Storage** → **Rules**
4. Copy contents of `storage.rules`
5. Paste into rules editor
6. Click **Publish**

### 2. **Verify Storage Bucket Exists**

1. Go to Firebase Console → Storage
2. Check if storage bucket exists
3. If not, click "Get Started" to create one
4. Bucket should be: `campus-haiti.appspot.com` or similar

### 3. **Check Environment Variables**

Verify in Vercel dashboard that `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` is set:

```bash
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=campus-haiti.appspot.com
```

### 4. **Test Upload with Browser Console**

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try uploading a file
4. Look for error messages:

**Common Errors:**

- `storage/unauthorized` → Storage rules not deployed or incorrect
- `storage/unknown` → Storage bucket not configured
- `Firebase Storage is not initialized` → Missing env variable
- `Storage bucket not configured` → Check Firebase config

## Storage Rules Content

The `storage.rules` file defines who can upload/download files:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can upload their own documents
    match /users/{uid}/docs/{docId} {
      allow read: if request.auth.uid == uid || request.auth.token.role == 'ADMIN';
      allow write: if request.auth.uid == uid 
                   && request.resource.size < 10 * 1024 * 1024  // 10MB max
                   && (request.resource.contentType.matches('application/pdf') ||
                       request.resource.contentType.matches('image/.*') ||
                       request.resource.contentType.matches('application/msword') ||
                       request.resource.contentType.matches('application/vnd.openxmlformats-officedocument.wordprocessingml.document'));
      allow delete: if request.auth.uid == uid || request.auth.token.role == 'ADMIN';
    }
  }
}
```

## Debugging Steps

### Step 1: Check Browser Console

After the latest update, detailed logs are added:

```
Starting upload: {file: "document.pdf", size: 123456, type: "application/pdf", path: "users/.../docs/..."}
Upload progress: 10% {bytes: 12345, total: 123456}
Upload progress: 50% ...
Upload complete, getting download URL...
Download URL obtained: https://...
Saving document metadata...
Document saved successfully
```

If you see an error, note the error code and message.

### Step 2: Verify Authentication

- User must be signed in to upload
- Check that `auth.currentUser` is not null
- Verify user has valid Firebase Auth session

### Step 3: Check Storage Configuration

The component now checks storage config on mount:

```
Firebase Storage initialized: {app: "...", bucket: "campus-haiti.appspot.com"}
```

If you see:
- `Storage bucket not configured` → Missing NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- `Firebase Storage is not initialized` → Firebase client config issue

### Step 4: Test Storage Rules

You can test storage rules directly in Firebase Console:

1. Storage → Rules
2. Click "Rules Playground"
3. Test operation: Write
4. Path: `/users/TEST_UID/docs/test.pdf`
5. Authentication: Set to your UID
6. Click "Run"

Should return: "Simulated request allowed"

## Quick Fix Checklist

- [ ] Deploy storage rules: `firebase deploy --only storage`
- [ ] Verify storage bucket exists in Firebase Console
- [ ] Check NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET env variable in Vercel
- [ ] Ensure user is signed in before uploading
- [ ] Check browser console for detailed error messages
- [ ] Verify file is < 10MB and allowed type (PDF, JPG, PNG, DOC, DOCX)
- [ ] Try with a different file/browser to rule out local issues

## Still Not Working?

If upload still fails after all checks:

1. **Check Firebase Console → Usage** 
   - Ensure you haven't hit storage quota limits

2. **Check Firebase Console → Authentication**
   - Verify user exists and is properly authenticated

3. **Review Browser Network Tab**
   - Look for failed requests to `firebasestorage.googleapis.com`
   - Check response for detailed error info

4. **Test with Firebase Emulator** (if available)
   - Rules Firebase Storage emulator to test locally

## Expected Behavior

When working correctly:

1. Select file → See preview
2. Click "Upload Document"
3. Progress bar shows 0% → 100%
4. "Document saved successfully" in console
5. Document appears in list below
6. Can view/download uploaded file
