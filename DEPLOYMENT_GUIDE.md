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
NEXT_PUBLIC_APP_URL=https://campushaiti.vercel.app
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
