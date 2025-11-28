/**
 * University Permissions Hook
 * Check if current user has specific permissions for university operations
 */

import { useEffect, useState } from "react";
import { ROLE_PERMISSIONS, UniversityPermission, UniversityRole } from "@/lib/types/uni";

interface UseUniPermissionsProps {
  universityId?: string;
}

interface PermissionState {
  role: UniversityRole | null;
  permissions: UniversityPermission[];
  isLoading: boolean;
  error: Error | null;
}

export function useUniPermissions({ universityId }: UseUniPermissionsProps = {}) {
  const [state, setState] = useState<PermissionState>({
    role: null,
    permissions: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchPermissions() {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));
        
        const response = await fetch(`/api/uni/permissions${universityId ? `?universityId=${universityId}` : ""}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch permissions");
        }

        const data = await response.json();
        
        setState({
          role: data.role,
          permissions: data.permissions || [],
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setState({
          role: null,
          permissions: [],
          isLoading: false,
          error: error as Error,
        });
      }
    }

    fetchPermissions();
  }, [universityId]);

  const hasPermission = (permission: UniversityPermission): boolean => {
    return state.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: UniversityPermission[]): boolean => {
    return permissions.some((p) => state.permissions.includes(p));
  };

  const hasAllPermissions = (permissions: UniversityPermission[]): boolean => {
    return permissions.every((p) => state.permissions.includes(p));
  };

  const isAdmin = (): boolean => {
    return state.role === "UNI_ADMIN";
  };

  const isReviewer = (): boolean => {
    return state.role === "UNI_REVIEWER";
  };

  const isFinance = (): boolean => {
    return state.role === "UNI_FINANCE";
  };

  const isViewer = (): boolean => {
    return state.role === "UNI_VIEWER";
  };

  return {
    ...state,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isReviewer,
    isFinance,
    isViewer,
  };
}

/**
 * Helper function to get permissions for a role (client-side)
 */
export function getPermissionsForRole(role: UniversityRole): UniversityPermission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Helper function to check if a role has a specific permission (client-side)
 */
export function roleHasPermission(role: UniversityRole, permission: UniversityPermission): boolean {
  const permissions = getPermissionsForRole(role);
  return permissions.includes(permission);
}
