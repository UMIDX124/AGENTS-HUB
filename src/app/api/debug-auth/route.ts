import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ step: "findUser", found: false, email });
    }

    const isValid = await compare(password, user.password);

    return NextResponse.json({
      step: "compare",
      found: true,
      email: user.email,
      name: user.name,
      passwordValid: isValid,
      hashPrefix: user.password.substring(0, 10),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, stack: err.stack?.substring(0, 300) }, { status: 500 });
  }
}
