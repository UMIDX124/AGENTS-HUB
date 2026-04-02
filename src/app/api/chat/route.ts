import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { callAI } from "@/lib/ai-providers";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = session.user as any;

    const { message, provider } = await req.json();
    if (!message) return NextResponse.json({ error: "Message required" }, { status: 400 });

    // Gather context from recent audits
    const recentAudits = await prisma.audit.findMany({
      where: user.role === "CLIENT" ? { userId: user.id } : {},
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { url: true, agent: true, score: true, grade: true, summary: true, createdAt: true },
    });

    const auditContext = recentAudits.map((a) =>
      `[${a.agent}] ${a.url} — Score: ${a.score}/100 (${a.grade}) — ${a.summary}`
    ).join("\n");

    const systemPrompt = `You are an SEO expert assistant for "Agents Hub" — an AI-powered SEO audit platform.

You have access to the user's recent audit data:
${auditContext || "No audits run yet."}

Help the user understand their SEO data, suggest improvements, explain findings, and give actionable SEO advice. Be concise, specific, and data-driven. Reference their actual audit scores when relevant.

Format responses with clear headings and bullet points. Keep answers under 300 words.`;

    const response = await callAI(provider || "gemini", systemPrompt, message);

    return NextResponse.json({ reply: response });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
