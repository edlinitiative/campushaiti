# University Portal (Admin Side) Implementation Plan

## Assessment
✅ **Already exists:**
- `/schools/dashboard` - Basic dashboard
- `/schools/dashboard/programs` - Program CRUD
- `/schools/dashboard/team` - Team management
- `/schools/dashboard/applications` - Application list
- `/schools/dashboard/settings` - University profile
- Firebase Auth + Firestore setup
- Role system: ADMIN, SCHOOL_ADMIN, APPLICANT
- Security rules partially in place

❌ **Missing/Needs enhancement:**
- Kanban board for application pipeline
- Document management with status tracking
- Message templates system
- Payment tracking & export
- Enhanced analytics dashboard
- Granular staff roles (uni_admin, uni_reviewer, uni_finance)
- Application detail page with scorecard/notes/audit trail
- CSV export functionality

## Implementation Strategy

### Phase 1: Enhanced Data Model & Roles
**Goal**: Add granular permissions and extend Firestore schema

1. **Extend role system** to support:
   - `UNI_ADMIN` (full university management)
   - `UNI_REVIEWER` (review applications, add notes)
   - `UNI_FINANCE` (view/update payments)
   - `UNI_VIEWER` (read-only access)

2. **Firestore collections to add/modify**:
   ```
   universities/{uniId}/staff/{userId}
     - role: "UNI_ADMIN" | "UNI_REVIEWER" | "UNI_FINANCE" | "UNI_VIEWER"
     - permissions: string[]
     - createdAt, invitedBy

   applications/{appId}
     - Add: status (enum), assignedReviewer, scorecard{}, timeline[]
     
   applications/{appId}/documents/{docId}
     - type, url, uploadedAt, status, reviewedBy, reviewedAt
     
   applications/{appId}/notes/{noteId}
     - authorId, authorName, text, createdAt, isInternal
     
   applications/{appId}/timeline/{eventId}
     - action, performedBy, performedAt, details
     
   messageTemplates/{templateId}
     - uniId, type, subject, body, variables[], createdAt
     
   payments/{paymentId}
     - appId, uniId, studentId, amount, status, method, createdAt, updatedAt
   ```

3. **Firestore rules update**:
   - Staff subcollection permissions
   - Document status tracking
   - Notes visibility (internal vs external)
   - Payment access by finance role

**Checkpoint**: Commit "Add enhanced role system and extended data model"

---

### Phase 2: Application Pipeline (Kanban Board)
**Goal**: Visual pipeline for application management

**Route**: `/uni/applications/board`

**Features**:
- Drag-and-drop kanban columns:
  - New → In Review → Missing Docs → Interview → Accepted → Rejected
- Filter by program, date range, reviewer
- Bulk actions (assign reviewer, change status)
- Real-time updates (optimistic UI)
- Timeline tracking for each status change

**Components**:
- `ApplicationBoard.tsx` - Main kanban container
- `ApplicationCard.tsx` - Draggable card
- `BoardColumn.tsx` - Drop zone with status
- `BulkActionBar.tsx` - Multi-select actions

**API Endpoints**:
- `PATCH /api/uni/applications/[id]/status` - Update status with timeline
- `POST /api/uni/applications/bulk-assign` - Assign reviewer to multiple
- `GET /api/uni/applications?view=board` - Get applications for board view

**Checkpoint**: Commit "Add application kanban board with drag-and-drop"

---

### Phase 3: Application Detail Page
**Goal**: Comprehensive application review interface

**Route**: `/uni/applications/[id]`

**Sections**:
1. **Header**: Applicant info, status badge, assigned reviewer, quick actions
2. **Tabs**:
   - **Overview**: Profile data, program selection, scorecard
   - **Documents**: Checklist with upload/approve/reject per document
   - **Notes**: Internal notes thread, activity log
   - **Timeline**: Audit trail of all actions
   - **Decision**: Accept/reject with template message

**Features**:
- Scorecard system (customizable criteria)
- Document status workflow (required → received → approved/rejected)
- Request missing documents (use templates)
- Internal notes (staff only) + external communication
- Decision panel with template selection

**Components**:
- `ApplicationDetail.tsx` - Main container
- `ApplicationHeader.tsx` - Status & actions
- `DocumentChecklist.tsx` - Document management
- `ScoreCard.tsx` - Evaluation form
- `NotesThread.tsx` - Communication log
- `TimelineView.tsx` - Audit trail
- `DecisionPanel.tsx` - Accept/reject workflow

**API Endpoints**:
- `GET /api/uni/applications/[id]` - Full application with subcollections
- `PATCH /api/uni/applications/[id]/documents/[docId]` - Update doc status
- `POST /api/uni/applications/[id]/notes` - Add note
- `POST /api/uni/applications/[id]/request-documents` - Send template email
- `POST /api/uni/applications/[id]/decision` - Final accept/reject

**Checkpoint**: Commit "Add comprehensive application detail page"

---

### Phase 4: Message Templates
**Goal**: Reusable communication templates

**Route**: `/uni/templates`

**Template Types**:
- Missing documents request
- Interview invitation
- Acceptance letter
- Rejection notice
- General communication

**Features**:
- Rich text editor
- Variable placeholders: {studentName}, {programName}, {universityName}, etc.
- Preview with sample data
- Default templates + custom templates
- Per-university template library

**Components**:
- `TemplateList.tsx` - Browse templates
- `TemplateEditor.tsx` - Create/edit with rich text
- `TemplatePreview.tsx` - Preview with variables replaced
- `TemplateSelector.tsx` - Choose template in application detail

**API Endpoints**:
- `GET /api/uni/templates` - List templates
- `POST /api/uni/templates` - Create template
- `PUT /api/uni/templates/[id]` - Update template
- `DELETE /api/uni/templates/[id]` - Delete template
- `POST /api/uni/templates/[id]/preview` - Generate preview

**Checkpoint**: Commit "Add message template system"

---

### Phase 5: Payment Management
**Goal**: Track and export payment data

**Route**: `/uni/payments`

**Features**:
- Table view: student, program, amount, status, method, date
- Filters: status (unpaid/pending/paid/refunded), date range, program
- Status update (for finance role)
- Monthly CSV export
- Payment reconciliation tools
- Integration with existing Stripe/MonCash webhooks

**Components**:
- `PaymentTable.tsx` - Data grid with filters
- `PaymentStatus Badge.tsx` - Visual status indicator
- `ExportDialog.tsx` - Date range picker for CSV
- `ReconciliationView.tsx` - Match payments to applications

**API Endpoints**:
- `GET /api/uni/payments` - List with filters
- `PATCH /api/uni/payments/[id]` - Update status (finance only)
- `GET /api/uni/payments/export?month=YYYY-MM` - Generate CSV
- `POST /api/uni/payments/reconcile` - Bulk reconciliation

**Checkpoint**: Commit "Add payment tracking and export"

---

### Phase 6: Enhanced Analytics
**Goal**: Comprehensive university dashboard

**Route**: `/uni/dashboard` (enhance existing)

**KPIs to add**:
- Application funnel (by status)
- Acceptance rate by program
- Average processing time
- Document completion rate
- Revenue metrics (if applicable)
- Reviewer workload distribution

**Visualizations**:
- Funnel chart for pipeline
- Line chart for trends over time
- Bar chart for program comparisons
- Pie chart for status distribution
- Table for top programs

**Components**:
- `DashboardKPIs.tsx` - Metric cards
- `ApplicationFunnel.tsx` - Pipeline visualization
- `ProgramPerformance.tsx` - Comparison charts
- `ReviewerWorkload.tsx` - Staff analytics

**API Endpoints**:
- `GET /api/uni/analytics/overview` - KPIs
- `GET /api/uni/analytics/funnel` - Pipeline data
- `GET /api/uni/analytics/programs` - Program stats
- `GET /api/uni/analytics/reviewers` - Workload data

**Checkpoint**: Commit "Enhance dashboard with comprehensive analytics"

---

### Phase 7: Security & Testing
**Goal**: Lock down permissions and ensure quality

**Tasks**:
1. Update Firestore rules for new collections
2. Add server-side role checks in all APIs
3. Add input validation (zod schemas)
4. Add loading/error states to all components
5. Add empty states with helpful CTAs
6. Test all role permissions
7. Add seed script for demo data

**Security checklist**:
- [ ] Staff subcollection restricted by uniId
- [ ] Documents readable by applicant + uni staff
- [ ] Notes: internal notes staff-only
- [ ] Payments: finance role required for updates
- [ ] Templates: uni-specific access
- [ ] Timeline: append-only audit trail

**Checkpoint**: Commit "Add security rules and comprehensive validation"

---

## File Structure

```
app/
├── api/
│   └── uni/
│       ├── applications/
│       │   ├── route.ts (list with filters)
│       │   ├── [id]/
│       │   │   ├── route.ts (get detail)
│       │   │   ├── status/route.ts (update status)
│       │   │   ├── documents/[docId]/route.ts
│       │   │   ├── notes/route.ts
│       │   │   ├── request-documents/route.ts
│       │   │   └── decision/route.ts
│       │   └── bulk-assign/route.ts
│       ├── templates/
│       │   ├── route.ts
│       │   ├── [id]/route.ts
│       │   └── [id]/preview/route.ts
│       ├── payments/
│       │   ├── route.ts
│       │   ├── [id]/route.ts
│       │   └── export/route.ts
│       └── analytics/
│           ├── overview/route.ts
│           ├── funnel/route.ts
│           ├── programs/route.ts
│           └── reviewers/route.ts
│
└── [locale]/
    └── uni/
        ├── dashboard/page.tsx (enhanced)
        ├── profile/page.tsx (rename from settings)
        ├── programs/page.tsx (enhance existing)
        ├── applications/
        │   ├── page.tsx (list view - enhance existing)
        │   ├── board/page.tsx (NEW - kanban)
        │   └── [id]/page.tsx (NEW - detail)
        ├── templates/page.tsx (NEW)
        └── payments/page.tsx (NEW)

components/
└── uni/
    ├── ApplicationBoard.tsx
    ├── ApplicationCard.tsx
    ├── ApplicationDetail.tsx
    ├── DocumentChecklist.tsx
    ├── ScoreCard.tsx
    ├── NotesThread.tsx
    ├── TimelineView.tsx
    ├── DecisionPanel.tsx
    ├── TemplateEditor.tsx
    ├── PaymentTable.tsx
    └── DashboardKPIs.tsx

lib/
├── types/
│   └── uni.ts (TypeScript interfaces)
├── utils/
│   ├── csv-export.ts
│   └── template-parser.ts
└── hooks/
    └── use-uni-permissions.ts
```

---

## Estimated Timeline
- Phase 1: 1-2 hours (data model + roles)
- Phase 2: 2-3 hours (kanban board)
- Phase 3: 3-4 hours (application detail)
- Phase 4: 1-2 hours (templates)
- Phase 5: 1-2 hours (payments)
- Phase 6: 2-3 hours (analytics)
- Phase 7: 2-3 hours (security + testing)

**Total**: 12-19 hours of focused implementation

---

## Next Steps
1. Review and approve this plan
2. Start with Phase 1 (foundational)
3. Implement feature-by-feature with commits
4. Test locally in Codespace
5. Deploy and verify

Ready to begin? I'll start with Phase 1 unless you want to adjust the plan.
