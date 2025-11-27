# Comprehensive Portal Audit Checklist

**Last Updated:** November 27, 2025  
**Status:** All critical navigation issues fixed ✅

---

## 🎓 School Admin Portal Testing (School Subdomain)

### Public Home Page (`uc.campushaiti.org`)
- [ ] **Page loads without authentication**
  - Should show university name, description, location
  - Should display contact info (email, phone)
  - Should list programs with basic info
  - Should show "Staff Login" and "Apply Now" buttons
  
- [ ] **Authenticated view**
  - Login as school admin (info@edlight.org)
  - Visit school subdomain
  - Should show "Dashboard" and "Manage Programs" buttons
  - Should show full program details (tuition, fees, deadlines)
  
- [ ] **Navigation works**
  - Click "Staff Login" → should go to login page (NOT /en/auth/signin)
  - Click "Apply Now" → should go to application page
  - Click "Dashboard" (when authenticated) → should go to dashboard
  - Click logo/university name → should NOT add /en prefix

### Dashboard Landing (`/dashboard`)
- [ ] **Page loads correctly**
  - Shows university name and stats
  - Displays application counts (total, new, accepted, pending)
  - No "demo mode" warnings
  - Quick links work (Applications, Programs, Team, Settings)

- [ ] **Navigation**
  - All sidebar/header links work
  - Breadcrumbs accurate
  - Back button functions properly
  - No /en prefix errors

### Programs Management (`/dashboard/programs`)
- [ ] **List view**
  - Shows all programs for the university
  - Correct university's programs only (not other universities)
  - Program count accurate
  - Sorting/filtering works

- [ ] **Create new program** (`/dashboard/programs/new`)
  - Form loads correctly
  - All fields editable
  - Validation works
  - Submit creates program
  - Redirects back to programs list after success
  - No /en prefix on redirect

- [ ] **Edit program**
  - Click edit on existing program
  - Form pre-populates with current data
  - Changes save successfully
  - Cancel returns to list

- [ ] **Delete program**
  - Delete confirmation appears
  - Program removes from list after confirmation

### Team Management (`/dashboard/team`)
- [ ] **Team list**
  - Shows current team members
  - Displays roles correctly (Admin, Reviewer, Viewer)
  - Shows status (Active, Pending, Inactive)
  
- [ ] **Invite new member**
  - Form opens
  - Email and role selection works
  - Invitation sends successfully
  - **CRITICAL:** Invitation email contains school subdomain URL (e.g., `uc.campushaiti.org/team/accept?token=...`)
  - NOT main domain URL

- [ ] **Manage existing members**
  - Change role
  - Remove member
  - Resend invitation (for pending members)

### Settings (`/dashboard/settings`)
- [ ] **University information tab**
  - Current data loads correctly
  - Name, description, location editable
  - Slug field (read-only or editable carefully)
  - Contact info updates

- [ ] **Logo and images tab**
  - Upload logo
  - Upload cover image
  - Images display correctly after upload
  - Old images removed/replaced properly

- [ ] **Contact information tab**
  - Email, phone, website fields work
  - Address/location fields update
  - Social media links (if applicable)

- [ ] **Save functionality**
  - Changes persist after save
  - Success message appears
  - Error handling for validation failures

### Applications Management (`/dashboard/applications`)
- [ ] **Applications list**
  - Shows applications for this university only
  - Filter by status (New, Under Review, Accepted, Rejected)
  - Search by student name/email works
  - Sorting works (date, status, program)

- [ ] **View application details** (`/dashboard/applications/[id]`)
  - Opens correct application
  - Shows student profile info
  - Shows selected program
  - Shows documents uploaded
  - Shows custom question answers (if any)

- [ ] **Change application status**
  - Can update status (Accept, Reject, Request More Info)
  - Status change saves
  - Student gets notified (if email system working)

- [ ] **Navigation back**
  - Back to list works
  - Breadcrumb navigation works
  - No /en prefix errors

### Analytics (`/dashboard/analytics`)
- [ ] **Stats display**
  - Application trends chart
  - Program popularity
  - Acceptance rate
  - Data accurate for this university only

- [ ] **Date filters**
  - Filter by date range
  - Charts update based on filters

### Questions Management (`/dashboard/questions`)
- [ ] **Custom questions per program**
  - Can add custom application questions
  - Questions saved per program
  - Edit and delete questions work
  - Questions appear in application form for students

---

## 👨‍🎓 Student/Public User Testing (Main Domain)

### Main Landing Page (`campushaiti.org`)
- [ ] **Page loads**
  - Hero section displays
  - Call-to-action buttons work
  - Features section shows
  - Navigation menu works

- [ ] **Navigation**
  - Click "Apply" → goes to /apply
  - Click "Partners" → goes to /partners
  - Click "Browse Universities" → goes to /schools/browse
  - Language switcher works (EN/FR/HT)
  - Login/Signup links work

### Browse Universities (`/schools/browse`)
- [ ] **University listing**
  - Shows all available universities
  - Search works
  - Filter by location/city
  - Demo notice displays (if in demo mode)

- [ ] **University cards**
  - Logo/image displays
  - University name, location, description shown
  - Program count accurate
  - "View Details" link works

- [ ] **View university details** (`/schools/[slug]`)
  - Opens correct university page
  - Shows programs offered
  - Contact info displayed
  - "Apply Now" button works
  - Redirects to school subdomain if applicable

### Application Flow (`/apply`)
- [ ] **Authentication required**
  - Redirects to login if not authenticated
  - Returns to /apply after login

- [ ] **Step 1: Profile**
  - Form fields editable
  - Validation works
  - Save and continue works
  - Progress bar updates

- [ ] **Step 2: Documents**
  - Can upload documents
  - File validation (type, size)
  - Can delete uploaded documents
  - Required documents marked

- [ ] **Step 3: Programs**
  - University selection works
  - Program selection based on university
  - Multiple programs selectable
  - Custom questions appear if set

- [ ] **Step 4: Payment**
  - Payment methods display (MonCash, Stripe)
  - Application fee shows correctly
  - Payment flow works
  - Confirmation after payment

- [ ] **Step 5: Review & Submit**
  - All entered data displays correctly
  - Can go back to edit
  - Submit button works
  - Confirmation page after submission
  - Email sent (if email system working)

### Authentication Flow
- [ ] **Sign Up** (`/auth/signup`)
  - Form validation works
  - Email verification sent
  - Redirect after signup
  - No /en prefix errors

- [ ] **Sign In** (`/auth/signin`)
  - Email/password login works
  - "Forgot password" link works
  - Redirect to intended page after login
  - Session persists correctly

- [ ] **Sign Out**
  - Logout button works
  - Session clears
  - Redirects to home page

- [ ] **Email Verification** (`/auth/verify`)
  - Verification link from email works
  - Account activates
  - Can login after verification

- [ ] **Password Reset** (`/auth/forgot-password`)
  - Email sent with reset link
  - Reset link works
  - New password saves
  - Can login with new password

### Student Dashboard (`/dashboard`)
- [ ] **Profile** (`/dashboard/profile`)
  - Shows student info
  - Can edit profile
  - Changes save

- [ ] **Applications** (`/dashboard/applications`)
  - Lists all submitted applications
  - Shows status for each
  - Can view application details
  - Can track progress

- [ ] **Documents** (`/dashboard/documents`)
  - Shows uploaded documents
  - Can upload additional docs
  - Can delete documents
  - Download documents

- [ ] **Settings** (`/dashboard/settings`)
  - Notification preferences
  - Privacy settings
  - Account settings
  - Delete account option

---

## 🔧 Cross-Cutting Concerns

### Session & Authentication
- [ ] **Cross-subdomain authentication**
  - Login on main domain → session works on school subdomain
  - Login on school subdomain → session works on main domain
  - Cookie domain is `.campushaiti.org`
  - Session persists across navigation

- [ ] **Role-based access**
  - School admin can access school dashboard
  - Students cannot access school dashboard
  - Platform admin can access admin panel
  - Proper 403 errors for unauthorized access

### Navigation & Routing
- [ ] **No /en prefix errors**
  - All links on school subdomains work without adding /en
  - Middleware properly rewrites subdomain URLs
  - Back button doesn't break navigation
  - External links open in new tab

- [ ] **Breadcrumbs**
  - Accurate on all pages
  - Clickable and functional
  - Don't show /en in path

### Performance
- [ ] **Page load times**
  - Pages load in <3 seconds
  - No excessive API calls
  - Images optimized

- [ ] **Error handling**
  - Graceful error messages
  - No white screen of death
  - Console errors minimal
  - Loading states present

### Mobile Responsiveness
- [ ] **All pages responsive**
  - Test on mobile viewport
  - Navigation menu works on mobile
  - Forms usable on mobile
  - Tables scroll horizontally if needed

### Internationalization
- [ ] **Language switching**
  - EN/FR/HT switcher works
  - Content changes to selected language
  - Language persists across pages
  - No missing translations

---

## 🚨 Critical Issues Found & Fixed

### ✅ FIXED: Navigation /en Prefix Error
- **Issue:** All school portal pages used next-intl's Link component which added `/en` prefix
- **Impact:** Links broke when clicked on school subdomains
- **Fix:** Replaced all `import { Link } from "@/lib/navigation"` with `import Link from "next/link"` in 12 files
- **Files affected:** All dashboard pages, browse, selector, team
- **Commit:** 499f60e

### ✅ FIXED: Middleware Not Processing API Routes
- **Issue:** Middleware matcher excluded all /api routes
- **Impact:** `x-school-slug` header not set, public API endpoints returned 400 errors
- **Fix:** Removed `api` from middleware matcher exclusion
- **Commit:** 69187d8

### ✅ FIXED: School Subdomain Root Routing
- **Issue:** School subdomain root routed to `/dashboard` requiring login
- **Impact:** Public visitors saw login prompt instead of university info
- **Fix:** Changed middleware to route subdomain root to `/home`
- **Commits:** 35d6580, 81f528b

### ✅ FIXED: Authentication Check Method
- **Issue:** Home page tried GET `/api/auth/session` which returns 405
- **Impact:** Authentication detection failed
- **Fix:** Changed to use `/api/user/profile` for auth check
- **Commit:** a2406d1

---

## 📋 Manual Configuration Checklist

### Firebase Console
- [ ] Add `campushaiti.org` to authorized domains
  - Go to Firebase Console → Authentication → Settings → Authorized domains
  - Click "Add domain"
  - Enter: `campushaiti.org`
  - Note: Subdomains automatically allowed

### Vercel Dashboard
- [ ] Verify domain configuration
  - Go to Vercel project → Settings → Domains
  - Confirm `campushaiti.org` has green checkmark
  - Confirm `*.campushaiti.org` is configured
  - If missing, add wildcard domain

### DNS Configuration (Namecheap)
- [ ] Verify DNS records
  - A record for `@` pointing to Vercel
  - CNAME for `*` pointing to `cname.vercel-dns.com`
  - CNAME for `www` pointing to `cname.vercel-dns.com`

---

## 🎯 Testing Priorities

### Priority 1 (Must Work)
1. School subdomain home page loads for public
2. School admin can login and access dashboard
3. All navigation works without /en errors
4. Students can browse universities
5. Students can submit applications

### Priority 2 (Important)
1. Cross-subdomain authentication works
2. Team invitations send correct subdomain URLs
3. Program management (create, edit, delete)
4. Application status changes
5. File uploads work

### Priority 3 (Nice to Have)
1. Analytics charts display correctly
2. Custom questions per program work
3. Email notifications send
4. Payment integration works
5. Mobile experience polished

---

## 🔍 How to Test

### Quick Smoke Test (5 minutes)
1. Visit `uc.campushaiti.org` → should show university page
2. Click "Staff Login" → login should work
3. After login, visit `uc.campushaiti.org` → should show dashboard link
4. Click "Dashboard" → dashboard should load
5. Navigate to Programs, Team, Settings → all should work
6. Visit `campushaiti.org` → main site should work
7. Click "Browse Universities" → list should show

### Full Regression Test (30 minutes)
1. Follow all checkboxes in this document
2. Test both authenticated and unauthenticated states
3. Test on multiple school subdomains (uc, ueh, uniq, uneph)
4. Test on mobile viewport
5. Test all language options
6. Check browser console for errors

### Production Validation
- All tests should pass on production after deployment
- Check Vercel deployment logs for errors
- Monitor Firebase usage for unexpected spikes
- Check Sentry (if configured) for runtime errors

---

## 📊 Test Results Log

**Test Date:** _____________________  
**Tester:** _____________________  
**Environment:** Production / Staging  

### Critical Paths Status
- [ ] Public home page: ✅ / ❌ / ⚠️
- [ ] School dashboard: ✅ / ❌ / ⚠️
- [ ] Navigation: ✅ / ❌ / ⚠️
- [ ] Applications: ✅ / ❌ / ⚠️
- [ ] Authentication: ✅ / ❌ / ⚠️

### Issues Found
1. _______________________________________________________________
2. _______________________________________________________________
3. _______________________________________________________________

### Notes
_____________________________________________________________________
_____________________________________________________________________
_____________________________________________________________________
