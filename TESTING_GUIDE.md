# Testing Guide - Public University Pages

## Recent Changes Deployed (Commit 81f528b)

### What Was Changed
1. **Public Home Pages**: Each university subdomain now has a public-facing home page
2. **Public API Endpoints**: Added `/api/schools/public/university` and `/api/schools/public/programs`
3. **Middleware Update**: School subdomain root now routes to `/home` instead of `/dashboard`

---

## Testing Checklist

### 1. Public Home Page Access ✓ Priority: HIGH

**Test**: Visit university subdomains without logging in

**URLs to Test**:
- https://uc.campushaiti.org
- https://ueh.campushaiti.org
- https://uniq.campushaiti.org
- https://uneph.campushaiti.org

**Expected Behavior**:
- ✅ Page loads WITHOUT requiring authentication
- ✅ University name, description, and location display
- ✅ Contact information visible (email, phone)
- ✅ Program listings show with basic info
- ✅ "Staff Login" button visible
- ✅ "Apply Now" button visible
- ✅ NO tuition or deadline information visible (authentication required)

**How to Test**:
1. Open incognito/private browser window
2. Navigate to any school subdomain
3. Verify all public content displays
4. Check that no authentication is required

---

### 2. Authenticated User Experience ✓ Priority: HIGH

**Test**: Verify enhanced features for logged-in users

**Steps**:
1. Login at https://campushaiti.org/auth/signin
   - Email: info@edlight.org
   - Password: [your password]
2. Navigate to https://uc.campushaiti.org
3. Verify authenticated UI appears

**Expected Behavior**:
- ✅ "Dashboard" button visible instead of "Staff Login"
- ✅ "Manage Programs" button visible
- ✅ Full program details visible (tuition, application fees, deadlines)
- ✅ User stays logged in (session persists from main domain)

---

### 3. Cross-Subdomain Authentication ✓ Priority: HIGH

**Test**: Session cookie sharing across subdomains

**Steps**:
1. Login at main domain: https://campushaiti.org
2. Without logging in again, visit: https://uc.campushaiti.org
3. Check authentication status
4. Navigate to: https://ueh.campushaiti.org
5. Check authentication status again

**Expected Behavior**:
- ✅ Session persists across all subdomains
- ✅ No need to login separately on each subdomain
- ✅ Cookie domain is `.campushaiti.org` (check browser dev tools → Application → Cookies)

**How to Verify Cookie**:
1. Open browser DevTools (F12)
2. Go to Application → Cookies
3. Find "session" cookie
4. Verify Domain = `.campushaiti.org`

---

### 4. School Subdomain Navigation ✓ Priority: MEDIUM

**Test**: All dashboard pages work on school subdomains

**URLs to Test** (replace `uc` with any school slug):
- https://uc.campushaiti.org/dashboard
- https://uc.campushaiti.org/dashboard/programs
- https://uc.campushaiti.org/dashboard/team
- https://uc.campushaiti.org/dashboard/settings
- https://uc.campushaiti.org/dashboard/applications
- https://uc.campushaiti.org/dashboard/analytics

**Expected Behavior**:
- ✅ All pages load correctly
- ✅ No "demo mode" messages appear
- ✅ Data specific to the correct university displays
- ✅ Navigation between pages works smoothly

---

### 5. Public API Endpoints ✓ Priority: MEDIUM

**Test**: Public endpoints return correct data

**Using Browser DevTools Network Tab**:
1. Visit https://uc.campushaiti.org
2. Open DevTools → Network tab
3. Find these requests:
   - `/api/schools/public/university`
   - `/api/schools/public/programs`

**Expected Response** (`/api/schools/public/university`):
```json
{
  "university": {
    "id": "...",
    "name": "Université Quisqueya",
    "slug": "uc",
    "description": "...",
    "city": "Port-au-Prince",
    "email": "...",
    "phone": "..."
  }
}
```

**Expected Response** (`/api/schools/public/programs`):
```json
{
  "programs": [
    {
      "id": "...",
      "name": "...",
      "degree": "Bachelor",
      "field": "...",
      "description": "..."
    }
  ]
}
```

**Verify**:
- ✅ No authentication headers required
- ✅ Returns data for correct university (based on subdomain)
- ✅ No sensitive data exposed (no `adminUids`, `team` fields)

---

### 6. Team Invitation Flow ✓ Priority: LOW

**Test**: Team invitations redirect to correct subdomain

**Steps**:
1. Login as school admin
2. Go to https://uc.campushaiti.org/dashboard/team
3. Invite a new team member
4. Check invitation email
5. Click invitation link

**Expected Behavior**:
- ✅ Invitation link points to school subdomain (e.g., `uc.campushaiti.org/team/accept?token=...`)
- ✅ NOT main domain (`campushaiti.org`)
- ✅ User lands on correct school's acceptance page

---

## Manual Configuration Tasks

### Firebase Authorized Domains

**Status**: ⚠️ MANUAL ACTION REQUIRED

**Steps**:
1. Go to https://console.firebase.google.com
2. Select your project
3. Navigate to: Authentication → Settings → Authorized domains
4. Click "Add domain"
5. Add: `campushaiti.org`

**Note**: Firebase automatically allows all subdomains of verified custom domains, so `*.campushaiti.org` is covered once you add the root domain.

---

### Vercel Domain Configuration

**Status**: ⚠️ VERIFY CONFIGURATION

**Steps**:
1. Go to https://vercel.com
2. Open your project
3. Go to: Settings → Domains
4. Verify these domains are configured:
   - `campushaiti.org` (should have green checkmark)
   - `*.campushaiti.org` (wildcard for subdomains)

**If not configured**:
1. Click "Add Domain"
2. Enter domain name
3. Follow DNS configuration instructions

---

## Common Issues & Solutions

### Issue: "Auth domain is not configured"
**Solution**: Add `campushaiti.org` to Firebase authorized domains (see above)

### Issue: Subdomain shows 404
**Solution**: Verify Vercel wildcard domain `*.campushaiti.org` is configured

### Issue: Session doesn't persist across subdomains
**Solution**: Check that session cookie domain is `.campushaiti.org` (with leading dot)

### Issue: Public page shows "Loading..." indefinitely
**Solution**: Check browser console for API errors, verify public endpoints are working

### Issue: Wrong university data on subdomain
**Solution**: Verify middleware is setting `x-school-slug` header correctly

---

## Success Criteria

**All features working when**:
- ✅ Public pages accessible without login
- ✅ Correct university data displays on each subdomain
- ✅ Authentication works across all subdomains
- ✅ Dashboard pages load correctly
- ✅ Public API endpoints return appropriate data
- ✅ No console errors in production

---

## Next Steps

After testing, if issues are found:
1. Document the specific error/behavior
2. Include browser console errors
3. Note which URL/subdomain has the issue
4. Check network tab for failed API requests

