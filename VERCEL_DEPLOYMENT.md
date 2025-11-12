# Vercel Deployment Guide

## ✅ Project Status

The project is **ready for Vercel deployment**. Build tested successfully with `npm run build`.

## Quick Deploy Steps

### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import `edlinitiative/campushaiti` repository
4. Vercel will auto-detect Next.js configuration

### 2. Configure Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

**Firebase Client (Public):**
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Firebase Admin (Server):**
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Key_Here\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
```

**Stripe:**
```
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

**Resend:**
```
RESEND_API_KEY=re_xxxxx
```

**MonCash (Optional):**
```
MONCASH_CLIENT_ID=your_client_id
MONCASH_CLIENT_SECRET=your_client_secret
```

**Important:** For `FIREBASE_PRIVATE_KEY`, copy the entire key including `\n` characters from your service account JSON.

### 3. Deploy

Click "Deploy" - Vercel will:
- Install dependencies
- Run `npm run build`
- Deploy to production

### 4. Post-Deployment

1. **Update Firebase Auth Domain:**
   - Go to Firebase Console → Authentication → Settings
   - Add your Vercel domain to "Authorized domains"
   - Example: `campus-haiti.vercel.app`

2. **Configure Stripe Webhook:**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://your-vercel-url.vercel.app/api/payments/stripe/webhook`
   - Select event: `checkout.session.completed`
   - Copy webhook secret to Vercel environment variables
   - Redeploy

3. **Test Deployment:**
   - Visit `https://your-vercel-url.vercel.app`
   - Should redirect to `/en` (default locale)
   - Test locale switching (en/fr/ht)
   - Test sign-in flow

## Build Configuration

The project uses:
- ✅ `next.config.mjs` - Configured with next-intl plugin
- ✅ `vercel.json` - Framework detection and build commands
- ✅ Lazy-loaded Firebase Admin SDK (no build-time errors)
- ✅ Lazy-loaded Stripe SDK (no build-time errors)
- ✅ ESLint warnings (don't block build)

## Troubleshooting

### Build Fails with Firebase Error
- Ensure all Firebase environment variables are set in Vercel
- Check `FIREBASE_PRIVATE_KEY` includes `\n` characters

### Locale Routing Not Working
- Verify `middleware.ts` is in root directory
- Check Vercel logs for middleware errors

### Stripe Webhook Not Working
- Verify webhook endpoint URL matches your Vercel deployment
- Check webhook secret is correctly set
- View webhook logs in Stripe Dashboard

### 404 on Root Path
- Next.js should auto-redirect `/` to `/en`
- If not, check middleware configuration

## Performance Optimization

### After First Deploy:

1. **Enable Vercel Analytics:**
   - Dashboard → Analytics → Enable

2. **Configure Caching:**
   - API routes cache automatically via Vercel Edge
   - Static pages are pre-rendered

3. **Monitor Build Time:**
   - Current: ~30-60 seconds
   - Optimize imports if needed

## Environment-Specific Configs

### Production
- Use production Firebase project
- Use live Stripe keys (not test)
- Enable Stripe webhook

### Preview/Staging
- Use separate Firebase project
- Keep test Stripe keys
- Different webhook endpoint

### Development
- Local `.env.local` file
- Use Firebase emulators (optional)
- Stripe CLI for webhooks

## Next Steps

1. Deploy to Vercel ✅
2. Configure environment variables
3. Update Firebase authorized domains
4. Set up Stripe webhook
5. Test application flow
6. Seed database with universities
7. Create first admin user
8. Launch! 🚀

---

**Need help?** Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed Firebase/Stripe setup instructions.
