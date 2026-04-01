"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pin } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Finding {
  title: string;
  severity: "critical" | "warning" | "good";
  detail: string;
}

interface FindingsListProps {
  findings: Finding[];
  onPin?: (finding: Finding) => void;
}

const severityVariant: Record<string, "destructive" | "warning" | "success"> = {
  critical: "destructive",
  warning: "warning",
  good: "success",
};

const severityLabel: Record<string, string> = {
  critical: "Critical",
  warning: "Warning",
  good: "Good",
};

export function FindingsList({ findings, onPin }: FindingsListProps) {
  return (
    <div className="space-y-2">
      {findings.map((finding, i) => (
        <Card key={i} className="transition-colors hover:bg-accent/20">
          <CardContent className="flex items-start justify-between gap-4 p-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Badge variant={severityVariant[finding.severity]}>
                  {severityLabel[finding.severity]}
                </Badge>
                <span className="text-sm font-medium text-foreground">
                  {finding.title}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                {finding.detail}
              </p>
            </div>
            {onPin && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onPin(finding)}
                    className="text-muted-foreground hover:text-primary shrink-0"
                  >
                    <Pin className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Pin finding</TooltipContent>
              </Tooltip>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
