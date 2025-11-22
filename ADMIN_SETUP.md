# Creating Your First Admin User

Since the Firestore database is empty, you need to create your admin user manually.

## Option 1: Via Firebase Console (Easiest)

### Step 1: Create User in Firebase Auth
1. Go to **Firebase Console** > **Authentication** > **Users**
2. Click **Add User**
3. Enter your email and password
4. Click **Add User**
5. **Copy the User UID** (you'll need this)

### Step 2: Create User Document in Firestore
1. Go to **Firebase Console** > **Firestore Database**
2. Click **Start collection**
3. Collection ID: `users`
4. Document ID: **Paste the UID from Step 1**
5. Add these fields:

```
email: "your-email@example.com"  (string)
displayName: "Your Name"          (string)
role: "ADMIN"                     (string)
createdAt: 1732313600000         (number) - use current timestamp
emailVerified: true               (boolean)
```

6. Click **Save**

### Step 3: Create Profile Document
1. In Firestore, click **Start collection** (or add to existing)
2. Collection ID: `profiles`
3. Document ID: **Same UID from Step 1**
4. Add these fields:

```
uid: "your-uid-here"             (string) - same as document ID
email: "your-email@example.com"  (string)
fullName: "Your Name"            (string)
role: "ADMIN"                    (string)
createdAt: 1732313600000        (number) - use current timestamp
updatedAt: 1732313600000        (number) - use current timestamp
```

5. Click **Save**

### Step 4: Sign In
1. Go to your app: http://localhost:3000/auth/signin
2. Sign in with the email and password you created
3. You should now have admin access!

---

## Option 2: Via API (If server is running)

Run this command (replace with your details):

```bash
curl -X POST http://localhost:3000/api/setup/admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "YourSecurePassword123!",
    "fullName": "Your Name"
  }'
```

---

## Quick Reference: Current Timestamp

Current timestamp in milliseconds: `Date.now()` in browser console
Or use: **1732313600000** (approximate current time)

---

## After Setup

Once you can sign in as admin:
1. Delete `/app/api/setup/admin/route.ts` for security
2. All admin features will work
3. You can create more users through the admin panel
