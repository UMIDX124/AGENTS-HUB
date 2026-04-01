"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
      <AlertCircle className="size-4 text-destructive shrink-0" />
      <p className="text-sm text-destructive/90 flex-1 min-w-0">{message}</p>
      {onRetry && (
        <Button variant="destructive" size="sm" onClick={onRetry}>
          <RefreshCw className="size-3" /> Retry
        </Button>
      )}
    </div>
  );
}
