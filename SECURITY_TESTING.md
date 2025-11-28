# University Portal - Security & Testing Checklist

## Security Audit

### ✅ Authentication & Authorization

**Session Management:**
- ✅ All API routes verify session cookies using `verifySessionCookie()`
- ✅ Session cookies are HTTP-only and scoped to `.campushaiti.org` domain
- ✅ Unauthorized requests return 401 status
- ✅ Forbidden requests return 403 status

**Permission Checks:**
- ✅ All university-specific APIs verify user belongs to university
- ✅ Three-tier permission check:
  1. Platform ADMIN role (full access)
  2. Legacy `adminUids` array check (backward compatibility)
  3. Staff subcollection check (new granular roles)
- ✅ Analytics APIs protected with university access verification
- ✅ Template APIs verify ownership
- ✅ Payment APIs restrict updates to authorized staff

**Firestore Security Rules:**
- ✅ University staff subcollection enforced
- ✅ Application documents/notes/timeline subcollections secured
- ✅ Message templates require university access
- ✅ Payments collection protected (students can read own, staff can update)
- ✅ Timeline events are immutable (create-only)
- ✅ Internal notes hidden from students

### ✅ Input Validation

**API Endpoints:**
- ✅ Status updates validate against enum values
- ✅ University ID validated from subdomain slug
- ✅ Document IDs validated before operations
- ✅ User IDs sanitized in queries

**Client-Side Forms:**
- ✅ Template editor validates required fields (type, name, subject, body)
- ✅ Note form validates content before submission
- ✅ Kanban validates status transitions
- ✅ Payment status updates use controlled dropdown

**Recommendations:**
- [ ] Add Zod schemas for API request validation
- [ ] Add rate limiting to prevent abuse
- [ ] Add CSRF token validation for state-changing operations

### ✅ Data Protection

**Sensitive Data:**
- ✅ Payment amounts stored in cents (prevent float precision issues)
- ✅ Student IDs validated before payment access
- ✅ Internal notes separated from external notes
- ✅ Timeline events track all status changes (audit trail)

**File Uploads:**
- ✅ Document status tracking (pending, approved, rejected)
- ✅ Document approval requires staff access
- ✅ Document metadata includes uploader and timestamps

**Recommendations:**
- [ ] Add file type validation for document uploads
- [ ] Add file size limits
- [ ] Scan uploads for malware

### ✅ Error Handling

**API Responses:**
- ✅ Generic error messages to prevent information disclosure
- ✅ Detailed errors logged server-side only
- ✅ Try-catch blocks in all async operations
- ✅ 500 status for unexpected errors

**Client-Side:**
- ✅ Loading states for all async operations
- ✅ Empty states for zero data scenarios
- ✅ Error boundaries recommended (not yet implemented)

**Recommendations:**
- [ ] Add React Error Boundaries to all major components
- [ ] Add Sentry or similar error tracking service
- [ ] Add user-friendly error messages with recovery actions

## Testing Checklist

### Phase 1: Enhanced Data Model & Roles ✅

**Types & Interfaces:**
- [x] Verify `UniversityRole` enum values
- [x] Verify `ApplicationStatus` enum completeness
- [x] Verify `PermissionAction` covers all operations
- [x] Test permission matrix against role requirements

**Permission Checks:**
- [ ] Test platform ADMIN has full access
- [ ] Test UNI_ADMIN can manage all university data
- [ ] Test UNI_REVIEWER can review applications but not delete
- [ ] Test UNI_FINANCE can manage payments only
- [ ] Test UNI_VIEWER has read-only access
- [ ] Test unauthorized users get 403 errors

**Hooks:**
- [ ] Test `useUniversityRole` returns correct role
- [ ] Test `useUniversityPermissions` returns correct permissions
- [ ] Test hooks handle loading and error states

### Phase 2: Application Pipeline Kanban ✅

**Drag & Drop:**
- [ ] Test dragging application between statuses updates Firestore
- [ ] Test optimistic UI updates before server confirmation
- [ ] Test error rollback if server update fails
- [ ] Test drag restrictions (e.g., can't drag from accepted to new)
- [ ] Test drag with multiple browsers simultaneously

**Bulk Operations:**
- [ ] Test bulk assign updates all selected applications
- [ ] Test bulk assign validates reviewer exists
- [ ] Test bulk assign creates timeline events
- [ ] Test empty selection shows appropriate message

**Board Display:**
- [ ] Test applications group correctly by status
- [ ] Test counts match actual application numbers
- [ ] Test filtering works across all statuses
- [ ] Test performance with 100+ applications

### Phase 3: Application Detail Page ✅

**Tabs Navigation:**
- [ ] Test all tabs load without errors
- [ ] Test tab switching preserves data
- [ ] Test deep linking to specific tabs
- [ ] Test tab permissions (internal notes hidden from students)

**Documents Tab:**
- [ ] Test document list displays all uploaded docs
- [ ] Test approve/reject buttons update status
- [ ] Test status changes create timeline events
- [ ] Test document download works
- [ ] Test permissions (students can't approve own docs)

**Notes Tab:**
- [ ] Test creating internal notes (visible to staff only)
- [ ] Test creating external notes (visible to student)
- [ ] Test students can only see external notes
- [ ] Test note timestamps are accurate
- [ ] Test note editing (if implemented)

**Timeline Tab:**
- [ ] Test timeline shows all events in chronological order
- [ ] Test status changes appear in timeline
- [ ] Test document approvals appear in timeline
- [ ] Test timeline is read-only (no edit/delete)
- [ ] Test actor names display correctly

### Phase 4: Message Templates ✅

**Template CRUD:**
- [ ] Test creating new template saves to Firestore
- [ ] Test editing template updates existing document
- [ ] Test deleting template removes from Firestore
- [ ] Test duplicate creates copy with "(Copy)" suffix
- [ ] Test university isolation (can't access other unis' templates)

**Variable Parsing:**
- [ ] Test `{{studentName}}` variable detected
- [ ] Test `{{programName}}` variable detected
- [ ] Test `{{universityName}}` variable detected
- [ ] Test invalid variables show warning
- [ ] Test case sensitivity of variables

**Live Preview:**
- [ ] Test preview updates in real-time
- [ ] Test sample data substitution works
- [ ] Test preview matches actual email format
- [ ] Test HTML rendering in preview

**Template Types:**
- [ ] Test default templates load for each type
- [ ] Test changing type loads appropriate default
- [ ] Test all 5 types (missing_docs, interview, acceptance, rejection, general)

### Phase 5: Payment Management ✅

**Payment Table:**
- [ ] Test table displays all university payments
- [ ] Test search by student name filters correctly
- [ ] Test search by program name filters correctly
- [ ] Test status filter works (unpaid, pending, paid, refunded, failed)
- [ ] Test method filter works (stripe, moncash, bank_transfer, cash)
- [ ] Test combining filters narrows results correctly

**Status Updates:**
- [ ] Test updating to "paid" sets `paidAt` timestamp
- [ ] Test updating to "refunded" sets `refundedAt` timestamp
- [ ] Test `updatedBy` tracks correct user ID
- [ ] Test notes field saves correctly
- [ ] Test status update creates timeline event (if implemented)

**CSV Export:**
- [ ] Test CSV includes all table columns
- [ ] Test amounts formatted correctly (cents → dollars)
- [ ] Test dates formatted as readable strings
- [ ] Test special characters escaped properly
- [ ] Test large datasets (1000+ payments) export successfully

**Permissions:**
- [ ] Test UNI_FINANCE can update payment status
- [ ] Test UNI_REVIEWER cannot update payments
- [ ] Test students can view own payments only
- [ ] Test staff can view all university payments

### Phase 6: Enhanced Analytics ✅

**Dashboard KPIs:**
- [ ] Test all 8 metrics calculate correctly
- [ ] Test acceptance rate formula: accepted / (accepted + rejected)
- [ ] Test avg processing time in days
- [ ] Test revenue conversion (cents → dollars)
- [ ] Test metrics update in real-time
- [ ] Test loading states display properly
- [ ] Test error handling if API fails

**Application Funnel:**
- [ ] Test bar chart renders with correct data
- [ ] Test all 6 statuses appear in correct order
- [ ] Test percentages sum to 100%
- [ ] Test tooltips show count and percentage
- [ ] Test color coding matches status colors
- [ ] Test empty state when no applications

**Program Performance:**
- [ ] Test table shows all programs
- [ ] Test sorting by each column (name, apps, accepted, rejected, rate)
- [ ] Test acceptance rate calculation correct
- [ ] Test color coding for acceptance rate badges
- [ ] Test programs with zero applications display correctly

**CSV Export:**
- [ ] Test export includes all three analytics sections
- [ ] Test CSV format is valid
- [ ] Test filename includes date
- [ ] Test download triggers in browser

**Permissions:**
- [ ] Test analytics require university staff access
- [ ] Test students cannot access analytics
- [ ] Test analytics show only that university's data

### Cross-Cutting Concerns

**Performance:**
- [ ] Test page load times under 2 seconds
- [ ] Test API response times under 1 second
- [ ] Test Firestore queries use proper indexes
- [ ] Test large datasets (1000+ applications) render smoothly
- [ ] Test image optimization (Next.js Image component)

**Accessibility:**
- [ ] Test keyboard navigation works
- [ ] Test screen reader compatibility
- [ ] Test color contrast ratios meet WCAG AA
- [ ] Test focus indicators visible
- [ ] Test ARIA labels on interactive elements

**Internationalization:**
- [ ] Test all pages support en/fr/ht locales
- [ ] Test translation keys exist for all UI text
- [ ] Test date formatting respects locale
- [ ] Test currency formatting (HTG, USD)

**Responsive Design:**
- [ ] Test mobile layout (320px - 768px)
- [ ] Test tablet layout (768px - 1024px)
- [ ] Test desktop layout (1024px+)
- [ ] Test touch interactions on mobile
- [ ] Test hamburger menu on mobile

**Browser Compatibility:**
- [ ] Test Chrome (latest)
- [ ] Test Firefox (latest)
- [ ] Test Safari (latest)
- [ ] Test Edge (latest)
- [ ] Test mobile Safari (iOS)
- [ ] Test mobile Chrome (Android)

## Edge Cases & Error Scenarios

### Data Edge Cases:
- [ ] Zero applications in system
- [ ] Zero programs for university
- [ ] Zero payments recorded
- [ ] Application with missing student data
- [ ] Template with no variables
- [ ] Payment with zero amount
- [ ] Application in unknown status (data corruption)

### Network Errors:
- [ ] API timeout (>30 seconds)
- [ ] Network disconnect during operation
- [ ] Firestore offline mode
- [ ] Session cookie expired mid-operation
- [ ] Concurrent edits by multiple users

### Permission Errors:
- [ ] User removed from staff while viewing page
- [ ] Role downgraded during session
- [ ] University deleted while user viewing
- [ ] Cross-university access attempt

## Deployment Checklist

### Pre-Deployment:
- [ ] Run ESLint and fix all errors
- [ ] Run TypeScript compiler with strict mode
- [ ] Test build locally (`npm run build`)
- [ ] Verify environment variables set in Vercel
- [ ] Update Firestore indexes if needed
- [ ] Review Firestore rules changes
- [ ] Test with production Firebase project

### Deployment:
- [ ] Deploy Firestore rules: `firebase deploy --only firestore:rules`
- [ ] Deploy to Vercel staging environment first
- [ ] Run smoke tests on staging
- [ ] Deploy to production
- [ ] Verify deployment successful
- [ ] Test critical paths on production

### Post-Deployment:
- [ ] Monitor error logs for 24 hours
- [ ] Check Vercel analytics for errors
- [ ] Check Firebase usage metrics
- [ ] Verify session cookies work across subdomains
- [ ] Test with real university subdomain
- [ ] Gather feedback from beta users

## Known Limitations & Future Improvements

### Current Limitations:
1. No email sending functionality (templates created but not sent)
2. No file upload size limits enforced
3. No rate limiting on API endpoints
4. No automated tests (manual testing only)
5. No error monitoring service (Sentry)
6. No real-time updates (requires page refresh)

### Recommended Improvements:
1. **Email Integration**: Use SendGrid/Mailgun to send template-based emails
2. **File Storage**: Use Firebase Storage or Cloudinary for document uploads
3. **Real-time Updates**: Use Firestore `onSnapshot` for live data
4. **Automated Testing**: Add Jest + React Testing Library
5. **E2E Testing**: Add Playwright or Cypress tests
6. **Performance Monitoring**: Add Vercel Analytics or similar
7. **Error Tracking**: Integrate Sentry for error monitoring
8. **Backup Strategy**: Automated Firestore backups
9. **Audit Logging**: Enhanced audit trail for sensitive operations
10. **Two-Factor Authentication**: Add 2FA for admin accounts

## Security Incidents Response Plan

### If Security Issue Discovered:
1. **Immediate**: Disable affected endpoint or feature
2. **Assess**: Determine scope of vulnerability
3. **Patch**: Deploy fix as emergency release
4. **Notify**: Inform affected users if data exposed
5. **Review**: Update security checklist
6. **Document**: Add to incident log

### Contact:
- Security Lead: [TBD]
- Platform Admin: [TBD]
- Firebase Admin: [TBD]

---

**Last Updated**: Phase 7 - Security & Testing
**Status**: Ready for final testing and deployment
**Next Steps**: Complete manual testing checklist, then deploy to staging
