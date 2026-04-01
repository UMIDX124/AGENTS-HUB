"use client";

import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import { Sidebar } from "@/components/sidebar";
import { Menu, X } from "lucide-react";
import type { RoleName } from "@/types";

interface SidebarWrapperProps {
  user: { name: string; role: RoleName; image?: string | null; id: string };
  children: React.ReactNode;
}

export function SidebarWrapper({ user, children }: SidebarWrapperProps) {
  const [open, setOpen] = useState(false);

  return (
    <SessionProvider>
      <div className="flex min-h-screen">
        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(true)}
          className="fixed left-3 top-3.5 z-50 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#04050b]/90 text-white/60 backdrop-blur-sm lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Mobile overlay */}
        {open && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-[240px] h-screen overflow-hidden transform transition-transform duration-300 ease-in-out ${
            open ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
        >
          <Sidebar user={user} onNavigate={() => setOpen(false)} />
          {open && (
            <button
              onClick={() => setOpen(false)}
              className="absolute right-2 top-4 flex h-7 w-7 items-center justify-center rounded-lg text-white/30 hover:text-white/60 lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0 lg:ml-[240px]">{children}</main>
      </div>
    </SessionProvider>
  );
}
