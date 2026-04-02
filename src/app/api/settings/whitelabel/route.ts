import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// White-label settings stored in a simple JSON approach
// In production, you'd store this in the database per-team
let whitelabelConfig: { companyName: string; logoUrl: string; accentColor: string } = {
  companyName: "SEO Agents Hub",
  logoUrl: "",
  accentColor: "#818cf8",
};

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(whitelabelConfig);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== "OWNER") {
      return NextResponse.json({ error: "Only owners can update white-label settings" }, { status: 403 });
    }

    const body = await req.json();
    if (body.companyName !== undefined) whitelabelConfig.companyName = body.companyName;
    if (body.logoUrl !== undefined) whitelabelConfig.logoUrl = body.logoUrl;
    if (body.accentColor !== undefined) whitelabelConfig.accentColor = body.accentColor;

    return NextResponse.json(whitelabelConfig);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
