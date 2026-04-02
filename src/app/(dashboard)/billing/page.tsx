"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Topbar } from "@/components/topbar";
import { PLANS, type PlanName } from "@/lib/billing";
import { CreditCard, Check, Zap, Crown, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/breadcrumbs";

export default function BillingPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [subscription, setSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/billing").then((r) => r.json()).then(setSub).finally(() => setLoading(false));
  }, []);

  async function changePlan(plan: string) {
    setUpgrading(plan);
    try {
      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.subscription) setSub({ ...data.subscription, planDetails: PLANS[plan as PlanName] });
    } finally {
      setUpgrading(null);
    }
  }

  const currentPlan = subscription?.plan || "FREE";
  const planIcons: Record<string, React.ElementType> = { FREE: Zap, PRO: Crown, ENTERPRISE: Sparkles };

  return (
    <div className="min-h-screen">
      <Topbar user={{ name: user?.name || "User", role: user?.role || "SPECIALIST" }} title="Billing" subtitle="Subscription & Plans" />

      <div className="p-4 sm:p-6 space-y-5 max-w-4xl">
        {/* Current plan */}
        {subscription && (
          <div className="rounded-2xl border border-border bg-muted/40 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/15">
                  <CreditCard className="h-4 w-4 text-teal-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Current Plan</h2>
                  <p className="text-xs text-muted-foreground">Manage your subscription</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
                <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">Plan</p>
                <p className="text-sm font-bold text-foreground">{PLANS[currentPlan as PlanName]?.name || "Free"}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
                <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">Status</p>
                <p className="text-sm font-bold text-emerald-400 capitalize">{subscription.status}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
                <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">Audits Used</p>
                <p className="text-sm font-bold text-foreground">
                  {subscription.auditsUsed} / {subscription.auditsLimit === 999999 ? "∞" : subscription.auditsLimit}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
                <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">Monthly Cost</p>
                <p className="text-sm font-bold text-foreground">${PLANS[currentPlan as PlanName]?.price || 0}/mo</p>
              </div>
            </div>
          </div>
        )}

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(Object.entries(PLANS) as [PlanName, typeof PLANS[PlanName]][]).map(([key, plan]) => {
            const Icon = planIcons[key] || Zap;
            const isCurrent = currentPlan === key;
            return (
              <div
                key={key}
                className={`rounded-2xl border p-5 transition-all ${
                  isCurrent
                    ? "border-teal-500/40 bg-teal-500/5 ring-1 ring-teal-500/20"
                    : "border-border bg-muted/40 hover:border-border/80"
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${plan.color}15`, color: plan.color }}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{plan.name}</h3>
                    {isCurrent && (
                      <span className="text-[10px] text-teal-400 font-semibold">CURRENT</span>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-3xl font-bold text-foreground">${plan.price}</span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-1">
                    {plan.auditsPerMonth === -1 ? "Unlimited" : plan.auditsPerMonth} audits/month
                  </p>
                </div>

                <div className="space-y-2 mb-5">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-xs text-foreground/80">
                      <Check className="h-3.5 w-3.5 flex-shrink-0" style={{ color: plan.color }} />
                      {f}
                    </div>
                  ))}
                </div>

                {isCurrent ? (
                  <div className="rounded-xl border border-border bg-muted/50 py-2.5 text-center text-xs font-medium text-muted-foreground">
                    Current Plan
                  </div>
                ) : (
                  <button
                    onClick={() => changePlan(key)}
                    disabled={!!upgrading}
                    className="w-full rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 py-2.5 text-xs font-semibold text-white shadow-lg shadow-teal-500/20 hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {upgrading === key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                    {key === "FREE" ? "Downgrade" : "Upgrade"} to {plan.name}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Stripe note */}
        <div className="rounded-xl border border-amber-500/10 bg-amber-500/5 p-4">
          <p className="text-xs text-amber-400">
            <strong>Note:</strong> Full Stripe checkout integration is pending. Add <code className="font-mono">STRIPE_SECRET_KEY</code> to Vercel env vars to enable real payment processing. Plan changes currently simulate instantly.
          </p>
        </div>
      </div>
    </div>
  );
}
