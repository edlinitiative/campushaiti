/**
 * Audit Logger
 * Comprehensive logging system for security and compliance
 */

import { collection } from "@/lib/firebase/database-helpers";

export enum AuditAction {
  // Authentication
  USER_LOGIN = "USER_LOGIN",
  USER_LOGOUT = "USER_LOGOUT",
  USER_REGISTER = "USER_REGISTER",
  PASSWORD_RESET = "PASSWORD_RESET",
  
  // User Management
  USER_CREATED = "USER_CREATED",
  USER_UPDATED = "USER_UPDATED",
  USER_DELETED = "USER_DELETED",
  USER_ROLE_CHANGED = "USER_ROLE_CHANGED",
  
  // Applications
  APPLICATION_CREATED = "APPLICATION_CREATED",
  APPLICATION_UPDATED = "APPLICATION_UPDATED",
  APPLICATION_STATUS_CHANGED = "APPLICATION_STATUS_CHANGED",
  APPLICATION_DELETED = "APPLICATION_DELETED",
  APPLICATION_EXPORTED = "APPLICATION_EXPORTED",
  
  // Documents
  DOCUMENT_UPLOADED = "DOCUMENT_UPLOADED",
  DOCUMENT_DELETED = "DOCUMENT_DELETED",
  DOCUMENT_DOWNLOADED = "DOCUMENT_DOWNLOADED",
  
  // Universities & Programs
  UNIVERSITY_CREATED = "UNIVERSITY_CREATED",
  UNIVERSITY_UPDATED = "UNIVERSITY_UPDATED",
  UNIVERSITY_DELETED = "UNIVERSITY_DELETED",
  PROGRAM_CREATED = "PROGRAM_CREATED",
  PROGRAM_UPDATED = "PROGRAM_UPDATED",
  PROGRAM_DELETED = "PROGRAM_DELETED",
  
  // Payments
  PAYMENT_PROCESSED = "PAYMENT_PROCESSED",
  PAYMENT_REFUNDED = "PAYMENT_REFUNDED",
  
  // Email
  EMAIL_SENT = "EMAIL_SENT",
  BULK_EMAIL_SENT = "BULK_EMAIL_SENT",
  
  // Data Access
  DATA_EXPORTED = "DATA_EXPORTED",
  DATA_IMPORTED = "DATA_IMPORTED",
  GDPR_DATA_REQUEST = "GDPR_DATA_REQUEST",
  GDPR_DATA_DELETION = "GDPR_DATA_DELETION",
  
  // Security
  FAILED_LOGIN = "FAILED_LOGIN",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  UNAUTHORIZED_ACCESS = "UNAUTHORIZED_ACCESS",
  PERMISSION_DENIED = "PERMISSION_DENIED",
  
  // System
  SETTINGS_CHANGED = "SETTINGS_CHANGED",
  BACKUP_CREATED = "BACKUP_CREATED",
}

export enum AuditSeverity {
  INFO = "INFO",
  WARNING = "WARNING",
  ERROR = "ERROR",
  CRITICAL = "CRITICAL",
}

export interface AuditLogEntry {
  action: AuditAction;
  severity: AuditSeverity;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  ipAddress?: string;
  userAgent?: string;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, any>;
  metadata?: Record<string, any>;
  timestamp: number; // Changed to number for Realtime Database compatibility
  success: boolean;
  errorMessage?: string;
}

export class AuditLogger {
  private static instance: AuditLogger;

  private constructor() {}

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  /**
   * Log an audit event
   */
  async log(entry: Partial<AuditLogEntry> & { action: AuditAction }): Promise<void> {
    try {
      // Use Realtime Database for audit logs
      
      const logEntry: AuditLogEntry = {
        severity: AuditSeverity.INFO,
        timestamp: Date.now(),
        success: true,
        ...entry,
      };

      // Store in Realtime Database
      await collection("auditLogs").add(logEntry);

      // Console log for development (remove in production)
      if (process.env.NODE_ENV === "development") {
        console.log(`[AUDIT] ${entry.action}:`, logEntry);
      }

      // For critical events, could send alerts
      if (logEntry.severity === AuditSeverity.CRITICAL) {
        // TODO: Send alert to admin team
        console.error("[CRITICAL AUDIT EVENT]", logEntry);
      }
    } catch (error) {
      // Fail silently to not disrupt application flow
      console.error("Failed to write audit log:", error);
    }
  }

  /**
   * Log a successful action
   */
  async logSuccess(
    action: AuditAction,
    userId: string | undefined,
    details?: Record<string, any>
  ): Promise<void> {
    await this.log({
      action,
      userId,
      details,
      success: true,
      severity: AuditSeverity.INFO,
    });
  }

  /**
   * Log a failed action
   */
  async logFailure(
    action: AuditAction,
    userId: string | undefined,
    errorMessage: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.log({
      action,
      userId,
      errorMessage,
      details,
      success: false,
      severity: AuditSeverity.ERROR,
    });
  }

  /**
   * Log a security event
   */
  async logSecurityEvent(
    action: AuditAction,
    ipAddress: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.log({
      action,
      ipAddress,
      details,
      severity: AuditSeverity.WARNING,
    });
  }

  /**
   * Query audit logs
   */
  async query(filters: {
    userId?: string;
    action?: AuditAction;
    startDate?: number;
    endDate?: number;
    limit?: number;
  }): Promise<AuditLogEntry[]> {
    try {
      let query = collection("auditLogs").orderBy("timestamp", "desc");

      if (filters.userId) {
        query = query.where("userId", "==", filters.userId);
      }

      if (filters.action) {
        query = query.where("action", "==", filters.action);
      }

      if (filters.startDate) {
        query = query.where("timestamp", ">=", filters.startDate);
      }

      if (filters.endDate) {
        query = query.where("timestamp", "<=", filters.endDate);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => ({
        ...doc.data(),
        timestamp: doc.data().timestamp || Date.now(),
      })) as AuditLogEntry[];
    } catch (error) {
      console.error("Failed to query audit logs:", error);
      return [];
    }
  }
}

// Export singleton instance
export const auditLogger = AuditLogger.getInstance();
