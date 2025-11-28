/**
 * University Portal Types
 * Comprehensive type definitions for the university admin system
 */

import { Timestamp } from "firebase/firestore";

// ============================================================================
// Staff & Permissions
// ============================================================================

export type UniversityRole = 
  | "UNI_ADMIN"      // Full university management
  | "UNI_REVIEWER"   // Review applications, add notes
  | "UNI_FINANCE"    // View/update payments
  | "UNI_VIEWER";    // Read-only access

export interface UniversityStaff {
  userId: string;
  role: UniversityRole;
  permissions: string[];
  email: string;
  name: string;
  createdAt: Timestamp;
  invitedBy: string;
  invitedAt: Timestamp;
}

// Permission categories for granular access control
export const UNIVERSITY_PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD: "view_dashboard",
  VIEW_ANALYTICS: "view_analytics",
  
  // Applications
  VIEW_APPLICATIONS: "view_applications",
  EDIT_APPLICATIONS: "edit_applications",
  ASSIGN_REVIEWERS: "assign_reviewers",
  CHANGE_STATUS: "change_status",
  ADD_NOTES: "add_notes",
  VIEW_NOTES: "view_notes",
  MAKE_DECISIONS: "make_decisions",
  
  // Documents
  VIEW_DOCUMENTS: "view_documents",
  APPROVE_DOCUMENTS: "approve_documents",
  REQUEST_DOCUMENTS: "request_documents",
  
  // Programs
  VIEW_PROGRAMS: "view_programs",
  CREATE_PROGRAMS: "create_programs",
  EDIT_PROGRAMS: "edit_programs",
  DELETE_PROGRAMS: "delete_programs",
  
  // Templates
  VIEW_TEMPLATES: "view_templates",
  CREATE_TEMPLATES: "create_templates",
  EDIT_TEMPLATES: "edit_templates",
  DELETE_TEMPLATES: "delete_templates",
  SEND_MESSAGES: "send_messages",
  
  // Payments
  VIEW_PAYMENTS: "view_payments",
  UPDATE_PAYMENTS: "update_payments",
  EXPORT_PAYMENTS: "export_payments",
  RECONCILE_PAYMENTS: "reconcile_payments",
  
  // Settings
  VIEW_SETTINGS: "view_settings",
  EDIT_SETTINGS: "edit_settings",
  
  // Team
  VIEW_TEAM: "view_team",
  INVITE_TEAM: "invite_team",
  REMOVE_TEAM: "remove_team",
  MANAGE_ROLES: "manage_roles",
} as const;

export type UniversityPermission = typeof UNIVERSITY_PERMISSIONS[keyof typeof UNIVERSITY_PERMISSIONS];

// Role to permissions mapping
export const ROLE_PERMISSIONS: Record<UniversityRole, UniversityPermission[]> = {
  UNI_ADMIN: Object.values(UNIVERSITY_PERMISSIONS), // All permissions
  
  UNI_REVIEWER: [
    UNIVERSITY_PERMISSIONS.VIEW_DASHBOARD,
    UNIVERSITY_PERMISSIONS.VIEW_ANALYTICS,
    UNIVERSITY_PERMISSIONS.VIEW_APPLICATIONS,
    UNIVERSITY_PERMISSIONS.EDIT_APPLICATIONS,
    UNIVERSITY_PERMISSIONS.CHANGE_STATUS,
    UNIVERSITY_PERMISSIONS.ADD_NOTES,
    UNIVERSITY_PERMISSIONS.VIEW_NOTES,
    UNIVERSITY_PERMISSIONS.VIEW_DOCUMENTS,
    UNIVERSITY_PERMISSIONS.APPROVE_DOCUMENTS,
    UNIVERSITY_PERMISSIONS.REQUEST_DOCUMENTS,
    UNIVERSITY_PERMISSIONS.VIEW_PROGRAMS,
    UNIVERSITY_PERMISSIONS.VIEW_TEMPLATES,
    UNIVERSITY_PERMISSIONS.SEND_MESSAGES,
  ],
  
  UNI_FINANCE: [
    UNIVERSITY_PERMISSIONS.VIEW_DASHBOARD,
    UNIVERSITY_PERMISSIONS.VIEW_ANALYTICS,
    UNIVERSITY_PERMISSIONS.VIEW_APPLICATIONS,
    UNIVERSITY_PERMISSIONS.VIEW_PAYMENTS,
    UNIVERSITY_PERMISSIONS.UPDATE_PAYMENTS,
    UNIVERSITY_PERMISSIONS.EXPORT_PAYMENTS,
    UNIVERSITY_PERMISSIONS.RECONCILE_PAYMENTS,
    UNIVERSITY_PERMISSIONS.VIEW_PROGRAMS,
  ],
  
  UNI_VIEWER: [
    UNIVERSITY_PERMISSIONS.VIEW_DASHBOARD,
    UNIVERSITY_PERMISSIONS.VIEW_ANALYTICS,
    UNIVERSITY_PERMISSIONS.VIEW_APPLICATIONS,
    UNIVERSITY_PERMISSIONS.VIEW_NOTES,
    UNIVERSITY_PERMISSIONS.VIEW_DOCUMENTS,
    UNIVERSITY_PERMISSIONS.VIEW_PROGRAMS,
    UNIVERSITY_PERMISSIONS.VIEW_TEMPLATES,
    UNIVERSITY_PERMISSIONS.VIEW_PAYMENTS,
    UNIVERSITY_PERMISSIONS.VIEW_SETTINGS,
    UNIVERSITY_PERMISSIONS.VIEW_TEAM,
  ],
};

// ============================================================================
// Applications
// ============================================================================

export type ApplicationStatus = 
  | "new"
  | "in_review"
  | "missing_docs"
  | "interview"
  | "accepted"
  | "rejected"
  | "withdrawn";

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  new: "New",
  in_review: "In Review",
  missing_docs: "Missing Documents",
  interview: "Interview",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  new: "bg-blue-100 text-blue-800",
  in_review: "bg-yellow-100 text-yellow-800",
  missing_docs: "bg-orange-100 text-orange-800",
  interview: "bg-purple-100 text-purple-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  withdrawn: "bg-gray-100 text-gray-800",
};

export interface ApplicationScorecard {
  academicScore?: number;
  essayScore?: number;
  experienceScore?: number;
  recommendationsScore?: number;
  overallScore?: number;
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  notes?: string;
}

export interface ApplicationTimelineEvent {
  id: string;
  action: string;
  performedBy: string;
  performedByName: string;
  performedAt: Timestamp;
  details?: Record<string, any>;
  previousValue?: any;
  newValue?: any;
}

export interface EnhancedApplication {
  id: string;
  // Existing fields...
  studentId: string;
  universityId: string;
  programId: string;
  
  // Enhanced fields
  status: ApplicationStatus;
  assignedReviewer?: string;
  assignedReviewerName?: string;
  scorecard?: ApplicationScorecard;
  timeline: ApplicationTimelineEvent[];
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  submittedAt?: Timestamp;
  reviewedAt?: Timestamp;
  decidedAt?: Timestamp;
}

// ============================================================================
// Documents
// ============================================================================

export type DocumentStatus = 
  | "required"
  | "received"
  | "approved"
  | "rejected";

export interface ApplicationDocument {
  id: string;
  applicationId: string;
  type: string; // "transcript", "passport", "essay", etc.
  name: string;
  url?: string;
  uploadedAt?: Timestamp;
  status: DocumentStatus;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: Timestamp;
  rejectionReason?: string;
  required: boolean;
}

// ============================================================================
// Notes
// ============================================================================

export interface ApplicationNote {
  id: string;
  applicationId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  text: string;
  isInternal: boolean; // Internal notes visible only to staff
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// ============================================================================
// Templates
// ============================================================================

export type MessageTemplateType = 
  | "missing_documents"
  | "interview_invitation"
  | "acceptance_letter"
  | "rejection_notice"
  | "general";

export interface MessageTemplate {
  id: string;
  universityId: string;
  type: MessageTemplateType;
  name: string;
  subject: string;
  body: string;
  variables: string[]; // e.g., ["studentName", "programName"]
  isDefault: boolean;
  createdAt: Timestamp;
  createdBy: string;
  updatedAt?: Timestamp;
}

export interface TemplateVariables {
  studentName?: string;
  studentEmail?: string;
  programName?: string;
  universityName?: string;
  reviewerName?: string;
  deadline?: string;
  interviewDate?: string;
  interviewTime?: string;
  interviewLocation?: string;
  missingDocuments?: string[];
  [key: string]: any;
}

// ============================================================================
// Payments
// ============================================================================

export type PaymentStatus = 
  | "unpaid"
  | "pending"
  | "paid"
  | "refunded"
  | "failed";

export type PaymentMethod = 
  | "stripe"
  | "moncash"
  | "bank_transfer"
  | "cash"
  | "other";

export interface Payment {
  id: string;
  applicationId: string;
  universityId: string;
  studentId: string;
  studentName: string;
  programId: string;
  programName: string;
  amount: number;
  currency: string; // "USD", "HTG"
  status: PaymentStatus;
  method: PaymentMethod;
  transactionId?: string;
  stripePaymentIntentId?: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  paidAt?: Timestamp;
  refundedAt?: Timestamp;
  updatedBy?: string;
}

export interface PaymentExportFilters {
  startDate: Date;
  endDate: Date;
  status?: PaymentStatus;
  programId?: string;
  method?: PaymentMethod;
}

// ============================================================================
// Analytics
// ============================================================================

export interface DashboardKPIs {
  totalApplications: number;
  newApplications: number;
  inReview: number;
  accepted: number;
  rejected: number;
  acceptanceRate: number;
  averageProcessingDays: number;
  totalRevenue: number;
  pendingPayments: number;
}

export interface ApplicationFunnelData {
  status: ApplicationStatus;
  count: number;
  percentage: number;
}

export interface ProgramStats {
  programId: string;
  programName: string;
  applications: number;
  accepted: number;
  rejected: number;
  acceptanceRate: number;
  averageScore?: number;
}

export interface ReviewerWorkload {
  reviewerId: string;
  reviewerName: string;
  assigned: number;
  reviewed: number;
  pending: number;
  averageDaysToReview: number;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface ApplicationListFilters {
  status?: ApplicationStatus;
  programId?: string;
  assignedReviewer?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface BulkAssignRequest {
  applicationIds: string[];
  reviewerId: string;
  reviewerName: string;
}

export interface UpdateStatusRequest {
  status: ApplicationStatus;
  note?: string;
}

export interface RequestDocumentsRequest {
  templateId: string;
  documentTypes: string[];
  customMessage?: string;
}

export interface ApplicationDecisionRequest {
  decision: "accepted" | "rejected";
  templateId?: string;
  customMessage?: string;
  scorecard?: ApplicationScorecard;
}

export interface CreateNoteRequest {
  text: string;
  isInternal: boolean;
}

export interface UpdateDocumentStatusRequest {
  status: DocumentStatus;
  rejectionReason?: string;
}
