# Subdomain-Based Multi-Tenancy Setup

## Overview

Campus Haiti uses subdomain-based multi-tenancy to give each university their own dedicated portal:

```
quisqueya.campushaiti.app     → Université Quisqueya portal
ueh.campushaiti.app           → Université d'État d'Haïti portal  
mit-haiti.campushaiti.app     → MIT Haiti portal
www.campushaiti.app           → Main platform (student applications)
```

## Benefits

- **Professional Branding**: Each school has their own URL
- **Clear Separation**: No confusion about which school you're managing
- **Scalable**: Works for 1000+ universities
- **Simple Access**: Bookmark your school's URL and go directly there
- **Team Sharing**: Easy to share portal URL with team members

## How It Works

### 1. Subdomain Detection (Middleware)

The middleware automatically detects which school subdomain is being accessed:

```typescript
// middleware.ts
const subdomain = getSubdomain(hostname);
// e.g., "quisqueya" from "quisqueya.campushaiti.app"
```

### 2. University Lookup (API Routes)

API routes use the subdomain to find the correct university:

```typescript
// Before (old approach - limited to one school per user)
.where("adminUids", "array-contains", userId)
.limit(1)

// After (subdomain approach - access any school you're authorized for)
.where("slug", "==", subdomain)
.limit(1)
```

### 3. Permission Verification

Even with subdomain routing, we still verify you have permission:

```typescript
// Check if user is in this university's adminUids
if (!university.adminUids?.includes(userId)) {
  return 403; // Forbidden
}
```

## Production Setup (Vercel)

### Step 1: Add Wildcard Domain to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Domains**
4. Click **Add Domain**
5. Enter: `*.campushaiti.app`
6. Vercel will provide DNS configuration instructions

### Step 2: Configure DNS Provider

Add this record to your DNS provider (where you bought campushaiti.app):

```
Type:  CNAME
Name:  *
Value: cname.vercel-dns.com
TTL:   Auto or 3600
```

**Common DNS Providers:**
- **Namecheap**: Hosts Records → Add → Type: CNAME Alias
- **GoDaddy**: DNS Management → Add → Type: CNAME
- **Cloudflare**: DNS → Add Record → Type: CNAME
- **Google Domains**: DNS → Custom records → CNAME

### Step 3: Wait for DNS Propagation

- Typically takes 5-60 minutes
- Can take up to 48 hours in rare cases
- Check status: `nslookup quisqueya.campushaiti.app`

### Step 4: Verify SSL Certificates

Vercel automatically provisions SSL certificates for all subdomains. Verify:

1. Go to Settings → Domains in Vercel
2. Check that `*.campushaiti.app` shows as **Valid**
3. Test: `https://test-school.campushaiti.app` (should redirect to app)

## Local Development Setup

### Option 1: Use localhost Subdomains (Recommended)

Modern browsers support `*.localhost` without configuration:

```bash
# These work automatically:
http://quisqueya.localhost:3000
http://ueh.localhost:3000
```

Just start your dev server and access school portals at their subdomain.

### Option 2: Edit Hosts File (Alternative)

If you need custom local domains:

**Mac/Linux:**
```bash
sudo nano /etc/hosts
```

**Windows:**
```
C:\Windows\System32\drivers\etc\hosts
```

Add these lines:
```
127.0.0.1  quisqueya.localhost
127.0.0.1  ueh.localhost
127.0.0.1  mit-haiti.localhost
```

### Environment Variables

Update your `.env.local`:

```bash
# For production
NEXT_PUBLIC_ROOT_DOMAIN=campushaiti.app
NEXT_PUBLIC_APP_URL=https://www.campushaiti.app

# For local development
NEXT_PUBLIC_ROOT_DOMAIN=localhost
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Testing Subdomain Routing

### 1. Test Subdomain Detection

```bash
# Should return "quisqueya"
curl http://quisqueya.localhost:3000/api/test-subdomain
```

### 2. Test University Lookup

Create a test university in Firestore:
```json
{
  "name": "Test University",
  "slug": "test-uni",
  "adminUids": ["your-user-id"],
  "status": "APPROVED"
}
```

Then access: `http://test-uni.localhost:3000/dashboard`

### 3. Test Permission Checks

Try accessing a school you're NOT an admin of:
```bash
# Should return 403 Forbidden
curl http://other-school.localhost:3000/api/schools/university
```

## URL Structure

### Main Platform (www)
```
www.campushaiti.app/             → Homepage
www.campushaiti.app/apply        → Student application flow
www.campushaiti.app/partners     → Partner schools
www.campushaiti.app/admin        → Platform admin portal
```

### School Subdomains
```
quisqueya.campushaiti.app/dashboard      → School dashboard
quisqueya.campushaiti.app/applications   → View applications
quisqueya.campushaiti.app/programs       → Manage programs
quisqueya.campushaiti.app/team           → Team management
quisqueya.campushaiti.app/settings       → School settings
```

Note: The `/schools` prefix is removed when using subdomains!

## Migration from Old System

If you have existing schools using the old `/schools/dashboard` approach:

### 1. Redirect Old URLs (Optional)

Add redirects in `next.config.js`:

```javascript
async redirects() {
  return [
    {
      source: '/schools/dashboard',
      destination: '/', // Or show a "select your school" page
      permanent: false,
    },
  ];
}
```

### 2. Email Existing Schools

Send each school their new subdomain URL:

```
Subject: Your New Direct Portal Access

Hi [School Name],

You now have a dedicated portal URL:
https://[slug].campushaiti.app/dashboard

This is your school's private portal. Bookmark it and share with your team!
```

### 3. Update All Email Templates

✅ Already done! Email functions now use subdomain URLs:

```typescript
sendUniversityApprovedEmail({
  universitySlug: "quisqueya", // Generates quisqueya.campushaiti.app
});
```

## Troubleshooting

### "No school subdomain detected"

**Cause**: Accessing from main domain instead of school subdomain

**Solution**: 
- ✅ Use: `quisqueya.campushaiti.app/dashboard`
- ❌ Not: `www.campushaiti.app/schools/dashboard`

### "University not found for this subdomain"

**Cause**: University slug doesn't match subdomain

**Solution**: Check Firestore - make sure `slug` field matches subdomain:
```javascript
// Subdomain: quisqueya.campushaiti.app
// Firestore universities collection:
{
  "slug": "quisqueya",  // Must match!
  "name": "Université Quisqueya"
}
```

### "Forbidden" error even though you're an admin

**Cause**: Your user ID not in university's `adminUids` array

**Solution**: Update the university document:
```javascript
adminUids: ["your-user-id", "other-admin-id"]
```

### Subdomain works locally but not in production

**Checklist**:
1. ✅ Wildcard domain added to Vercel?
2. ✅ DNS CNAME record configured?
3. ✅ Waited for DNS propagation? (Use `nslookup`)
4. ✅ Environment variables set correctly?

### SSL/HTTPS errors

Vercel handles SSL automatically. If you see SSL errors:
1. Wait 10-15 minutes (certificate provisioning)
2. Check Vercel Dashboard → Domains for status
3. Try hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

## Reserved Subdomains

These subdomains are reserved and cannot be used for schools:

- `www` - Main platform
- `admin` - Platform admin (if needed)
- `api` - API endpoints (if needed)
- `app` - General app access
- `staging` - Staging environment
- `dev` - Development environment
- `test` - Testing

If a school tries to register a slug matching a reserved subdomain, show an error.

## Security Considerations

### 1. Subdomain Validation

The `getSubdomain()` function validates that subdomains:
- Only contain lowercase letters, numbers, and hyphens
- Don't match reserved keywords
- Are properly formatted

### 2. Permission Checks

Even with subdomain routing, ALWAYS verify:
```typescript
// GOOD ✅
if (!university.adminUids?.includes(userId)) {
  return 403;
}

// BAD ❌ - Never trust subdomain alone!
// Just because URL is correct doesn't mean user has access
```

### 3. SQL Injection Protection

Firestore queries are safe from injection, but always validate slugs:

```typescript
if (!isValidSchoolSlug(slug)) {
  return 400; // Bad request
}
```

## Performance Optimization

### 1. Cache University Data

Since subdomain doesn't change per request:

```typescript
// Consider caching university lookups
const cacheKey = `university:${slug}`;
// Use Redis, Vercel KV, or in-memory cache
```

### 2. Index Firestore Queries

Create Firestore index:
- Collection: `universities`
- Fields: `slug` (Ascending)

This makes subdomain lookups instant.

## Future Enhancements

Potential improvements:

1. **Custom Domains**: Let schools use their own domain
   ```
   portal.quisqueya.edu.ht → quisqueya.campushaiti.app
   ```

2. **Multi-language subdomains**:
   ```
   quisqueya.campushaiti.app    → French
   quisqueya-en.campushaiti.app → English
   ```

3. **Regional subdomains**:
   ```
   ht.campushaiti.app → Haiti region
   dr.campushaiti.app → Dominican Republic
   ```

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify Firestore data structure
3. Test with `curl` to isolate frontend vs backend
4. Check browser console for errors

For DNS issues, contact your DNS provider's support.
