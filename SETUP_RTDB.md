# Quick Setup Guide - Realtime Database

## Step 1: ✅ Create Realtime Database (DONE!)
You've already created the database in Firebase Console.

## Step 2: Add Environment Variables

You need to add the database URL to your environment. The URL format is:
```
https://YOUR-PROJECT-ID-default-rtdb.firebaseio.com
```

### For Codespaces/Dev Container:
Add to your Codespaces secrets or create `.env.local`:

```bash
# In your terminal
echo 'FIREBASE_DATABASE_URL=https://YOUR-PROJECT-ID-default-rtdb.firebaseio.com' >> .env.local
echo 'NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://YOUR-PROJECT-ID-default-rtdb.firebaseio.com' >> .env.local
```

Replace `YOUR-PROJECT-ID` with your actual Firebase project ID.

### For Vercel (Production):
```bash
vercel env add FIREBASE_DATABASE_URL
# When prompted, enter: https://YOUR-PROJECT-ID-default-rtdb.firebaseio.com

vercel env add NEXT_PUBLIC_FIREBASE_DATABASE_URL  
# When prompted, enter: https://YOUR-PROJECT-ID-default-rtdb.firebaseio.com
```

## Step 3: Download Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Settings** (⚙️) → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save the file as `serviceAccountKey.json` in the project root
7. **IMPORTANT**: This file is git-ignored, never commit it!

## Step 4: Run Data Migration

```bash
node scripts/migrate-firestore-data.js
```

This will:
- Copy all data from Firestore to Realtime Database
- Convert timestamps automatically
- Preserve all document IDs

## Step 5: Deploy Security Rules

```bash
firebase deploy --only database
```

Or manually in Firebase Console:
1. Go to **Realtime Database** → **Rules**
2. Copy content from `database.rules.json`
3. Click **Publish**

## Step 6: Test Locally

```bash
npm run dev
```

Visit http://localhost:3000 and verify:
- ✓ Login works
- ✓ Data loads correctly
- ✓ Create/update operations work

## Step 7: Deploy to Production

```bash
git add -A
git commit -m "chore: Add Realtime Database environment variables"
git push origin main
```

Then deploy on Vercel (will auto-deploy if connected to GitHub).

---

## Quick Checklist

- [ ] Created Realtime Database in Firebase Console ✅ (You did this!)
- [ ] Added `FIREBASE_DATABASE_URL` to environment variables
- [ ] Added `NEXT_PUBLIC_FIREBASE_DATABASE_URL` to environment variables  
- [ ] Downloaded `serviceAccountKey.json` from Firebase
- [ ] Ran migration: `node scripts/migrate-firestore-data.js`
- [ ] Deployed security rules: `firebase deploy --only database`
- [ ] Tested locally with `npm run dev`
- [ ] Deployed to production

---

## Troubleshooting

**"Cannot load service account key"**
→ Download `serviceAccountKey.json` from Firebase Console

**"Permission denied"**
→ Deploy security rules: `firebase deploy --only database`

**"Cannot connect to database"**
→ Check `FIREBASE_DATABASE_URL` is set in environment

**"Module not found"**
→ Run `npm install firebase-admin`

---

## Need Help?

Check `REALTIME_DATABASE_MIGRATION.md` for detailed guide.
