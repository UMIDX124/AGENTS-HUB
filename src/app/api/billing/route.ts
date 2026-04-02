import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS, type PlanName } from "@/lib/billing";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = session.user as any;

    let subscription = await prisma.subscription.findUnique({ where: { userId: user.id } });

    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: { userId: user.id, plan: "FREE", auditsLimit: 10, auditsUsed: 0 },
      });
    }

    const plan = PLANS[subscription.plan as PlanName] || PLANS.FREE;

    return NextResponse.json({
      ...subscription,
      planDetails: plan,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = session.user as any;

    const { plan } = await req.json();
    if (!PLANS[plan as PlanName]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const planConfig = PLANS[plan as PlanName];

    // In production, this would create a Stripe Checkout session
    // For now, we'll simulate plan changes directly
    if (plan !== "FREE" && !process.env.STRIPE_SECRET_KEY) {
      // Mock upgrade — in production, redirect to Stripe
      const subscription = await prisma.subscription.upsert({
        where: { userId: user.id },
        update: {
          plan,
          auditsLimit: planConfig.auditsPerMonth === -1 ? 999999 : planConfig.auditsPerMonth,
          status: "active",
        },
        create: {
          userId: user.id,
          plan,
          auditsLimit: planConfig.auditsPerMonth === -1 ? 999999 : planConfig.auditsPerMonth,
          status: "active",
        },
      });

      return NextResponse.json({
        success: true,
        subscription,
        message: `Upgraded to ${planConfig.name}! (Stripe integration pending — add STRIPE_SECRET_KEY)`,
      });
    }

    // Downgrade to free
    if (plan === "FREE") {
      const subscription = await prisma.subscription.upsert({
        where: { userId: user.id },
        update: { plan: "FREE", auditsLimit: 10, status: "active", stripeCustomer: null, stripeSub: null },
        create: { userId: user.id, plan: "FREE", auditsLimit: 10 },
      });
      return NextResponse.json({ success: true, subscription });
    }

    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
