/**
 * GDPR Compliance
 * Data export and deletion for user privacy rights
 */

import { getAdminDb } from "@/lib/firebase/admin";
import { auditLogger, AuditAction } from "./audit-logger";

export interface GDPRDataExport {
  user: any;
  applications: any[];
  documents: any[];
  payments: any[];
  auditLogs: any[];
  exportDate: Date;
}

export class GDPRService {
  /**
   * Export all user data (Right to Access)
   */
  static async exportUserData(userId: string): Promise<GDPRDataExport> {
    const db = getAdminDb();

    try {
      // Log GDPR request
      await auditLogger.log({
        action: AuditAction.GDPR_DATA_REQUEST,
        userId,
        details: { requestType: "data_export" },
      });

      // Fetch all user data
      const [userDoc, applicationsSnap, documentsSnap, auditLogsSnap] = await Promise.all([
        db.collection("users").doc(userId).get(),
        db.collection("applicationItems").where("applicantUid", "==", userId).get(),
        db.collection("documents").where("ownerUid", "==", userId).get(),
        db.collection("auditLogs").where("userId", "==", userId).limit(1000).get(),
      ]);

      const userData = userDoc.exists ? userDoc.data() : null;
      const applications = applicationsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const documents = documentsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const auditLogs = auditLogsSnap.docs.map((doc) => doc.data());

      // Get payment data from applications
      const payments = applications
        .filter((app: any) => app.feePaidCents > 0)
        .map((app: any) => ({
          applicationId: app.id,
          amount: app.feePaidCents,
          currency: app.feePaidCurrency,
          date: app.updatedAt,
        }));

      return {
        user: userData,
        applications,
        documents: documents.map((doc) => ({
          id: doc.id,
          kind: doc.kind,
          fileName: doc.fileName,
          uploadedAt: doc.uploadedAt,
          // Don't include actual file URLs for privacy
        })),
        payments,
        auditLogs: auditLogs.map((log: any) => ({
          action: log.action,
          timestamp: log.timestamp,
          success: log.success,
          // Remove sensitive details
        })),
        exportDate: new Date(),
      };
    } catch (error) {
      await auditLogger.logFailure(
        AuditAction.GDPR_DATA_REQUEST,
        userId,
        error instanceof Error ? error.message : "Unknown error"
      );
      throw error;
    }
  }

  /**
   * Delete all user data (Right to Erasure)
   * Note: Some data may need to be retained for legal compliance
   */
  static async deleteUserData(
    userId: string,
    options: {
      deleteApplications?: boolean;
      deleteDocuments?: boolean;
      anonymizeAuditLogs?: boolean;
    } = {}
  ): Promise<{
    success: boolean;
    deleted: string[];
    retained: string[];
  }> {
    const db = getAdminDb();
    const deleted: string[] = [];
    const retained: string[] = [];

    try {
      // Log deletion request
      await auditLogger.log({
        action: AuditAction.GDPR_DATA_DELETION,
        userId,
        details: { options },
      });

      // Delete user profile
      await db.collection("users").doc(userId).delete();
      deleted.push("user_profile");

      // Handle applications
      if (options.deleteApplications) {
        const applicationsSnap = await db
          .collection("applicationItems")
          .where("applicantUid", "==", userId)
          .get();

        const batch = db.batch();
        applicationsSnap.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        deleted.push(`${applicationsSnap.size} applications`);
      } else {
        // Anonymize instead of delete (for compliance)
        const applicationsSnap = await db
          .collection("applicationItems")
          .where("applicantUid", "==", userId)
          .get();

        const batch = db.batch();
        applicationsSnap.docs.forEach((doc) => {
          batch.update(doc.ref, {
            applicantUid: "DELETED_USER",
            email: "deleted@privacy.local",
            firstName: "Deleted",
            lastName: "User",
            phone: "",
            dateOfBirth: null,
          });
        });
        await batch.commit();
        retained.push(`${applicationsSnap.size} applications (anonymized)`);
      }

      // Delete documents
      if (options.deleteDocuments) {
        const documentsSnap = await db
          .collection("documents")
          .where("ownerUid", "==", userId)
          .get();

        const batch = db.batch();
        documentsSnap.docs.forEach((doc) => {
          batch.delete(doc.ref);
          // TODO: Also delete file from Firebase Storage
        });
        await batch.commit();
        deleted.push(`${documentsSnap.size} documents`);
      }

      // Anonymize audit logs (cannot delete for compliance)
      if (options.anonymizeAuditLogs) {
        const logsSnap = await db
          .collection("auditLogs")
          .where("userId", "==", userId)
          .limit(1000)
          .get();

        const batch = db.batch();
        logsSnap.docs.forEach((doc) => {
          batch.update(doc.ref, {
            userId: "DELETED_USER",
            userEmail: "deleted@privacy.local",
          });
        });
        await batch.commit();
        retained.push(`${logsSnap.size} audit logs (anonymized)`);
      }

      return {
        success: true,
        deleted,
        retained,
      };
    } catch (error) {
      await auditLogger.logFailure(
        AuditAction.GDPR_DATA_DELETION,
        userId,
        error instanceof Error ? error.message : "Unknown error"
      );
      throw error;
    }
  }

  /**
   * Generate downloadable data export in JSON format
   */
  static async generateDataExportFile(userId: string): Promise<string> {
    const data = await this.exportUserData(userId);
    return JSON.stringify(data, null, 2);
  }
}
