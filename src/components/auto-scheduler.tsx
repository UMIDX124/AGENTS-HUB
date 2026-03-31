"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bot, Play, Square, Clock, CheckCircle2, AlertCircle, Loader2, Zap, RefreshCw } from "lucide-react";

interface SchedulerLog {
  id: string;
  time: string;
  type: "success" | "error" | "info";
  message: string;
}

const INTERVAL_OPTIONS = [
  { value: 30, label: "Every 30 min" },
  { value: 60, label: "Every 1 hour" },
  { value: 180, label: "Every 3 hours" },
  { value: 360, label: "Every 6 hours" },
  { value: 720, label: "Every 12 hours" },
  { value: 1440, label: "Every 24 hours" },
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

  const addLog = useCallback((type: SchedulerLog["type"], message: string) => {
    setLogs((prev) => [
      { id: Date.now().toString(), time: new Date().toLocaleTimeString(), type, message },
      ...prev.slice(0, 49),
    ]);
  }, []);

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
          addLog("success", `Completed ${data.completed} audits across ${new Set(data.results.map((r: any) => r.projectName)).size} projects`);
          data.results.forEach((r: any) => {
            addLog("success", `  ${r.projectName} → ${r.agent}: ${r.grade} (${r.score}/100)`);
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

    // Run immediately on start
    runAutoAudit();

    // Set next run
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

  // Countdown timer
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.05] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${running ? "bg-emerald-500/15" : "bg-indigo-500/15"}`}>
            <Bot className={`h-5 w-5 ${running ? "text-emerald-400 animate-pulse" : "text-indigo-400"}`} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">24/7 Auto-Audit Scheduler</h3>
            <p className="text-xs text-white/30">
              {running ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Running — next audit in {countdown}
                </span>
              ) : "Automatically audit all active projects on schedule"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!running && (
            <select
              value={interval}
              onChange={(e) => setIntervalMin(Number(e.target.value))}
              className="h-9 rounded-lg border border-white/10 bg-[#08090f] px-3 text-xs text-white outline-none"
            >
              {INTERVAL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}
          {running ? (
            <button
              onClick={stopScheduler}
              className="flex items-center gap-1.5 rounded-xl bg-red-500/15 border border-red-500/25 px-4 py-2 text-xs font-semibold text-red-400 transition-all hover:bg-red-500/25"
            >
              <Square className="h-3.5 w-3.5" /> Stop
            </button>
          ) : (
            <button
              onClick={startScheduler}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:brightness-110"
            >
              <Play className="h-3.5 w-3.5" /> Start 24/7
            </button>
          )}
          {!running && (
            <button
              onClick={runAutoAudit}
              disabled={runningNow}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium text-white/60 transition-all hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
            >
              {runningNow ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
              Run Once
            </button>
          )}
        </div>
      </div>

      {/* Stats row */}
      {(totalRuns > 0 || running) && (
        <div className="grid grid-cols-3 gap-px bg-white/[0.04] border-b border-white/[0.05]">
          {[
            { label: "Cycles", value: totalRuns, color: "text-indigo-400" },
            { label: "Passed", value: totalSuccess, color: "text-emerald-400" },
            { label: "Failed", value: totalFailed, color: "text-red-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[#04050b] px-5 py-3">
              <p className={`text-base font-bold ${color}`}>{value}</p>
              <p className="text-[10px] text-white/25">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Logs */}
      {logs.length > 0 && (
        <div className="max-h-[250px] overflow-y-auto">
          <div className="divide-y divide-white/[0.03]">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-2.5 px-5 py-2.5">
                <span className="mt-0.5 flex-shrink-0">
                  {log.type === "success" && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
                  {log.type === "error" && <AlertCircle className="h-3 w-3 text-red-400" />}
                  {log.type === "info" && <RefreshCw className="h-3 w-3 text-white/30" />}
                </span>
                <p className={`text-xs leading-relaxed ${log.type === "success" ? "text-white/60" : log.type === "error" ? "text-red-400/80" : "text-white/30"}`}>
                  {log.message}
                </p>
                <span className="ml-auto text-[10px] text-white/15 flex-shrink-0">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {logs.length === 0 && !running && (
        <div className="px-5 py-8 text-center">
          <Clock className="mx-auto h-8 w-8 text-white/10 mb-2" />
          <p className="text-xs text-white/25">Start the scheduler to automatically audit all your active projects</p>
        </div>
      )}
    </div>
  );
}
