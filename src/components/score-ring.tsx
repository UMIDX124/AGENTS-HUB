"use client";

import { useEffect, useState } from "react";
import { getGradeColor } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  grade: string;
  size?: number;
}

export function ScoreRing({ score, grade, size = 120 }: ScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const strokeWidth = size > 60 ? 7 : 5;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;
  const color = getGradeColor(grade);

  useEffect(() => {
    let frame: number;
    const duration = 1200;
    const start = performance.now();

    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));
      if (progress < 1) frame = requestAnimationFrame(animate);
    }

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 ${score >= 80 ? "score-glow-high" : score >= 50 ? "score-glow-mid" : "score-glow-low"}`}
      style={{ width: size, height: size }}
    >
      {/* Glow effect behind ring */}
      {size > 60 && (
        <div
          className="absolute inset-0 rounded-full opacity-20 blur-md"
          style={{ backgroundColor: color }}
        />
      )}

      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            filter: `drop-shadow(0 0 ${size > 60 ? 6 : 3}px ${color}80)`,
            transition: "stroke-dashoffset 0.05s linear",
          }}
        />
      </svg>

      {/* Center text */}
      <div className="absolute flex flex-col items-center leading-none">
        <span
          className="font-bold tabular-nums"
          style={{
            color,
            fontSize: size > 80 ? "1.5rem" : size > 50 ? "0.9rem" : "0.7rem",
            textShadow: `0 0 12px ${color}60`,
          }}
        >
          {animatedScore}
        </span>
        {size > 44 && (
          <span
            className="font-bold uppercase tracking-wider"
            style={{
              color,
              fontSize: size > 80 ? "0.65rem" : "0.5rem",
              opacity: 0.8,
            }}
          >
            {grade}
          </span>
        )}
      </div>
    </div>
  );
}
