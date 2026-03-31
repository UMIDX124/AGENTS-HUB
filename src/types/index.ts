export type Permission =
  | "run_agents"
  | "view_all_audits"
  | "view_own_audits"
  | "manage_team"
  | "add_users"
  | "remove_users"
  | "change_roles"
  | "create_projects"
  | "delete_projects"
  | "manage_projects"
  | "assign_tasks"
  | "manage_tasks"
  | "view_all_tasks"
  | "view_assigned_tasks"
  | "update_own_tasks"
  | "export_reports"
  | "delete_reports"
  | "view_own_reports"
  | "use_pinboard"
  | "manage_settings"
  | "view_dashboard_analytics"
  | "view_billing";

export type RoleName = "OWNER" | "MANAGER" | "SPECIALIST" | "CLIENT";

export interface RoleConfig {
  label: string;
  icon: string;
  color: string;
  can: Permission[];
}

export interface AgentResult {
  score: number;
  grade: string;
  summary: string;
  highlights: { metric: string; value: string; status: "pass" | "warn" | "fail" }[];
  findings: { title: string; severity: "critical" | "warning" | "good"; detail: string }[];
  quickWins: string[];
  keywords?: { keyword: string; volume: number; difficulty: number; opportunity: string }[];
  topics?: { topic: string; relevance: string; coverage: string }[];
  competitors?: { name: string; url: string; strength: string; threat: string }[];
}

export type AgentTypeName = "ONPAGE" | "TECHNICAL" | "OFFSITE" | "CONTENT" | "COMPETITOR";

export interface AgentConfig {
  name: string;
  type: AgentTypeName;
  icon: string;
  color: string;
  description: string;
}
