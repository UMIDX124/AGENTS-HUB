"use client";

import { useEffect, useState } from "react";
import { LOCALES, getLocaleFromStorage, setLocaleToStorage, type Locale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function LocaleToggle() {
  const [locale, setLocale] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLocale(getLocaleFromStorage());
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="relative" disabled>
        <Languages className="size-4" />
      </Button>
    );
  }

  const current = LOCALES.find((l) => l.id === locale)!;
  const next = LOCALES.find((l) => l.id !== locale)!;

  function toggle() {
    const newLocale = next.id;
    setLocale(newLocale);
    setLocaleToStorage(newLocale);
    // Update HTML dir attribute for RTL support
    document.documentElement.dir = LOCALES.find((l) => l.id === newLocale)!.dir;
    // Trigger re-render of components using i18n
    window.dispatchEvent(new Event("locale-change"));
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon" onClick={toggle} className="relative">
          <Languages className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        Switch to {next.name}
      </TooltipContent>
    </Tooltip>
  );
}
