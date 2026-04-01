"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Keyword {
  keyword: string;
  volume: number;
  difficulty: number;
  opportunity: string;
}

interface KeywordCardsProps {
  keywords: Keyword[];
}

export function KeywordCards({ keywords }: KeywordCardsProps) {
  if (!keywords?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No keyword data available.
      </p>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {keywords.map((kw, i) => (
        <Card key={i} className="transition-colors hover:bg-accent/20">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-foreground">{kw.keyword}</p>
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span>
                Vol:{" "}
                <span className="font-medium text-foreground/80">
                  {kw.volume?.toLocaleString()}
                </span>
              </span>
              <span>
                Diff:{" "}
                <Badge
                  variant={
                    kw.difficulty > 70
                      ? "destructive"
                      : kw.difficulty > 40
                        ? "warning"
                        : "success"
                  }
                  className="ml-0.5"
                >
                  {kw.difficulty}
                </Badge>
              </span>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              {kw.opportunity}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
