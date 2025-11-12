export type UserRole = "APPLICANT" | "REVIEWER" | "ADMIN";

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
  contactEmail: string;
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
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
  status: ApplicationItemStatus;
  checklist: {
    profileComplete?: boolean;
    documentsUploaded?: boolean;
    essaysSubmitted?: boolean;
    paymentReceived?: boolean;
  };
  paymentId?: string;
  submittedAt?: Date;
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
