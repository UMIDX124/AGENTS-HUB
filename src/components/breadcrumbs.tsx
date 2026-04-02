"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const ROUTE_LABELS: Record<string, string> = {
  "": "Dashboard",
  audit: "Audit",
  tools: "SEO Tools",
  reports: "Reports",
  projects: "Projects",
  tasks: "Tasks",
  team: "Team",
  pinboard: "Pinboard",
  settings: "Settings",
  activity: "Activity Log",
  compare: "Compare",
  "search-console": "Search Console",
  portal: "Client Portal",
  docs: "API Docs",
  billing: "Billing",
  scheduled: "Scheduled",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
      <Link href="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
        <Home className="h-3 w-3" />
      </Link>
      {segments.map((seg, i) => {
        const href = "/" + segments.slice(0, i + 1).join("/");
        const label = ROUTE_LABELS[seg] || seg;
        const isLast = i === segments.length - 1;
        return (
          <span key={href} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
            {isLast ? (
              <span className="text-foreground/70 font-medium">{label}</span>
            ) : (
              <Link href={href} className="hover:text-foreground transition-colors">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
