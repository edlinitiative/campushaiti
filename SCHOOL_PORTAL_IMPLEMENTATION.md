# School Portal Implementation

## Overview

This document describes the comprehensive school/university portal system added to Campus Haiti. The portal allows universities to self-register, manage their programs, customize application questions, review applicants, and configure payment processing.

## Features Implemented

### 1. University Self-Registration
**File**: `app/[locale]/schools/register/page.tsx`

Universities can register themselves through a multi-section form:
- **University Information**: Name, slug, location, website, contact details
- **Contact Person**: Primary contact name, email, phone
- **Legal Information**: Registration number, tax ID

Upon submission:
- Creates a document in the `universityRegistrations` collection
- Status set to `PENDING`
- Admin receives notification to review application
- Redirects to success/pending page

### 2. School Dashboard
**File**: `app/[locale]/schools/dashboard/page.tsx`

Main hub for school administrators showing:
- **Statistics Cards**:
  - Total applications received
  - New applications (last 7 days)
  - Accepted applications
  - Applications pending review
- **Tabs**:
  - Applications overview
  - Programs management
  - Analytics (acceptance rate)
- **Quick Actions**: Links to review applications, manage programs, customize questions

### 3. Application Management
**File**: `app/[locale]/schools/dashboard/applications/page.tsx`

View and manage all applications submitted to the school's programs:
- **Filtering**: All, New, In Review, Accepted, Rejected
- **Search**: By applicant name or email
- **Application Cards** showing:
  - Applicant name and email
  - Applied program
  - Submission date
  - Current status (color-coded badges)
- **Actions**: View details, Start review

### 4. Custom Questions Builder
**File**: `app/[locale]/schools/dashboard/questions/page.tsx`

Universities can create custom application questions:
- **Question Types Supported**:
  - TEXT (short text input)
  - TEXTAREA (long text)
  - SELECT (single choice dropdown)
  - MULTISELECT (multiple choices)
  - FILE (document upload)
  - DATE (date picker)
  - NUMBER (numeric input)
- **Features**:
  - Add/edit/delete questions
  - Mark questions as required
  - Add placeholder text and help text
  - Configure options for SELECT/MULTISELECT
  - Reorder questions (up/down)
  - Enable/disable questions without deleting
- **Storage**: Questions saved to `programs.customQuestions` array

### 5. Settings & Payment Configuration
**File**: `app/[locale]/schools/dashboard/settings/page.tsx`

Three-tab interface for university configuration:

#### Profile Tab
- Update university name, slug, location
- Edit description
- Update contact information (email, phone)

#### Payments Tab
- **Bank Account Configuration**:
  - Account name, number
  - Bank name, routing number, SWIFT code
- **Stripe Connect Integration**:
  - OAuth flow to connect Stripe account
  - Enables direct payment processing
  - Status badge shows connection state
- **MonCash Integration**:
  - Connect MonCash account for Haiti-specific payments
  - Configuration placeholder

#### Team Tab
- List team members with access to school dashboard
- Invite new members
- Manage permissions (future feature)

### 6. Admin Approval Workflow
**File**: `app/[locale]/admin/universities/page.tsx`

Platform administrators can review and approve registrations:
- **Pending Registrations**: List of all pending applications
- **Registration Cards** showing:
  - University details (name, location, contact)
  - Contact person information
  - Description and legal information
  - Submission timestamp
- **Actions**:
  - **Approve**: Creates University document, sets status to APPROVED
  - **Reject**: Opens dialog to enter rejection reason
- **Tabs**: Pending, Approved, Rejected (filter by status)

**Admin Dashboard Updated** (`app/[locale]/admin/page.tsx`):
- Added "University Registrations" card
- Links to approve pending universities
- Improved navigation to all admin sections

## Type System Extensions

**File**: `lib/types/firestore.ts`

### New Types

```typescript
export type UniversityStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

export type QuestionType = 
  | "TEXT" 
  | "TEXTAREA" 
  | "SELECT" 
  | "MULTISELECT" 
  | "FILE" 
  | "DATE" 
  | "NUMBER";
```

### Extended University Interface

```typescript
export interface University {
  // ... existing fields
  status?: UniversityStatus;
  adminUids?: string[];  // Array of user IDs with admin access
  bankAccount?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    routingNumber?: string;
    swiftCode?: string;
  };
  stripeAccountId?: string;
  monCashAccountId?: string;
  approvedAt?: number;
  approvedBy?: string;
}
```

### Extended Program Interface

```typescript
export interface Program {
  // ... existing fields
  customQuestions?: CustomQuestion[];
}
```

### New Interfaces

```typescript
export interface CustomQuestion {
  id: string;
  question: string;
  type: QuestionType;
  required: boolean;
  options?: string[];  // For SELECT/MULTISELECT
  placeholder?: string;
  helpText?: string;
  order: number;
}

export interface UniversityRegistration {
  id: string;
  universityName: string;
  slug: string;
  description: string;
  city: string;
  country: string;
  website?: string;
  email: string;
  phone?: string;
  
  // Contact person
  contactPersonName: string;
  contactPersonEmail: string;
  contactPersonPhone?: string;
  
  // Legal
  registrationNumber?: string;
  taxId?: string;
  
  // Status tracking
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface ApplicationItemAnswer {
  questionId: string;
  answer: string | string[];
  fileUrl?: string;
}
```

### Extended ApplicationItem Interface

```typescript
export interface ApplicationItem {
  // ... existing fields
  customAnswers?: ApplicationItemAnswer[];
  reviewedBy?: string;
  reviewedAt?: number;
  reviewNotes?: string;
  checklist: {
    // ... existing checklist items
    customQuestionsAnswered?: boolean;
  };
}
```

## Navigation Updates

**File**: `components/Navigation.tsx`

Added school portal links:
- **Public Link**: "For Schools" → `/schools/register`
- **Authenticated Link**: "School Portal" → `/schools/dashboard` (visible to logged-in users)

## Data Flow

### Registration Flow
1. University fills registration form at `/schools/register`
2. Document created in `universityRegistrations` collection with `PENDING` status
3. Admin reviews at `/admin/universities`
4. If approved:
   - University document created in `universities` collection
   - Status set to `APPROVED`
   - Email sent to contact person with credentials
5. If rejected:
   - Status updated to `REJECTED`
   - Rejection reason stored
   - Email sent explaining rejection

### Application Review Flow
1. Student submits application to university's program
2. Application appears in school's dashboard at `/schools/dashboard/applications`
3. School admin reviews application
4. Custom question answers displayed alongside standard application data
5. Admin marks as accepted/rejected
6. Student notified of decision

### Custom Questions Flow
1. School admin creates questions at `/schools/dashboard/questions`
2. Questions saved to `programs/{programId}/customQuestions` array
3. Application form dynamically renders custom questions
4. Student answers saved to `applicationItems/{id}/customAnswers`
5. Answers displayed during application review

## Security Considerations

### Required Firestore Rules

```javascript
// University Registrations
match /universityRegistrations/{regId} {
  allow create: if request.auth != null;
  allow read, update: if request.auth.token.role == "ADMIN";
}

// Universities - School Admin Access
match /universities/{universityId} {
  allow read: if true;
  allow update: if request.auth.token.role == "ADMIN" || 
                 request.auth.uid in resource.data.adminUids;
}

// Programs - School Admin Can Edit Their Programs
match /universities/{universityId}/programs/{programId} {
  allow read: if true;
  allow write: if request.auth.token.role == "ADMIN" || 
                request.auth.uid in get(/databases/$(database)/documents/universities/$(universityId)).data.adminUids;
}

// Applications - School Admins Can Read Their Applications
match /applicationItems/{applicationId} {
  allow read: if request.auth.token.role == "ADMIN" || 
               request.auth.uid == resource.data.userId ||
               request.auth.uid in get(/databases/$(database)/documents/universities/$(resource.data.universityId)).data.adminUids;
  allow update: if request.auth.token.role == "ADMIN" ||
                 request.auth.uid in get(/databases/$(database)/documents/universities/$(resource.data.universityId)).data.adminUids;
}
```

### Role Assignment
- When admin approves university, create user account with `SCHOOL_ADMIN` role
- Add user UID to university's `adminUids` array
- Send invitation email with login credentials

## API Routes Needed

### School Operations
- `POST /api/schools/register` - Submit university registration
- `GET /api/schools/applications` - Fetch applications for school's programs
- `PUT /api/schools/applications/:id` - Update application status
- `POST /api/schools/questions` - Save custom questions
- `GET /api/schools/questions/:programId` - Fetch custom questions
- `PUT /api/schools/settings` - Update university settings

### Admin Operations
- `GET /api/admin/registrations` - List pending registrations
- `PUT /api/admin/registrations/:id/approve` - Approve registration
- `PUT /api/admin/registrations/:id/reject` - Reject registration

### Payment Operations
- `POST /api/payments/stripe/connect` - Initiate Stripe Connect OAuth
- `GET /api/payments/stripe/callback` - Handle OAuth return
- `POST /api/payments/moncash/connect` - Connect MonCash account

## Future Enhancements

1. **Team Management**: 
   - Add multiple admins per university
   - Role-based permissions (viewer, editor, admin)
   - Audit log of changes

2. **Analytics Dashboard**:
   - Application trends over time
   - Acceptance rates by program
   - Geographic distribution of applicants
   - Application completion rates

3. **Communication Tools**:
   - Message applicants directly from dashboard
   - Email templates for status updates
   - SMS notifications for Haitian applicants

4. **Advanced Question Types**:
   - Conditional questions (show if previous answer matches)
   - File validation (size, type restrictions)
   - Question grouping/sections

5. **Payment Processing**:
   - Automated payment distribution
   - Fee configuration per program
   - Revenue reporting
   - Refund management

6. **Application Workflow**:
   - Multi-stage review process
   - Collaborative review (multiple reviewers)
   - Interview scheduling
   - Document verification workflow

## Testing Checklist

- [ ] Register test university
- [ ] Verify registration appears in admin panel
- [ ] Approve registration as admin
- [ ] Log in as school admin
- [ ] Create custom questions for program
- [ ] Submit test application with custom questions
- [ ] Review application in school dashboard
- [ ] Accept/reject application
- [ ] Configure bank account
- [ ] Test Stripe Connect flow
- [ ] Verify payment routing to school account

## Deployment Notes

1. **Environment Variables**: Ensure Stripe Connect credentials are set
2. **Firebase Rules**: Deploy updated security rules before enabling features
3. **Email Templates**: Configure transactional emails for registration approval/rejection
4. **Monitoring**: Set up alerts for failed payment connections
5. **Documentation**: Create user guides for school administrators

## Technical Debt

1. Replace mock data with actual Firestore queries
2. Add loading states and error handling
3. Implement proper authentication checks on all pages
4. Add form validation with error messages
5. Optimize database queries (add indexes)
6. Add unit tests for critical flows
7. Add E2E tests for registration and approval workflows

## Files Modified/Created

### New Files (7)
- `app/[locale]/schools/register/page.tsx` (350+ lines)
- `app/[locale]/schools/dashboard/page.tsx` (280+ lines)
- `app/[locale]/schools/dashboard/applications/page.tsx` (180+ lines)
- `app/[locale]/schools/dashboard/questions/page.tsx` (420+ lines)
- `app/[locale]/schools/dashboard/settings/page.tsx` (380+ lines)
- `app/[locale]/admin/universities/page.tsx` (350+ lines)
- `SCHOOL_PORTAL_IMPLEMENTATION.md` (this file)

### Modified Files (3)
- `lib/types/firestore.ts` - Extended with school portal types
- `app/[locale]/admin/page.tsx` - Added university management link
- `components/Navigation.tsx` - Added school portal links

### Total Lines Added: ~2,000+
