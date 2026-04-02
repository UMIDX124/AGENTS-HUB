"use client";

import { useState } from "react";
import { PERMISSIONS } from "@/lib/permissions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import type { RoleName } from "@/types";
import { Bell, Sparkles, X, Search } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleToggle } from "@/components/locale-toggle";

interface TopbarProps {
  user: { name: string; role: RoleName };
  title?: string;
  subtitle?: string;
}

export function Topbar({ user, title, subtitle }: TopbarProps) {
  const roleConfig = PERMISSIONS[user.role];

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 pl-14 pr-4 backdrop-blur-xl lg:pl-6 lg:pr-6">
      <div>
        {subtitle ? (
          <>
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">
              {title}
            </p>
            <h1 className="text-sm font-bold tracking-tight text-foreground">
              {subtitle}
            </h1>
          </>
        ) : (
          <h1 className="text-sm font-bold tracking-tight text-foreground">
            {title || "Dashboard"}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Greeting badge */}
        <div className="hidden items-center gap-1.5 rounded-full border border-border bg-muted/30 px-3 py-1.5 md:flex">
          <Sparkles className="size-3 text-primary" />
          <span className="text-xs text-muted-foreground">
            {greeting},{" "}
            <span className="font-semibold text-foreground">
              {user.name.split(" ")[0]}
            </span>
          </span>
        </div>

        {/* Search shortcut hint */}
        <button
          onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}
          className="hidden items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/60 lg:flex"
        >
          <Search className="size-3" />
          <span>Search...</span>
          <kbd className="rounded border border-border bg-background px-1 py-0.5 text-[10px] font-mono">Ctrl K</kbd>
        </button>

        {/* Language toggle */}
        <LocaleToggle />

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notification bell */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Bell className="size-4" />
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary ring-2 ring-background" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72 p-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-xs font-semibold text-foreground">
                Notifications
              </h3>
            </div>
            <div className="p-2 space-y-1">
              {[
                {
                  text: "Welcome to SEO Agents Hub!",
                  sub: "Run your first audit to get started",
                },
                {
                  text: "14 SEO Tools available",
                  sub: "Generate meta tags, schema, content & more",
                },
                {
                  text: "AI-Powered Analysis",
                  sub: "Multi-provider intelligence engine",
                },
              ].map((n, i) => (
                <div
                  key={i}
                  className="rounded-md bg-muted/50 p-3 transition-colors hover:bg-muted"
                >
                  <p className="text-xs text-foreground/80">{n.text}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {n.sub}
                  </p>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Role badge */}
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-2.5 py-1.5">
          <Avatar className="size-6">
            <AvatarFallback
              className="text-[10px] font-bold"
              style={{
                backgroundColor: `${roleConfig.color}20`,
                color: roleConfig.color,
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold leading-none text-foreground/80">
              {user.name.split(" ")[0]}
            </p>
            <p
              className="mt-0.5 text-[10px] font-medium leading-none"
              style={{ color: roleConfig.color }}
            >
              {roleConfig.label}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
