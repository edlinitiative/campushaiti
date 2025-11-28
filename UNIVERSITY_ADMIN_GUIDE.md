# University Admin Portal - User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Application Management](#application-management)
4. [Payment Tracking](#payment-tracking)
5. [Communication Templates](#communication-templates)
6. [Analytics & Reporting](#analytics--reporting)
7. [Staff Management](#staff-management)
8. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Accessing Your Portal
Your university portal is accessible at: `https://[your-university-slug].campushaiti.org`

**Example**: If your university slug is "uc", your portal URL is `https://uc.campushaiti.org`

### User Roles & Permissions

The portal supports 4 role levels with different permissions:

| Role | Permissions |
|------|------------|
| **UNI_ADMIN** | Full access: manage staff, applications, payments, templates, analytics |
| **UNI_REVIEWER** | Review applications, add notes, update status (no delete) |
| **UNI_FINANCE** | Manage payments, view applications (read-only) |
| **UNI_VIEWER** | Read-only access to all data |

### First Login
1. Navigate to your portal URL
2. Sign in with your credentials
3. You'll be directed to the dashboard

---

## Dashboard Overview

### Navigation Menu
- **Dashboard**: Overview and quick stats
- **Applications**: Application pipeline board
- **Payments**: Payment tracking and management
- **Templates**: Communication templates
- **Analytics**: Comprehensive reports and insights

### Dashboard Widgets
- **Total Applications**: All-time application count
- **New Applications**: Applications awaiting review
- **Acceptance Rate**: Percentage of accepted vs rejected
- **Revenue**: Total fees collected

---

## Application Management

### Application Pipeline Board

The pipeline board uses a kanban-style interface to manage applications through their lifecycle.

#### Statuses (Left to Right):
1. **New** 🆕 - Just submitted, awaiting initial review
2. **In Review** 🔍 - Being evaluated by reviewers
3. **Missing Docs** ⚠️ - Additional documents required
4. **Interview** 💬 - Scheduled for or completed interview
5. **Accepted** ✅ - Approved for admission
6. **Rejected** ❌ - Not accepted

#### Moving Applications:
- **Drag & Drop**: Simply drag an application card to a new status column
- **Automatic Timeline**: Every status change is logged in the timeline
- **Notifications**: Students receive updates when status changes (if configured)

#### Bulk Actions:
1. Select multiple applications (click checkbox on cards)
2. Click "Bulk Assign" in the top-right
3. Choose a reviewer from dropdown
4. Click "Assign" - all selected applications will be assigned

### Application Detail Page

Click any application card to view full details across 4 tabs:

#### 1. Overview Tab
- **Student Information**: Name, email, phone, address
- **Program Details**: Applied program, application date
- **Status**: Current status with colored badge
- **Reviewer**: Assigned reviewer (if any)
- **Scorecard**: Evaluation scores and notes

#### 2. Documents Tab
- **View All Uploads**: List of all documents submitted by student
- **Document Status**: 
  - ⏳ **Pending**: Not yet reviewed
  - ✅ **Approved**: Verified and accepted
  - ❌ **Rejected**: Does not meet requirements
- **Actions**:
  - Click document name to download/view
  - Click "Approve" or "Reject" to update status
  - Add notes when rejecting to explain issues

#### 3. Notes Tab
- **Internal Notes** 🔒: Only visible to staff
  - Use for reviewer comments, internal discussions
  - Not visible to students
- **External Notes** 💬: Visible to students
  - Use for feedback, requests, updates
  - Students can see these in their portal

**Adding a Note**:
1. Click "Add Note" button
2. Choose type: Internal or External
3. Write your message
4. Click "Save"

#### 4. Timeline Tab
- **Audit Trail**: Complete history of all actions
- **Events Logged**:
  - Status changes (who, when, from → to)
  - Document approvals/rejections
  - Reviewer assignments
  - Note additions
  - Payment updates
- **Read-Only**: Timeline events cannot be edited or deleted

### Best Practices:
✅ **Review documents first** before changing status to "Accepted"  
✅ **Use internal notes** for sensitive information or staff-only discussions  
✅ **Add external notes** when requesting more information from students  
✅ **Check timeline** to understand application history before making decisions  

---

## Payment Tracking

### Payment Dashboard
Navigate to **Payments** to view all application fees and transactions.

#### Overview Cards:
- **Total Amount**: Sum of all payments (paid + pending)
- **Paid**: Successfully collected fees
- **Pending**: Awaiting payment or confirmation

### Payment Table

#### Columns:
- **Student**: Applicant name
- **Program**: Applied program
- **Amount**: Fee amount in dollars
- **Status**: Payment status badge
- **Method**: Payment method used
- **Date**: When payment was made/recorded

#### Status Types:
| Status | Meaning | Color |
|--------|---------|-------|
| **Unpaid** | No payment received | Gray |
| **Pending** | Payment initiated, awaiting confirmation | Orange |
| **Paid** | Successfully collected | Green |
| **Refunded** | Money returned to student | Purple |
| **Failed** | Payment attempt failed | Red |

#### Filtering:
1. **Search**: Type student name or program name
2. **Status Filter**: Select one or more statuses
3. **Method Filter**: Filter by payment method
4. Filters can be combined for precise results

#### Updating Payment Status:
1. Find payment in table
2. Click status dropdown in "Actions" column
3. Select new status
4. Add optional notes
5. Status updates automatically:
   - Setting to "Paid" records timestamp
   - Setting to "Refunded" records refund timestamp

#### Exporting Data:
1. Click "Export CSV" button (top-right)
2. CSV file downloads with all visible payments
3. Columns included:
   - Student Name, Program, Amount, Status, Method, Date, Notes

**Use Cases for Export**:
- Monthly financial reports
- Reconciliation with accounting software
- Tax preparation
- Board reporting

---

## Communication Templates

### Why Use Templates?
- **Consistency**: Same message quality for all students
- **Efficiency**: Save time with pre-written messages
- **Personalization**: Use variables for custom details

### Template Types:
1. **Missing Documents**: Request additional files
2. **Interview Invitation**: Schedule interview
3. **Acceptance Letter**: Congratulate accepted students
4. **Rejection Letter**: Politely decline applicants
5. **General**: Any other communication

### Creating a Template

1. Navigate to **Templates** → Click "New Template"
2. Fill in fields:
   - **Type**: Choose template type
   - **Name**: Internal name (e.g., "Acceptance Letter 2025")
   - **Subject**: Email subject line
   - **Body**: Message content

3. **Use Variables**: Insert dynamic content
   - `{{studentName}}` - Student's full name
   - `{{programName}}` - Applied program name
   - `{{universityName}}` - Your university name
   - `{{applicationDate}}` - Date application submitted

4. **Preview**: Check live preview on right side
   - Shows how email will look with sample data
   - Verify variables are detected

5. **Save**: Click "Save Template"

### Example Template:
```
Subject: Congratulations! Acceptance to {{programName}}

Dear {{studentName}},

We are delighted to inform you that you have been accepted 
to the {{programName}} program at {{universityName}}.

Your application, submitted on {{applicationDate}}, has been 
carefully reviewed and we are impressed by your qualifications.

Next Steps:
1. Confirm your enrollment by [deadline]
2. Pay enrollment deposit
3. Complete registration forms

Welcome to {{universityName}}!

Sincerely,
Admissions Office
```

### Managing Templates:
- **Edit**: Click template name to edit
- **Duplicate**: Click "Duplicate" to create copy
- **Delete**: Click "Delete" to remove (confirmation required)
- **Organize**: Templates grouped by type

### Best Practices:
✅ Test templates by duplicating and editing test copies  
✅ Include all necessary variables for personalization  
✅ Keep tone professional and warm  
✅ Review preview before saving  
✅ Create versions for different scenarios (e.g., "Acceptance with Scholarship")  

---

## Analytics & Reporting

### Dashboard Metrics (8 KPIs)

Navigate to **Analytics** to view comprehensive insights.

#### Application Metrics:
1. **Total Applications**: All applications ever received
2. **New Applications**: Awaiting initial review
3. **In Review**: Currently being evaluated
4. **Accepted**: Total accepted applications

#### Performance Metrics:
5. **Acceptance Rate**: Accepted / (Accepted + Rejected) %
   - Green if ≥50%, Red if <50%
6. **Avg Processing Time**: Days from submission to decision
   - Green if ≤7 days, Orange if >7 days

#### Financial Metrics:
7. **Total Revenue**: Sum of all paid application fees
8. **Pending Payments**: Count of unpaid/pending fees

### Application Funnel Chart

**Visual Pipeline**: Bar chart showing distribution across statuses

**Insights**:
- **Bottlenecks**: If many applications stuck in "Missing Docs", consider clearer initial requirements
- **Conversion**: Track how many applications move from New → Accepted
- **Capacity**: Ensure "In Review" column doesn't overflow reviewer capacity

### Program Performance Table

**Columns**:
- Program Name
- Applications (total count)
- Accepted
- Rejected
- Acceptance Rate (%)

**Sortable**: Click column headers to sort by any metric

**Use Cases**:
- Identify most popular programs
- Compare acceptance rates across programs
- Allocate reviewer resources based on volume
- Report to department heads

### Exporting Analytics:
1. Click "Export Data" (top-right)
2. CSV includes:
   - All dashboard metrics
   - Funnel data (status breakdown)
   - Program performance table
3. Filename: `analytics-YYYY-MM-DD.csv`

### Recommended Review Frequency:
- **Daily**: Check new applications count
- **Weekly**: Review funnel distribution
- **Monthly**: Analyze program performance and acceptance rates
- **Quarterly**: Compare trends over time

---

## Staff Management

### Adding Staff Members

**Platform Admin Required**: Only platform administrators can add university staff.

**Process**:
1. Contact platform admin with new staff details:
   - Full name
   - Email address
   - Desired role (UNI_ADMIN, UNI_REVIEWER, UNI_FINANCE, UNI_VIEWER)
2. Admin adds user to `universities/{id}/staff/{userId}` in database
3. Staff member receives invitation email
4. Staff member signs in and accesses portal

### Staff Roles Explained:

#### UNI_ADMIN
**Full administrative access**
- Manage other staff members
- Create/edit/delete applications
- Approve/reject applications
- Manage payments
- Create/edit templates
- View all analytics
- **Use For**: Department heads, admissions directors

#### UNI_REVIEWER
**Application review focus**
- View all applications
- Update application status
- Add notes (internal and external)
- Approve/reject documents
- View assigned applications
- **Cannot**: Delete applications, manage payments, add staff
- **Use For**: Admissions officers, reviewers, evaluators

#### UNI_FINANCE
**Payment management focus**
- View all applications (read-only)
- Update payment status
- Export payment reports
- View financial analytics
- **Cannot**: Change application status, add notes, manage templates
- **Use For**: Finance officers, accountants, bursar staff

#### UNI_VIEWER
**Read-only access**
- View applications
- View payments
- View analytics
- **Cannot**: Edit anything, add notes, change statuses
- **Use For**: Department observers, board members, reporting staff

### Removing Staff:
1. Contact platform admin
2. Provide user email or ID
3. Admin removes from staff subcollection
4. User loses access immediately

---

## Troubleshooting

### Common Issues

#### "Unauthorized" Error
**Cause**: Session expired or not logged in  
**Solution**: 
1. Sign out completely
2. Clear browser cookies for `.campushaiti.org`
3. Sign in again

#### "Forbidden" Error
**Cause**: Insufficient permissions for action  
**Solution**:
1. Verify your role in portal (top-right profile menu)
2. Contact UNI_ADMIN to request role upgrade if needed
3. Check if you're accessing correct university subdomain

#### Application Not Appearing in Pipeline
**Cause**: Filter or status mismatch  
**Solution**:
1. Clear all filters in search bar
2. Check all status columns (scroll horizontally)
3. Verify application belongs to your university

#### Payment Status Won't Update
**Cause**: Permission restriction or network error  
**Solution**:
1. Verify you have UNI_FINANCE or UNI_ADMIN role
2. Check internet connection
3. Refresh page and try again
4. If persists, check browser console for errors

#### Template Variables Not Working
**Cause**: Incorrect syntax  
**Solution**:
1. Ensure variables wrapped in double curly braces: `{{variableName}}`
2. Check spelling: `{{studentName}}` not `{{student_name}}`
3. View available variables list in editor

#### CSV Export Empty
**Cause**: No data matches current filters  
**Solution**:
1. Clear all filters before exporting
2. Verify date range (if applicable)
3. Check if data exists in table before exporting

### Getting Help

**Technical Support**:
- Email: support@campushaiti.org
- Phone: [TBD]
- Hours: Monday-Friday, 9AM-5PM EST

**Documentation**:
- User Guide: This document
- Video Tutorials: [TBD]
- FAQ: [TBD]

**Feature Requests**:
- Submit via: [TBD]
- Include: Current workflow, desired feature, use case

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Open search |
| `Esc` | Close modals/dialogs |
| `Tab` | Navigate form fields |
| `Enter` | Submit forms |

---

## Data Privacy & Security

### Your Responsibilities:
✅ Keep login credentials confidential  
✅ Log out when using shared computers  
✅ Report suspicious activity immediately  
✅ Don't share sensitive applicant data externally  
✅ Follow university data protection policies  

### Platform Security:
- ✅ All data encrypted in transit (HTTPS)
- ✅ Database access strictly controlled
- ✅ Session cookies HTTP-only
- ✅ Regular security audits
- ✅ Firestore security rules enforced

---

## Appendix: Quick Reference

### Application Status Flow:
```
New → In Review → Missing Docs (if needed) → Interview (if needed) → Accepted/Rejected
```

### Payment Status Flow:
```
Unpaid → Pending → Paid
              ↓
          Failed → Unpaid
              ↓
         Refunded
```

### Variable Reference:
| Variable | Description | Example |
|----------|-------------|---------|
| `{{studentName}}` | Full name | John Doe |
| `{{programName}}` | Program name | Computer Science |
| `{{universityName}}` | University name | Université Caraïbes |
| `{{applicationDate}}` | Submission date | January 15, 2025 |

---

**Last Updated**: Phase 7 Completion  
**Version**: 1.0  
**For Support**: support@campushaiti.org  

**Happy Admissions! 🎓**
