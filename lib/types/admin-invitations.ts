export type AdminRole = "VIEWER" | "ADMIN";

export type InvitationStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";

export interface AdminInvitation {
  id: string;
  email: string;
  invitedBy: string;
  invitedByName: string;
  createdAt: number;
  expiresAt: number;
  status: InvitationStatus;
  token: string;
  acceptedAt?: number;
  acceptedBy?: string;
}

export interface AdminAccess {
  uid: string;
  email: string;
  name: string;
  role: AdminRole;
  grantedAt: number;
  grantedBy: string;
  invitationAcceptedAt?: number;
}
