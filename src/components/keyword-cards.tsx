"use client";

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
  if (!keywords?.length) return <p className="text-sm text-[#64748b]">No keyword data available.</p>;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {keywords.map((kw, i) => (
        <div key={i} className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4">
          <p className="text-sm font-medium text-white">{kw.keyword}</p>
          <div className="mt-2 flex items-center gap-4 text-xs text-[#94a3b8]">
            <span>Vol: <span className="text-white">{kw.volume?.toLocaleString()}</span></span>
            <span>Diff: <span className={kw.difficulty > 70 ? "text-red-400" : kw.difficulty > 40 ? "text-yellow-400" : "text-green-400"}>{kw.difficulty}</span></span>
          </div>
          <p className="mt-1 text-xs text-[#64748b]">{kw.opportunity}</p>
        </div>
      ))}
    </div>
  );
}
