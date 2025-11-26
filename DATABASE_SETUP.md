# Database & API Setup Checklist

## ✅ Completed

### 1. **API Endpoints Created**
- ✅ `/api/admin/invite` - Send admin invitations (POST, GET)
- ✅ `/api/admin/invite/accept` - Accept invitations (POST)
- ✅ `/api/admin/access` - List/update admin access levels (GET, PATCH)
- ✅ `/api/admin/stats` - Platform statistics (GET)
- ✅ `/api/admin/set-role` - Legacy role setter (POST)
- ✅ `/api/auth/session` - Create session cookies (POST)
- ✅ `/api/auth/redirect` - Get role-based redirect URL (GET)
- ✅ `/api/auth/health` - Diagnostics (GET)
- ✅ `/api/schools/team` - School team management (GET, POST)
- ✅ `/api/schools/team/accept` - Accept team invitations (POST)

### 2. **Authentication & Authorization**
- ✅ All admin endpoints check for ADMIN role
- ✅ Session cookie verification via Firebase Admin
- ✅ Role-based access control (ADMIN, SCHOOL_ADMIN, APPLICANT)
- ✅ Helper functions: `getServerUser()`, `requireRole()`, `hasFullAdminAccess()`, `requireFullAdminAccess()`

### 3. **Firestore Security Rules**
- ✅ Rules file created: `firestore.rules`
- ✅ Collections secured:
  - `users`, `profiles` - Own data + admin access
  - `universities`, `programs` - Public read, admin/school admin write
  - `applications`, `applicationItems` - Own data + admin/reviewer access
  - `adminAccess` - Admin read only, server write
  - `adminInvitations` - Admin read only, server write
  - `teamInvitations` - Own email + admin read, server write
  - `platformSettings` - Read all, server write only

### 4. **Firestore Indexes**
- ✅ Indexes file created: `firestore.indexes.json`
- ✅ Composite indexes defined for:
  - Admin invitations (email+status, status+createdAt, token+status)
  - Admin access (grantedAt)
  - Team invitations (token+status, universityId+status)
  - Universities (slug)
  - Applications (programId+status, applicantUid+createdAt)

### 5. **Configuration Files**
- ✅ `firebase.json` - Firebase project configuration
- ✅ `FIRESTORE_DEPLOYMENT.md` - Deployment instructions

## 🔄 Action Required: Deploy to Firebase

### **CRITICAL: Deploy Firestore Rules & Indexes**

The security rules and indexes are defined but **NOT YET DEPLOYED** to Firebase.

#### Option 1: Firebase CLI (Recommended)
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy rules and indexes
firebase deploy --only firestore
```

#### Option 2: Firebase Console (Manual)

**Deploy Rules:**
1. Go to https://console.firebase.google.com
2. Select project: `campus-haiti`
3. Firestore Database → Rules
4. Copy contents of `firestore.rules`
5. Paste and click **Publish**

**Deploy Indexes:**
1. Firestore Database → Indexes
2. Click **Create Index** for each index in `firestore.indexes.json`
3. Wait for indexes to build (may take a few minutes)

### **Without deployment:**
- ❌ Security rules won't protect data
- ❌ Queries may fail with "missing index" errors
- ❌ Anyone could potentially read/write data

## 📋 Database Collections

### Required Collections (Auto-created by API):
- `users` - User profiles and roles
- `profiles` - Extended user information
- `universities` - School/university data
- `programs` - Academic programs
- `applications` - Student applications
- `applicationItems` - Application submissions
- `adminAccess` - Admin user access levels (VIEWER/ADMIN)
- `adminInvitations` - Pending admin invitations
- `teamInvitations` - Pending school team invitations
- `platformSettings` - Global platform configuration

### Initial Setup Required:

#### 1. Create First Admin (One-time setup)
Since the invitation system requires an existing admin to invite others, you need to bootstrap the first admin:

**Option A: Use emergency endpoint (temporary)**
```bash
curl -X POST https://campushaiti.org/api/admin/set-role \
  -H "Content-Type: application/json" \
  -d '{"email":"info@dlight.org","role":"ADMIN"}'
```

**Option B: Firebase Console**
1. Go to Authentication → Users
2. Find user with email `info@dlight.org`
3. Copy the UID
4. Go to Firestore Database
5. Create document in `adminAccess` collection:
   - Document ID: `<paste-uid>`
   - Fields:
     ```json
     {
       "uid": "<paste-uid>",
       "email": "info@dlight.org",
       "name": "Admin",
       "role": "ADMIN",
       "grantedAt": <current-timestamp>,
       "grantedBy": "system"
     }
     ```
6. Set custom claims in Firebase Console or via script

#### 2. Sign out and sign back in
After setting the first admin, they must sign out and sign back in for the role to take effect.

## 🧪 Testing Checklist

After deployment, test:

- [ ] Admin can access `/admin` dashboard
- [ ] Admin can send invitations
- [ ] Invited user receives email
- [ ] Invited user can accept and gets VIEWER access
- [ ] VIEWER admin can view dashboard but cannot modify
- [ ] Full ADMIN can upgrade VIEWER to ADMIN
- [ ] School admins can manage their schools via team invitations
- [ ] Non-admins get 401/403 errors on admin endpoints

## 🔒 Security Notes

1. **VIEWER vs ADMIN Access:**
   - VIEWER: Read-only access to admin dashboard
   - ADMIN: Full platform administration capabilities

2. **Role Assignment:**
   - Platform ADMIN: Via invitation system
   - SCHOOL_ADMIN: Via school team invitations
   - APPLICANT: Default on signup

3. **Protected Endpoints:**
   - All `/api/admin/*` endpoints require ADMIN role
   - Some operations require full ADMIN access (not just VIEWER)
   - School operations require SCHOOL_ADMIN for specific school

## 📝 Next Steps

1. **Deploy Firestore rules and indexes** (see above)
2. **Create first admin** via emergency endpoint or console
3. **Test invitation flow** with a second admin account
4. **Remove emergency endpoint** (`/api/admin/set-role`) after setup
5. **Monitor logs** for any missing index errors
6. **Verify security** by attempting unauthorized access
