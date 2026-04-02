import { prisma } from "@/lib/prisma";

export type ActivityAction =
  | "audit_run"
  | "audit_deleted"
  | "task_created"
  | "task_updated"
  | "task_deleted"
  | "member_added"
  | "member_removed"
  | "project_created"
  | "project_updated"
  | "project_deleted"
  | "report_exported"
  | "pin_created"
  | "pin_deleted"
  | "settings_updated"
  | "login";

export async function logActivity(
  userId: string,
  action: ActivityAction,
  detail?: string,
  metadata?: Record<string, any>
) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        detail: detail || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch {
    // Don't let logging failures break the app
    console.error("Failed to log activity:", action);
  }
}
