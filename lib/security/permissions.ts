/**
 * Enhanced Permission System
 * Fine-grained role-based access control
 */

export enum Role {
  APPLICANT = "APPLICANT",
  SCHOOL_ADMIN = "SCHOOL_ADMIN",
  ADMIN = "ADMIN",
}

export enum Permission {
  // Application permissions
  VIEW_OWN_APPLICATIONS = "VIEW_OWN_APPLICATIONS",
  CREATE_APPLICATION = "CREATE_APPLICATION",
  EDIT_OWN_APPLICATION = "EDIT_OWN_APPLICATION",
  DELETE_OWN_APPLICATION = "DELETE_OWN_APPLICATION",
  
  VIEW_ALL_APPLICATIONS = "VIEW_ALL_APPLICATIONS",
  EDIT_ANY_APPLICATION = "EDIT_ANY_APPLICATION",
  DELETE_ANY_APPLICATION = "DELETE_ANY_APPLICATION",
  CHANGE_APPLICATION_STATUS = "CHANGE_APPLICATION_STATUS",
  EXPORT_APPLICATIONS = "EXPORT_APPLICATIONS",
  
  // Document permissions
  UPLOAD_DOCUMENTS = "UPLOAD_DOCUMENTS",
  VIEW_OWN_DOCUMENTS = "VIEW_OWN_DOCUMENTS",
  DELETE_OWN_DOCUMENTS = "DELETE_OWN_DOCUMENTS",
  VIEW_ALL_DOCUMENTS = "VIEW_ALL_DOCUMENTS",
  DELETE_ANY_DOCUMENTS = "DELETE_ANY_DOCUMENTS",
  
  // User management
  VIEW_USERS = "VIEW_USERS",
  CREATE_USERS = "CREATE_USERS",
  EDIT_USERS = "EDIT_USERS",
  DELETE_USERS = "DELETE_USERS",
  CHANGE_USER_ROLES = "CHANGE_USER_ROLES",
  
  // University & Program management
  VIEW_UNIVERSITIES = "VIEW_UNIVERSITIES",
  CREATE_UNIVERSITY = "CREATE_UNIVERSITY",
  EDIT_UNIVERSITY = "EDIT_UNIVERSITY",
  DELETE_UNIVERSITY = "DELETE_UNIVERSITY",
  
  VIEW_PROGRAMS = "VIEW_PROGRAMS",
  CREATE_PROGRAM = "CREATE_PROGRAM",
  EDIT_PROGRAM = "EDIT_PROGRAM",
  DELETE_PROGRAM = "DELETE_PROGRAM",
  
  // Email & Notifications
  SEND_EMAIL = "SEND_EMAIL",
  SEND_BULK_EMAIL = "SEND_BULK_EMAIL",
  
  // Analytics & Reports
  VIEW_ANALYTICS = "VIEW_ANALYTICS",
  VIEW_SCHOOL_ANALYTICS = "VIEW_SCHOOL_ANALYTICS",
  VIEW_SYSTEM_ANALYTICS = "VIEW_SYSTEM_ANALYTICS",
  EXPORT_REPORTS = "EXPORT_REPORTS",
  
  // System administration
  MANAGE_SETTINGS = "MANAGE_SETTINGS",
  VIEW_AUDIT_LOGS = "VIEW_AUDIT_LOGS",
  MANAGE_PAYMENTS = "MANAGE_PAYMENTS",
}

/**
 * Role-Permission mapping
 */
const rolePermissions: Record<Role, Permission[]> = {
  [Role.APPLICANT]: [
    Permission.VIEW_OWN_APPLICATIONS,
    Permission.CREATE_APPLICATION,
    Permission.EDIT_OWN_APPLICATION,
    Permission.DELETE_OWN_APPLICATION,
    Permission.UPLOAD_DOCUMENTS,
    Permission.VIEW_OWN_DOCUMENTS,
    Permission.DELETE_OWN_DOCUMENTS,
    Permission.VIEW_UNIVERSITIES,
    Permission.VIEW_PROGRAMS,
  ],
  
  [Role.SCHOOL_ADMIN]: [
    // All applicant permissions
    ...rolePermissions[Role.APPLICANT] || [],
    
    // School-specific permissions
    Permission.VIEW_ALL_APPLICATIONS,
    Permission.EDIT_ANY_APPLICATION,
    Permission.CHANGE_APPLICATION_STATUS,
    Permission.EXPORT_APPLICATIONS,
    Permission.VIEW_ALL_DOCUMENTS,
    Permission.SEND_EMAIL,
    Permission.SEND_BULK_EMAIL,
    Permission.VIEW_SCHOOL_ANALYTICS,
    Permission.EXPORT_REPORTS,
    Permission.MANAGE_PAYMENTS,
  ],
  
  [Role.ADMIN]: [
    // All permissions
    ...Object.values(Permission),
  ],
};

export class PermissionChecker {
  /**
   * Check if a role has a specific permission
   */
  static hasPermission(role: Role | string, permission: Permission): boolean {
    const roleEnum = role as Role;
    const permissions = rolePermissions[roleEnum] || [];
    return permissions.includes(permission);
  }

  /**
   * Check if a role has any of the specified permissions
   */
  static hasAnyPermission(role: Role | string, permissions: Permission[]): boolean {
    return permissions.some((permission) => this.hasPermission(role, permission));
  }

  /**
   * Check if a role has all of the specified permissions
   */
  static hasAllPermissions(role: Role | string, permissions: Permission[]): boolean {
    return permissions.every((permission) => this.hasPermission(role, permission));
  }

  /**
   * Get all permissions for a role
   */
  static getPermissions(role: Role | string): Permission[] {
    const roleEnum = role as Role;
    return rolePermissions[roleEnum] || [];
  }

  /**
   * Check if user can access resource
   */
  static canAccessResource(
    userRole: Role | string,
    resourceOwnerId: string,
    currentUserId: string,
    requiredPermission: Permission
  ): boolean {
    // Check if user has the required permission
    if (!this.hasPermission(userRole, requiredPermission)) {
      return false;
    }

    // If it's an "own" permission, verify ownership
    const ownPermissions = [
      Permission.VIEW_OWN_APPLICATIONS,
      Permission.EDIT_OWN_APPLICATION,
      Permission.DELETE_OWN_APPLICATION,
      Permission.VIEW_OWN_DOCUMENTS,
      Permission.DELETE_OWN_DOCUMENTS,
    ];

    if (ownPermissions.includes(requiredPermission)) {
      return resourceOwnerId === currentUserId;
    }

    return true;
  }
}

/**
 * Permission decorator for API routes
 */
export function requirePermission(permission: Permission) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const request = args[0]; // Assuming first arg is Request
      // Permission check would happen here
      // This is a decorator pattern example
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
