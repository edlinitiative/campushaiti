# Deployment Guide for School Portal

## 1. Deploy Firestore Security Rules

The updated security rules in `firestore.rules` need to be deployed to Firebase:

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy only security rules
firebase deploy --only firestore:rules
```

**Important**: The new rules include:
- School admin access controls
- University registration permissions
- Enhanced application item permissions
- Custom question access rules

## 2. Environment Variables

Add these environment variables in Vercel dashboard:

### Stripe Connect (Required for payment features)
```
STRIPE_CONNECT_CLIENT_ID=ca_xxxxx
NEXT_PUBLIC_APP_URL=https://campushaiti.org
```

The existing Stripe variables should already be set:
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Verify Existing Firebase Variables
Ensure these are set (should already be configured):
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Firebase Admin SDK credentials (already configured):
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

## 3. Stripe Connect Setup

### Get Stripe Connect Client ID:
1. Go to https://dashboard.stripe.com/settings/applications
2. Create or view your Connect platform application
3. Copy the Client ID (starts with `ca_`)
4. Add to Vercel environment variables as `STRIPE_CONNECT_CLIENT_ID`

### Configure OAuth Redirect URI:
1. In Stripe Dashboard → Settings → Connect → Integration
2. Add redirect URI: `https://campushaiti.vercel.app/api/payments/stripe/callback`
3. For local testing: `http://localhost:3000/api/payments/stripe/callback`

## 4. Email Configuration (Optional but Recommended)

To send registration approval/rejection emails, configure an email service:

### Using SendGrid (recommended):
```bash
# Add to Vercel environment variables
SENDGRID_API_KEY=SG.xxxxx
FROM_EMAIL=noreply@campushaiti.com
```

### Using Nodemailer with Gmail:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@campushaiti.com
```

## 5. Post-Deployment Verification

### Test the workflow:
1. Visit `/schools/register` and submit a test university registration
2. Login as admin at `/admin/universities`
3. Approve the test registration
4. Verify:
   - University created in Firestore
   - School admin user created with SCHOOL_ADMIN role
   - User can login and access `/schools/dashboard`

### Check logs:
```bash
# View Vercel deployment logs
vercel logs --follow

# Check for:
# - Successful university approvals
# - User creation logs
# - Stripe Connect OAuth flows
```

## 6. Monitoring

### Firestore Indexes
Some queries may require composite indexes. If you see errors like "requires an index", Firebase will provide a link to create the index automatically.

Common indexes needed:
- `universityRegistrations`: (status, submittedAt DESC)
- `applicationItems`: (universityId, status, createdAt DESC)
- `programs`: (universityId, createdAt DESC)

### Error Tracking
Consider adding error tracking service:
- Sentry
- LogRocket
- Datadog

## 7. Security Checklist

- [ ] Firestore rules deployed
- [ ] All environment variables set in Vercel
- [ ] Stripe Connect OAuth redirect URI configured
- [ ] Test user registration and approval flow
- [ ] Verify school admin can only access their university
- [ ] Test application filtering by university
- [ ] Verify custom questions save/load correctly
- [ ] Test Stripe Connect OAuth flow

## 8. Performance Optimization

### Enable Firestore Caching:
Already configured in the app, but verify cache settings are appropriate.

### Add CDN for Images:
Consider using Cloudinary or imgix for university logos and application documents.

### Enable Edge Functions:
Some API routes can be deployed to Edge for faster response times.

## 9. Backup Strategy

### Firestore Backups:
```bash
# Manual backup
gcloud firestore export gs://[BUCKET_NAME]

# Schedule daily backups in Firebase Console
# Settings → Backups
```

### Database Exports:
Set up scheduled exports for compliance and disaster recovery.

## 10. Monitoring & Alerts

Set up alerts for:
- Failed university approvals
- Stripe Connect errors
- High error rates in API routes
- Unusual registration patterns

Use Firebase Cloud Monitoring or integrate with your preferred monitoring solution.

---

## 11. University Portal - New Features (Phases 1-7)

The University Admin Portal has been enhanced with 7 major phases. All code is committed and ready for deployment.

### Phase Commits:
- Phase 1: `0c28fdb` - Enhanced Data Model & Roles
- Phase 2: `2bebfbb` - Application Kanban Board
- Phase 3: `fb93441` - Application Detail Page
- Phase 4: `ba1cdf0` - Message Templates
- Phase 5: `fd7e256` - Payment Management
- Phase 6: `8fd3b21` - Enhanced Analytics
- Phase 7: `7c21f73` - Security & Testing

### New Collections Verify:
Check Firestore for these new structures:

**Staff Subcollection**:
```
universities/{universityId}/staff/{userId}
  - role: "UNI_ADMIN" | "UNI_REVIEWER" | "UNI_FINANCE" | "UNI_VIEWER"
  - permissions: string[]
  - createdAt: Timestamp
```

**Application Subcollections**:
```
applicationItems/{applicationId}/documents/{docId}
applicationItems/{applicationId}/notes/{noteId}
applicationItems/{applicationId}/timeline/{eventId}
```

**Message Templates**:
```
messageTemplates/{templateId}
  - universityId: string
  - type: "missing_docs" | "interview" | "acceptance" | "rejection" | "general"
  - name: string
  - subject: string
  - body: string (with {{variables}})
```

### Testing New Features:

**1. Application Kanban Board**:
- Navigate to `/schools/dashboard/pipeline`
- Verify drag-and-drop works between status columns
- Test bulk reviewer assignment

**2. Application Detail Page**:
- Click any application card
- Verify 4 tabs load: Overview, Documents, Notes, Timeline
- Test document approve/reject
- Add internal and external notes
- Check timeline shows all events

**3. Message Templates**:
- Navigate to `/schools/dashboard/templates`
- Create new template with variables like `{{studentName}}`
- Verify live preview works
- Test duplicate and delete

**4. Payment Management**:
- Navigate to `/schools/dashboard/payments`
- Verify payment table with filters
- Test CSV export
- Update payment status

**5. Analytics Dashboard**:
- Navigate to `/schools/dashboard/analytics`
- Verify 8 KPI cards display
- Check funnel chart renders
- Test program performance table
- Export analytics CSV

### Security Verification:

**Permission Checks**:
```bash
# Test as UNI_REVIEWER (should NOT be able to delete)
# Test as UNI_FINANCE (should ONLY update payments)
# Test as UNI_VIEWER (should be read-only)
```

**Firestore Rules**:
- Staff subcollection secured ✅
- Timeline events immutable ✅
- Internal notes hidden from students ✅
- Payment updates restricted ✅
- Analytics require university access ✅

### New API Endpoints:
All endpoints require session authentication and university access verification:
- `/api/uni/permissions` - Get user role/permissions
- `/api/uni/applications/[id]/status` - Update application status
- `/api/uni/applications/bulk-assign` - Bulk assign reviewer
- `/api/uni/applications/[id]/documents/[docId]` - Document CRUD
- `/api/uni/applications/[id]/notes` - Notes CRUD
- `/api/uni/templates` - Template list/create
- `/api/uni/templates/[id]` - Template CRUD
- `/api/uni/templates/[id]/duplicate` - Clone template
- `/api/uni/payments/[id]` - Payment status updates
- `/api/uni/analytics/overview` - Dashboard KPIs
- `/api/uni/analytics/funnel` - Application funnel
- `/api/uni/analytics/programs` - Program performance

### Documentation for Users:

After deployment, share these guides with university staff:
- **User Guide**: `/UNIVERSITY_ADMIN_GUIDE.md` - Complete feature walkthrough
- **Security Checklist**: `/SECURITY_TESTING.md` - Testing procedures
- **Implementation Summary**: `/IMPLEMENTATION_SUMMARY.md` - Technical overview

### Post-Deployment Checklist:

University Portal specific:
- [ ] Verify Firestore rules deployed (includes new subcollections)
- [ ] Add at least one staff member to test university's staff subcollection
- [ ] Create test application with documents
- [ ] Test kanban drag-and-drop
- [ ] Test template creation and preview
- [ ] Test payment status updates
- [ ] Verify analytics display correctly
- [ ] Test all 4 roles (ADMIN, REVIEWER, FINANCE, VIEWER)
- [ ] Verify timeline events are immutable
- [ ] Check internal notes hidden from students
- [ ] Test CSV exports (payments and analytics)

---
