"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Bot,
  Play,
  Square,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Zap,
  RefreshCw,
} from "lucide-react";

interface SchedulerLog {
  id: string;
  time: string;
  type: "success" | "error" | "info";
  message: string;
}

const INTERVAL_OPTIONS = [
  { value: "30", label: "Every 30 min" },
  { value: "60", label: "Every 1 hour" },
  { value: "180", label: "Every 3 hours" },
  { value: "360", label: "Every 6 hours" },
  { value: "720", label: "Every 12 hours" },
  { value: "1440", label: "Every 24 hours" },
];

export function AutoScheduler() {
  const [running, setRunning] = useState(false);
  const [interval, setIntervalMin] = useState(60);
  const [logs, setLogs] = useState<SchedulerLog[]>([]);
  const [nextRun, setNextRun] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState("");
  const [runningNow, setRunningNow] = useState(false);
  const [totalRuns, setTotalRuns] = useState(0);
  const [totalSuccess, setTotalSuccess] = useState(0);
  const [totalFailed, setTotalFailed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const addLog = useCallback(
    (type: SchedulerLog["type"], message: string) => {
      setLogs((prev) => [
        {
          id: Date.now().toString(),
          time: new Date().toLocaleTimeString(),
          type,
          message,
        },
        ...prev.slice(0, 49),
      ]);
    },
    []
  );

  const runAutoAudit = useCallback(async () => {
    setRunningNow(true);
    addLog("info", "Starting auto-audit for all active projects...");

    try {
      const res = await fetch("/api/agents/auto-run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();

      if (!res.ok) {
        addLog("error", `Failed: ${data.error}`);
        setTotalFailed((p) => p + 1);
      } else {
        setTotalRuns((p) => p + 1);
        setTotalSuccess((p) => p + data.completed);
        setTotalFailed((p) => p + data.failed);

        if (data.completed > 0) {
          addLog(
            "success",
            `Completed ${data.completed} audits across ${new Set(data.results.map((r: any) => r.projectName)).size} projects`
          );
          data.results.forEach((r: any) => {
            addLog(
              "success",
              `  ${r.projectName} → ${r.agent}: ${r.grade} (${r.score}/100)`
            );
          });
        }
        if (data.failed > 0) {
          addLog("error", `${data.failed} audits failed`);
          data.errors?.forEach((e: any) => {
            addLog("error", `  ${e.projectName} → ${e.agent}: ${e.error}`);
          });
        }
        if (data.completed === 0 && data.failed === 0) {
          addLog("info", "No active projects found to audit");
        }
      }
    } catch (err: any) {
      addLog("error", `Network error: ${err.message}`);
      setTotalFailed((p) => p + 1);
    } finally {
      setRunningNow(false);
    }
  }, [addLog]);

  function startScheduler() {
    setRunning(true);
    addLog("info", `Scheduler started — running every ${interval} minutes`);
    runAutoAudit();
    const next = new Date(Date.now() + interval * 60 * 1000);
    setNextRun(next);
    timerRef.current = setInterval(() => {
      runAutoAudit();
      const nextTime = new Date(Date.now() + interval * 60 * 1000);
      setNextRun(nextTime);
    }, interval * 60 * 1000);
  }

  function stopScheduler() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setRunning(false);
    setNextRun(null);
    setCountdown("");
    addLog("info", "Scheduler stopped");
  }

  useEffect(() => {
    if (!nextRun || !running) {
      if (countdownRef.current) clearInterval(countdownRef.current);
      return;
    }
    countdownRef.current = setInterval(() => {
      const diff = nextRun.getTime() - Date.now();
      if (diff <= 0) {
        setCountdown("Running...");
      } else {
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setCountdown(`${m}m ${s}s`);
      }
    }, 1000);
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [nextRun, running]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  return (
    <Card>
      {/* Header */}
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-10 items-center justify-center rounded-lg ${running ? "bg-emerald-500/15" : "bg-primary/10"}`}
          >
            <Bot
              className={`size-5 ${running ? "text-emerald-400 animate-pulse" : "text-primary"}`}
            />
          </div>
          <div>
            <CardTitle className="text-sm">
              24/7 Auto-Audit Scheduler
            </CardTitle>
            <CardDescription>
              {running ? (
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Running — next audit in {countdown}
                </span>
              ) : (
                "Automatically audit all active projects on schedule"
              )}
            </CardDescription>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!running && (
            <Select
              value={String(interval)}
              onValueChange={(v) => setIntervalMin(Number(v))}
            >
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INTERVAL_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {running ? (
            <Button variant="destructive" size="sm" onClick={stopScheduler}>
              <Square className="size-3.5" /> Stop
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={startScheduler}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Play className="size-3.5" /> Start 24/7
            </Button>
          )}
          {!running && (
            <Button
              variant="outline"
              size="sm"
              onClick={runAutoAudit}
              disabled={runningNow}
            >
              {runningNow ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Zap className="size-3.5" />
              )}
              Run Once
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Stats row */}
      {(totalRuns > 0 || running) && (
        <>
          <Separator />
          <div className="grid grid-cols-3">
            {[
              { label: "Cycles", value: totalRuns, color: "text-primary" },
              {
                label: "Passed",
                value: totalSuccess,
                color: "text-emerald-400",
              },
              { label: "Failed", value: totalFailed, color: "text-destructive" },
            ].map(({ label, value, color }) => (
              <div key={label} className="px-5 py-3 text-center">
                <p className={`text-base font-bold tabular-nums ${color}`}>
                  {value}
                </p>
                <p className="text-[10px] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Logs */}
      {logs.length > 0 && (
        <>
          <Separator />
          <ScrollArea className="max-h-[250px]">
            <div className="divide-y divide-border/50">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-2.5 px-5 py-2.5"
                >
                  <span className="mt-0.5 shrink-0">
                    {log.type === "success" && (
                      <CheckCircle2 className="size-3 text-emerald-400" />
                    )}
                    {log.type === "error" && (
                      <AlertCircle className="size-3 text-destructive" />
                    )}
                    {log.type === "info" && (
                      <RefreshCw className="size-3 text-muted-foreground" />
                    )}
                  </span>
                  <p
                    className={`text-xs leading-relaxed ${
                      log.type === "success"
                        ? "text-foreground/60"
                        : log.type === "error"
                          ? "text-destructive/80"
                          : "text-muted-foreground"
                    }`}
                  >
                    {log.message}
                  </p>
                  <span className="ml-auto text-[10px] text-muted-foreground/50 shrink-0 font-mono">
                    {log.time}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </>
      )}

      {/* Empty state */}
      {logs.length === 0 && !running && (
        <CardContent className="py-8 text-center">
          <Clock className="mx-auto size-8 text-muted-foreground/30 mb-2" />
          <p className="text-xs text-muted-foreground">
            Start the scheduler to automatically audit all your active projects
          </p>
        </CardContent>
      )}
    </Card>
  );
}
