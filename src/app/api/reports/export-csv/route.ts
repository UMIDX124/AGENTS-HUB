import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const where: any = {};

    if (hasPermission(user.role, "view_all_audits")) {
      // Can see all
    } else if (hasPermission(user.role, "view_own_audits")) {
      where.userId = user.id;
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const audits = await prisma.audit.findMany({
      where,
      include: {
        user: { select: { name: true } },
        project: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Build CSV
    const headers = ["Date", "URL", "Agent", "Score", "Grade", "Summary", "Project", "Auditor"];
    const rows = audits.map((a) => [
      new Date(a.createdAt).toISOString().split("T")[0],
      `"${a.url.replace(/"/g, '""')}"`,
      a.agent,
      a.score.toString(),
      a.grade,
      `"${(a.summary || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
      `"${a.project?.name || ""}"`,
      `"${a.user?.name || ""}"`,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="seo-reports-${Date.now()}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
