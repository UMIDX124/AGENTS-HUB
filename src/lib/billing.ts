export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    auditsPerMonth: 10,
    features: ["5 AI Agents", "14 SEO Tools", "Basic Reports", "1 Project"],
    color: "#64748b",
  },
  PRO: {
    name: "Pro",
    price: 29,
    auditsPerMonth: 100,
    features: ["Everything in Free", "Unlimited Projects", "CSV/PDF Export", "API Access", "Email Notifications", "Priority Support"],
    color: "#14b8a6",
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: 99,
    auditsPerMonth: -1, // unlimited
    features: ["Everything in Pro", "Unlimited Audits", "White-Label PDF", "Scheduled Audits", "Custom Integrations", "Dedicated Support"],
    color: "#06b6d4",
  },
} as const;

export type PlanName = keyof typeof PLANS;
