# Deployment Guide

## Prerequisites

- Firebase project with Authentication, Firestore, and Storage enabled
- Stripe account (test mode is fine for development)
- Resend account for email
- (Optional) MonCash credentials for Haiti-specific payments
- Vercel account (recommended for deployment)

## Step 1: Firebase Setup

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Follow the setup wizard
4. Enable Google Analytics (optional)

### 1.2 Enable Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** provider
3. Configure authorized domains (add your Vercel domain when deployed)

### 1.3 Create Firestore Database

1. Go to **Firestore Database** → **Create database**
2. Choose production mode
3. Select a region close to Haiti (us-east1 recommended)

### 1.4 Enable Storage

1. Go to **Storage** → **Get started**
2. Use default security rules (we'll override them)

### 1.5 Deploy Security Rules

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Select:
# - Firestore (rules and indexes)
# - Storage (rules)

# Deploy rules
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

### 1.6 Get Firebase Credentials

**Client Credentials** (for `.env.local`):
1. Go to **Project Settings** → **General**
2. Scroll to "Your apps" → Click web icon
3. Copy the config values

**Admin Credentials** (for `.env.local`):
1. Go to **Project Settings** → **Service Accounts**
2. Click "Generate new private key"
3. Download the JSON file
4. Extract values for `.env.local`:
   - `FIREBASE_PROJECT_ID`: `project_id` from JSON
   - `FIREBASE_CLIENT_EMAIL`: `client_email` from JSON
   - `FIREBASE_PRIVATE_KEY`: `private_key` from JSON (keep the `\n` characters)

## Step 2: Stripe Setup

1. Sign up at [Stripe](https://stripe.com)
2. Go to **Developers** → **API keys**
3. Copy:
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY`

### 2.1 Webhook Setup

1. Install Stripe CLI: [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
2. For local development:
   ```bash
   stripe listen --forward-to localhost:3000/api/payments/stripe/webhook
   ```
3. For production (in Stripe Dashboard):
   - Go to **Developers** → **Webhooks**
   - Click "Add endpoint"
   - URL: `https://your-domain.vercel.app/api/payments/stripe/webhook`
   - Events to listen to: `checkout.session.completed`
   - Copy the webhook secret → `STRIPE_WEBHOOK_SECRET`

## Step 3: Resend Setup

1. Sign up at [Resend](https://resend.com)
2. Create an API key
3. Copy the key → `RESEND_API_KEY`
4. Verify your domain (required for production)

## Step 4: MonCash Setup (Optional)

1. Contact MonCash for API credentials
2. Use sandbox credentials for testing
3. Add to `.env.local`:
   - `MONCASH_CLIENT_ID`
   - `MONCASH_CLIENT_SECRET`
   - `MONCASH_BASE_URL` (sandbox or production URL)

## Step 5: Environment Variables

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Fill in all values from previous steps.

## Step 6: Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Step 7: Deploy to Vercel

### 7.1 Connect Repository

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "Import Project"
4. Select your repository

### 7.2 Configure Environment Variables

In Vercel project settings:
1. Go to **Settings** → **Environment Variables**
2. Add all variables from `.env.local`
3. Make sure to select appropriate environments (Production, Preview, Development)

### 7.3 Deploy

```bash
# Using Vercel CLI
npm i -g vercel
vercel

# Or push to GitHub (automatic deployment)
git push origin main
```

## Step 8: Post-Deployment

### 8.1 Update Firebase Authorized Domains

1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Add your Vercel domain (e.g., `your-app.vercel.app`)

### 8.2 Update Stripe Webhook

1. Create production webhook in Stripe Dashboard
2. Point to: `https://your-domain.vercel.app/api/payments/stripe/webhook`
3. Update `STRIPE_WEBHOOK_SECRET` in Vercel environment variables

### 8.3 Configure Resend Domain

1. Add and verify your domain in Resend
2. Update email templates with your domain

## Step 9: Set Up Admin User

To create an admin user:

1. Sign up normally through the app
2. Use Firebase Console to set custom claims:
   ```javascript
   // In Firebase Console → Firestore → users collection
   // Or use Firebase Admin SDK
   admin.auth().setCustomUserClaims(uid, { role: 'ADMIN' })
   ```
3. Or create a script:
   ```typescript
   // scripts/create-admin.ts
   import { adminAuth } from './lib/firebase/admin';
   
   await adminAuth.setCustomUserClaims('USER_UID_HERE', { 
     role: 'ADMIN' 
   });
   ```

## Troubleshooting

### Build Errors

- Check all environment variables are set in Vercel
- Ensure Firebase credentials are properly formatted
- Run `npm run typecheck` and `npm run lint` locally

### Authentication Issues

- Verify Firebase authorized domains include your Vercel domain
- Check email link configuration in Firebase Authentication settings
- Ensure session cookies are set with correct domain

### Payment Webhook Issues

- Verify webhook URL in Stripe Dashboard
- Check webhook secret matches environment variable
- Use Stripe CLI to test locally: `stripe listen --forward-to`

### Email Delivery Issues

- Verify domain in Resend
- Check API key is valid
- Review Resend logs for delivery status

## Monitoring

- **Firebase Console**: Monitor authentication, database usage, storage
- **Vercel Analytics**: Track performance and usage
- **Stripe Dashboard**: Monitor payments and disputes
- **Resend Dashboard**: Track email delivery

## Security Checklist

- ✅ Firebase security rules deployed
- ✅ Storage security rules deployed
- ✅ Environment variables secured in Vercel
- ✅ Stripe webhook signature verification enabled
- ✅ Email domain verified in Resend
- ✅ Rate limiting configured (consider using Vercel Edge Config)
- ✅ HTTPS enabled (automatic with Vercel)
- ✅ CORS properly configured

## Backup Strategy

- **Firestore**: Enable automated backups in Firebase Console
- **Storage**: Use Firebase Storage buckets with retention policies
- **Code**: GitHub repository with protected main branch
- **Secrets**: Store backup of environment variables securely

## Scaling Considerations

- Monitor Firebase usage and upgrade plan as needed
- Consider Firebase Extensions for additional functionality
- Use Vercel Pro plan for higher limits and better performance
- Implement caching strategies for frequently accessed data
- Use Firestore composite indexes for complex queries

## Support

For deployment issues:
- Check Vercel deployment logs
- Review Firebase Console logs
- Check Stripe webhook logs
- Contact support if needed
