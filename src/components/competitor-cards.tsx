"use client";

interface Competitor {
  name: string;
  url: string;
  strength: string;
  threat: string;
}

interface CompetitorCardsProps {
  competitors: Competitor[];
}

const threatColors: Record<string, string> = {
  high: "#f87171",
  medium: "#fbbf24",
  low: "#34d399",
};

export function CompetitorCards({ competitors }: CompetitorCardsProps) {
  if (!competitors?.length) return <p className="text-sm text-[#64748b]">No competitor data available.</p>;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {competitors.map((c, i) => (
        <div key={i} className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white">{c.name}</p>
            <span
              className="rounded px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: `${threatColors[c.threat] || "#94a3b8"}15`,
                color: threatColors[c.threat] || "#94a3b8",
              }}
            >
              {c.threat} threat
            </span>
          </div>
          <p className="mt-1 truncate text-xs text-[#818cf8]">{c.url}</p>
          <p className="mt-2 text-xs text-[#94a3b8]">{c.strength}</p>
        </div>
      ))}
    </div>
  );
}
