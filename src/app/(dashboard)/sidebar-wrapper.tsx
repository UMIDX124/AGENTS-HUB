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
          className="fixed left-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#04050b] text-white/60 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Mobile overlay */}
        {open && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        {/* Sidebar — hidden on mobile, slide-in when open */}
        <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"} lg:block`}>
          <Sidebar user={user} onNavigate={() => setOpen(false)} />
          {/* Mobile close button */}
          {open && (
            <button
              onClick={() => setOpen(false)}
              className="absolute right-2 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:text-white lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0 lg:ml-[240px]">
          {/* Mobile spacer for hamburger */}
          <div className="h-0 lg:h-0" />
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
