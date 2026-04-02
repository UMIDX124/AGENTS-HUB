"use client";

import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { CommandPalette } from "@/components/command-palette";
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
        <Button
          variant="outline"
          size="icon"
          onClick={() => setOpen(true)}
          aria-label="Open navigation menu"
          className="fixed left-3 top-3.5 z-50 lg:hidden"
        >
          <Menu className="size-4" />
        </Button>

        {/* Mobile sidebar sheet */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="left" className="w-[260px] p-0 border-r border-border bg-sidebar">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <Sidebar user={user} onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Desktop sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:block lg:w-[260px]">
          <Sidebar user={user} />
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0 lg:ml-[260px]">{children}</main>

        {/* Command palette (Ctrl+K) */}
        <CommandPalette />
      </div>
    </SessionProvider>
  );
}
