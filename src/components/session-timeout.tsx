"use client";

import { useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const WARNING_MS = 25 * 60 * 1000; // Warning at 25 minutes

export function SessionTimeout() {
  const timerRef = useRef<NodeJS.Timeout>();
  const warningRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    function resetTimers() {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);

      warningRef.current = setTimeout(() => {
        toast.warning("Session expiring in 5 minutes — move your mouse to stay logged in");
      }, WARNING_MS);

      timerRef.current = setTimeout(() => {
        toast.error("Session expired — logging out");
        signOut({ callbackUrl: "/login" });
      }, TIMEOUT_MS);
    }

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    events.forEach((e) => document.addEventListener(e, resetTimers, { passive: true }));
    resetTimers();

    return () => {
      events.forEach((e) => document.removeEventListener(e, resetTimers));
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, []);

  return null;
}
