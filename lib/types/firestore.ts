export type UserRole = "APPLICANT" | "REVIEWER" | "ADMIN" | "SCHOOL_ADMIN";

export type UniversityStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

export type ApplicationStatus = "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "ACCEPTED" | "REJECTED";

export type ApplicationItemStatus = "PENDING" | "SUBMITTED" | "PAID" | "APPROVED" | "REJECTED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type PaymentProvider = "STRIPE" | "MONCASH";

export type DocumentKind = 
  | "TRANSCRIPT"
  | "DIPLOMA"
  | "ID_CARD"
  | "PASSPORT"
  | "RECOMMENDATION_LETTER"
  | "PERSONAL_STATEMENT"
  | "CV"
  | "OTHER";

export interface User {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Education {
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: Date;
  endDate?: Date;
  current?: boolean;
}

export interface Profile {
  uid: string;
  phone?: string;
  nationality?: string;
  birthDate?: Date;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  education: Education[];
  essays: {
    personalStatement?: string;
    whyThisProgram?: string;
    careerGoals?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface University {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  logoUrl?: string;
  websiteUrl?: string;
  contactEmail: string;
  contactPhone?: string;
  description?: string;
  status: UniversityStatus;
  adminUids: string[]; // School admins who can manage this university
  bankAccount?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    routingNumber?: string;
    swiftCode?: string;
  };
  stripeAccountId?: string; // For receiving payments via Stripe Connect
  monCashAccountId?: string;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  approvedBy?: string; // Admin uid who approved
}

export interface Program {
  id: string;
  universityId: string;
  name: string;
  degree: string;
  description: string;
  requirements: string;
  feeCents: number;
  currency: string;
  deadline: Date;
  customQuestions?: CustomQuestion[]; // University-specific questions
  createdAt: Date;
  updatedAt: Date;
}

export type QuestionType = "TEXT" | "TEXTAREA" | "SELECT" | "MULTISELECT" | "FILE" | "DATE" | "NUMBER";

export interface CustomQuestion {
  id: string;
  question: string;
  type: QuestionType;
  required: boolean;
  options?: string[]; // For SELECT/MULTISELECT
  placeholder?: string;
  helpText?: string;
  order: number;
}

export interface Application {
  id: string;
  applicantUid: string;
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApplicationItem {
  id: string;
  applicationId: string;
  programId: string;
  
  // University/Program info (denormalized for efficient querying)
  universityId: string;
  universityName: string;
  programName: string;
  programDegree: string;
  
  // Applicant info (denormalized)
  applicantUid: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  
  // Profile data
  personalStatement?: string;
  nationality?: string;
  birthDate?: Date;
  
  // Education background
  education?: {
    schoolName: string;
    graduationYear: string;
    gpa?: string;
    fieldOfStudy?: string;
  };
  
  // Document references
  documentIds: string[]; // IDs from documents collection
  
  // Status and tracking
  status: ApplicationItemStatus;
  checklist: {
    profileComplete?: boolean;
    documentsUploaded?: boolean;
    essaysSubmitted?: boolean;
    customQuestionsAnswered?: boolean;
    paymentReceived?: boolean;
  };
  
  // Custom university questions
  customAnswers?: ApplicationItemAnswer[]; // Answers to university custom questions
  
  // Payment
  paymentId?: string;
  feePaidCents?: number;
  feePaidCurrency?: string;
  
  // Review tracking
  submittedAt?: Date;
  reviewedBy?: string; // School admin UID
  reviewedAt?: Date;
  reviewNotes?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  ownerUid: string;
  kind: DocumentKind;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  createdAt: Date;
}

export interface Payment {
  id: string;
  provider: PaymentProvider;
  providerRef: string;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
  metadata?: {
    applicationItemId?: string;
    programId?: string;
    applicantUid?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  recipientUid: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  actorUid: string;
  action: string;
  resource: string;
  resourceId: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// School Partner Types
export type SchoolStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

export interface School {
  id: string;
  name: string;
  slug: string;
  description: string;
  city: string;
  country: string;
  website?: string;
  email: string;
  phone?: string;
  logoUrl?: string;
  bannerUrl?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  status: SchoolStatus;
  adminUids: string[]; // School administrators
  settings: {
    acceptsApplications: boolean;
    requiresPayment: boolean;
    applicationFeeCents?: number;
    currency?: string;
  };
  paymentInfo?: {
    provider: "STRIPE" | "MONCASH" | "BANK_TRANSFER";
    accountId?: string; // Stripe Connect account ID
    bankDetails?: {
      accountName?: string;
      accountNumber?: string;
      bankName?: string;
      routingNumber?: string;
    };
  };
  statistics: {
    totalApplications: number;
    pendingApplications: number;
    acceptedApplications: number;
    rejectedApplications: number;
  };
  rejectionReason?: string; // If status is REJECTED
  approvedAt?: Date;
  approvedBy?: string; // Admin UID who approved
  createdAt: Date;
  updatedAt: Date;
}

export interface SchoolProgram {
  id: string;
  schoolId: string;
  name: string;
  degree: string; // e.g., "Bachelor's", "Master's", "Certificate"
  description: string;
  requirements: string;
  duration?: string; // e.g., "4 years", "2 semesters"
  language?: string; // e.g., "English", "French", "Kreyòl"
  feeCents: number;
  currency: string;
  capacity?: number; // Maximum number of students
  deadline?: Date;
  startDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomQuestion {
  id: string;
  schoolId: string;
  programId?: string; // Optional: specific to a program, null = all programs
  question: string;
  type: QuestionType;
  required: boolean;
  options?: string[]; // For SELECT/MULTISELECT types
  placeholder?: string;
  helpText?: string;
  order: number; // Display order
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SchoolApplication {
  id: string;
  schoolId: string;
  programId: string;
  applicantUid: string;
  status: "SUBMITTED" | "UNDER_REVIEW" | "ACCEPTED" | "REJECTED" | "WAITLISTED";
  customAnswers: Record<string, any>; // Question ID -> Answer
  reviewNotes?: string;
  reviewedBy?: string; // School admin UID
  reviewedAt?: Date;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SchoolMessage {
  id: string;
  schoolId: string;
  applicationId: string;
  senderUid: string;
  senderRole: "APPLICANT" | "SCHOOL_ADMIN";
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface SchoolAnalytics {
  schoolId: string;
  period: string; // e.g., "2025-01", "2025-Q1"
  metrics: {
    newApplications: number;
    acceptedApplications: number;
    rejectedApplications: number;
    revenue: number;
    averageReviewTime: number; // in hours
    conversionRate: number; // percentage
  };
  createdAt: Date;
}

export interface UniversityRegistration {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  contactEmail: string;
  contactPhone?: string;
  websiteUrl?: string;
  description?: string;
  logoUrl?: string;
  
  // Contact person
  contactPersonName: string;
  contactPersonEmail: string;
  contactPersonPhone?: string;
  contactPersonTitle?: string;
  
  // Registration info
  registrationNumber?: string;
  taxId?: string;
  
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  reviewedBy?: string; // Admin UID
  reviewedAt?: Date;
  
  submittedBy: string; // User UID who submitted
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApplicationItemAnswer {
  questionId: string;
  answer: string | string[] | number | Date;
  fileUrl?: string; // For FILE type questions
}
