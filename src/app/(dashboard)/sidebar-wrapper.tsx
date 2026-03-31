"use client";

import { SessionProvider } from "next-auth/react";
import { Sidebar } from "@/components/sidebar";
import type { RoleName } from "@/types";

interface SidebarWrapperProps {
  user: { name: string; role: RoleName; image?: string | null; id: string };
  children: React.ReactNode;
}

export function SidebarWrapper({ user, children }: SidebarWrapperProps) {
  return (
    <SessionProvider>
      <div className="flex min-h-screen">
        <Sidebar user={user} />
        <main className="ml-[240px] flex-1 min-w-0">{children}</main>
      </div>
    </SessionProvider>
  );
}
