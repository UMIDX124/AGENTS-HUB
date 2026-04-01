"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Competitor {
  name: string;
  url: string;
  strength: string;
  threat: string;
}

interface CompetitorCardsProps {
  competitors: Competitor[];
}

const threatVariant: Record<string, "destructive" | "warning" | "success"> = {
  high: "destructive",
  medium: "warning",
  low: "success",
};

export function CompetitorCards({ competitors }: CompetitorCardsProps) {
  if (!competitors?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No competitor data available.
      </p>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {competitors.map((c, i) => (
        <Card key={i} className="transition-colors hover:bg-accent/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">{c.name}</p>
              <Badge variant={threatVariant[c.threat] || "secondary"}>
                {c.threat} threat
              </Badge>
            </div>
            <p className="mt-1 truncate text-xs text-primary/70">{c.url}</p>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              {c.strength}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
