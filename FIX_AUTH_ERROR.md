# Fix Firebase Auth Configuration Error

## Error: `auth/configuration-not-found`

This means Firebase Authentication is not properly configured for your project.

## Steps to Fix:

### 1. Enable Email/Password Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Authentication** in left sidebar
4. Click **Get Started** (if first time)
5. Go to **Sign-in method** tab
6. Click **Email/Password**
7. **Enable** the first toggle (Email/Password)
8. Click **Save**

### 2. Add Authorized Domains

1. Still in **Authentication** → **Settings** tab
2. Scroll to **Authorized domains** section
3. Click **Add domain**
4. Add your Vercel domain:
   ```
   campushaiti.vercel.app
   ```
5. Also add any preview domains if needed:
   ```
   *.vercel.app
   ```
6. Click **Add**

### 3. Configure Email Link Sign-in (Required for this app)

1. In **Authentication** → **Sign-in method**
2. Click **Email/Password** (should already be enabled)
3. Make sure **Email link (passwordless sign-in)** is **enabled**
4. Click **Save**

### 4. Test the Fix

1. Go back to: https://campushaiti.vercel.app/en/auth/signin
2. Try signing in with email
3. The error should be gone!

---

## Additional Setup (Optional but Recommended)

### Enable Email Templates Customization

1. In **Authentication** → **Templates**
2. Customize the email verification template
3. Make sure the action URL points to your domain

### Set up Firebase Security Rules (Already in repo)

The security rules are already in your repo (`firestore.rules` and `storage.rules`).

Deploy them:
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

Or from Firebase Console → Firestore Database → Rules → Copy from `firestore.rules` file

---

**After completing these steps, authentication should work!** 🔥
