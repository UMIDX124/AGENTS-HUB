import { type RoleName, type Permission, type RoleConfig } from "@/types";

export const PERMISSIONS: Record<RoleName, RoleConfig> = {
  OWNER: {
    label: "Owner",
    icon: "\u{1F451}",
    color: "#14b8a6",
    can: [
      "run_agents", "view_all_audits", "view_own_audits",
      "manage_team", "add_users", "remove_users", "change_roles",
      "create_projects", "delete_projects", "manage_projects",
      "assign_tasks", "manage_tasks", "view_all_tasks",
      "export_reports", "delete_reports",
      "use_pinboard", "manage_settings",
      "view_dashboard_analytics", "view_billing",
    ],
  },
  MANAGER: {
    label: "Manager",
    icon: "\u{1F396}\uFE0F",
    color: "#8b5cf6",
    can: [
      "run_agents", "view_all_audits", "view_own_audits",
      "manage_team", "add_users",
      "create_projects", "manage_projects",
      "assign_tasks", "manage_tasks", "view_all_tasks",
      "export_reports", "use_pinboard",
      "view_dashboard_analytics",
    ],
  },
  SPECIALIST: {
    label: "SEO Specialist",
    icon: "\u{1F527}",
    color: "#06b6d4",
    can: [
      "run_agents", "view_own_audits",
      "view_assigned_tasks", "update_own_tasks",
      "use_pinboard", "export_reports",
    ],
  },
  CLIENT: {
    label: "Client",
    icon: "\u{1F464}",
    color: "#10b981",
    can: [
      "view_own_audits",
      "view_assigned_tasks",
      "view_own_reports",
    ],
  },
};

export function hasPermission(role: RoleName, permission: Permission): boolean {
  return PERMISSIONS[role]?.can.includes(permission) ?? false;
}

export function getAllPermissions(): Permission[] {
  const allPerms = new Set<Permission>();
  Object.values(PERMISSIONS).forEach((r) => r.can.forEach((p) => allPerms.add(p)));
  return Array.from(allPerms);
}
