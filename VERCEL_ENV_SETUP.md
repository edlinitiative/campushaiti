# Quick Vercel Environment Variables Setup

## Firebase Client Variables (Required)

Go to your Vercel Dashboard → Project Settings → Environment Variables:
https://vercel.com/edlinitiative/campushaiti/settings/environment-variables

Add these variables (get them from Firebase Console → Project Settings → General → Your apps):

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Firebase Admin Variables (Required for API routes)

Get these from Firebase Console → Project Settings → Service Accounts → Generate New Private Key:

```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Long_Private_Key_Here\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
```

**IMPORTANT for FIREBASE_PRIVATE_KEY:**
- Keep the quotes around it
- Keep the `\n` characters (don't replace with actual newlines)
- Copy the entire key from the downloaded JSON file

## Stripe Variables (Optional - for payments)

```bash
STRIPE_SECRET_KEY=sk_test_... (or sk_live_... for production)
STRIPE_PUBLISHABLE_KEY=pk_test_... (or pk_live_... for production)
STRIPE_WEBHOOK_SECRET=whsec_... (get after setting up webhook)
```

## Resend Variables (Optional - for emails)

```bash
RESEND_API_KEY=re_...
```

## After Adding Variables

1. Save each variable
2. Make sure they're set for "Production", "Preview", and "Development"
3. **Redeploy** - Vercel needs to rebuild with the new env vars:
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"

---

## How to Get Firebase Credentials

### Client Config (NEXT_PUBLIC_* variables):

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the ⚙️ gear icon → Project Settings
4. Scroll down to "Your apps" section
5. If no app exists, click "Add app" → Web (</>) 
6. Copy the config values from `firebaseConfig` object

### Admin Config (FIREBASE_* variables):

1. In Firebase Console → Project Settings
2. Go to "Service Accounts" tab
3. Click "Generate New Private Key"
4. Download the JSON file
5. Use values from the JSON:
   - `project_id` → FIREBASE_PROJECT_ID
   - `client_email` → FIREBASE_CLIENT_EMAIL
   - `private_key` → FIREBASE_PRIVATE_KEY (keep the `\n` characters!)
   - For FIREBASE_STORAGE_BUCKET, use: `your-project-id.appspot.com`

---

## Verification

After redeploying with environment variables:

✅ The site should load without Firebase errors
✅ You should see the homepage with navigation
✅ Locale switcher (en/fr/ht) should work
✅ Pages should load properly

The Firebase errors will disappear once you add the environment variables and redeploy! 🔥
