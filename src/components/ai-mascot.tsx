"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

type MascotMood = "idle" | "happy" | "thinking" | "waving" | "sleeping";

function MascotSVG({ mood, size = 56 }: { mood: MascotMood; size?: number }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className="drop-shadow-[0_4px_20px_rgba(20,184,166,0.4)]">
      <defs>
        <linearGradient id="mascot-body" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
        <linearGradient id="mascot-shine" x1="30" y1="20" x2="90" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <filter id="mascot-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Body - rounded robot shape */}
      <rect x="20" y="20" width="80" height="80" rx="28" fill="url(#mascot-body)" filter="url(#mascot-shadow)" />

      {/* Shine overlay */}
      <rect x="20" y="20" width="80" height="80" rx="28" fill="url(#mascot-shine)" />

      {/* Antenna */}
      <line x1="60" y1="20" x2="60" y2="8" stroke="#14b8a6" strokeWidth="3" strokeLinecap="round">
        {mood === "waving" && (
          <animateTransform attributeName="transform" type="rotate" values="-10 60 20;10 60 20;-10 60 20" dur="0.5s" repeatCount="3" />
        )}
      </line>
      <circle cx="60" cy="6" r="4" fill="#5eead4">
        <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* Left eye */}
      <g>
        {mood === "sleeping" ? (
          <>
            <line x1="38" y1="52" x2="50" y2="52" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <line x1="40" y1="49" x2="44" y2="52" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </>
        ) : mood === "happy" ? (
          <path d="M38 55 Q44 45 50 55" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
        ) : (
          <>
            <ellipse cx="44" cy="52" rx={mood === "thinking" ? 5 : 6} ry={mood === "thinking" ? 7 : 6} fill="white" />
            <ellipse cx={mood === "thinking" ? 46 : 45} cy="52" rx="3" ry="3" fill="#0f172a">
              {mood === "idle" && (
                <animate attributeName="ry" values="3;0.5;3" dur="3s" repeatCount="indefinite" begin="0s;blink.end+2s" id="blink" />
              )}
            </ellipse>
            {/* Eye shine */}
            <circle cx="42" cy="50" r="1.5" fill="rgba(255,255,255,0.8)" />
          </>
        )}
      </g>

      {/* Right eye */}
      <g>
        {mood === "sleeping" ? (
          <>
            <line x1="70" y1="52" x2="82" y2="52" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <line x1="76" y1="49" x2="80" y2="52" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </>
        ) : mood === "happy" ? (
          <path d="M70 55 Q76 45 82 55" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
        ) : (
          <>
            <ellipse cx="76" cy="52" rx={mood === "thinking" ? 5 : 6} ry={mood === "thinking" ? 7 : 6} fill="white" />
            <ellipse cx={mood === "thinking" ? 78 : 77} cy="52" rx="3" ry="3" fill="#0f172a">
              {mood === "idle" && (
                <animate attributeName="ry" values="3;0.5;3" dur="3s" repeatCount="indefinite" begin="blink.begin" />
              )}
              {mood === "thinking" && (
                <animate attributeName="cx" values="76;80;76" dur="1.5s" repeatCount="indefinite" />
              )}
            </ellipse>
            <circle cx="74" cy="50" r="1.5" fill="rgba(255,255,255,0.8)" />
          </>
        )}
      </g>

      {/* Mouth */}
      {mood === "happy" ? (
        <path d="M45 68 Q60 82 75 68" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
      ) : mood === "thinking" ? (
        <ellipse cx="60" cy="72" rx="5" ry="4" fill="white" opacity="0.8">
          <animate attributeName="rx" values="5;6;5" dur="1s" repeatCount="indefinite" />
        </ellipse>
      ) : mood === "sleeping" ? (
        <>
          <path d="M50 70 Q60 74 70 70" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
          <text x="78" y="38" fill="white" fontSize="12" opacity="0.6" fontFamily="serif" fontStyle="italic">z</text>
          <text x="86" y="30" fill="white" fontSize="10" opacity="0.4" fontFamily="serif" fontStyle="italic">z</text>
          <text x="92" y="24" fill="white" fontSize="8" opacity="0.2" fontFamily="serif" fontStyle="italic">z</text>
        </>
      ) : mood === "waving" ? (
        <path d="M45 68 Q60 80 75 68" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
      ) : (
        <path d="M48 70 Q60 76 72 70" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      )}

      {/* Cheek blush */}
      {(mood === "happy" || mood === "waving") && (
        <>
          <circle cx="34" cy="64" r="5" fill="rgba(251,113,133,0.3)" />
          <circle cx="86" cy="64" r="5" fill="rgba(251,113,133,0.3)" />
        </>
      )}

      {/* Waving hand */}
      {mood === "waving" && (
        <g>
          <circle cx="105" cy="45" r="8" fill="#0d9488" stroke="#14b8a6" strokeWidth="2">
            <animateTransform attributeName="transform" type="rotate" values="-20 105 55;20 105 55;-20 105 55" dur="0.4s" repeatCount="5" />
          </circle>
          <text x="101" y="49" fill="white" fontSize="12" fontWeight="bold">
            <animateTransform attributeName="transform" type="rotate" values="-20 105 55;20 105 55;-20 105 55" dur="0.4s" repeatCount="5" />
            👋
          </text>
        </g>
      )}

      {/* Thinking dots */}
      {mood === "thinking" && (
        <g>
          <circle cx="90" cy="35" r="3" fill="rgba(255,255,255,0.5)">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" begin="0s" />
          </circle>
          <circle cx="98" cy="28" r="4" fill="rgba(255,255,255,0.4)">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" begin="0.3s" />
          </circle>
          <circle cx="108" cy="22" r="5" fill="rgba(255,255,255,0.3)">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" begin="0.6s" />
          </circle>
        </g>
      )}
    </svg>
  );
}

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

export function AIMascot() {
  const [open, setOpen] = useState(false);
  const [mood, setMood] = useState<MascotMood>("idle");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasWaved, setHasWaved] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Wave on first visit
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasWaved) {
        setMood("waving");
        setTimeout(() => setMood("idle"), 2500);
        setHasWaved(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [hasWaved]);

  // Sleep after inactivity
  useEffect(() => {
    if (open || mood === "waving") return;
    const timer = setTimeout(() => setMood("sleeping"), 60000);
    const wake = () => { setMood("idle"); };
    document.addEventListener("mousemove", wake, { once: true });
    return () => { clearTimeout(timer); document.removeEventListener("mousemove", wake); };
  }, [mood, open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const msg = input.trim();
    if (!msg || loading) return;
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setInput("");
    setLoading(true);
    setMood("thinking");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      setMood("happy");
      setTimeout(() => setMood("idle"), 3000);
    } catch (err: any) {
      toast.error(err.message);
      setMood("idle");
    } finally {
      setLoading(false);
    }
  }

  const quickQuestions = [
    "Meri biggest SEO issue kya hai?",
    "Score improve kaise karun?",
    "Quick action plan de do",
  ];

  return (
    <>
      {/* Chat popup */}
      {open && (
        <div className="fixed bottom-28 right-6 z-[90] w-[360px] max-h-[500px] rounded-2xl border border-border bg-card shadow-2xl shadow-black/30 flex flex-col animate-scale-in overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
            <div className="flex items-center gap-2">
              <MascotSVG mood={mood} size={28} />
              <div>
                <p className="text-xs font-bold text-foreground">SEO Buddy</p>
                <p className="text-[10px] text-muted-foreground">
                  {loading ? "Thinking..." : "Online"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => router.push("/chat")}
                className="rounded-lg px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Full Chat
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px] max-h-[340px]">
            {messages.length === 0 ? (
              <div className="text-center py-6">
                <MascotSVG mood="happy" size={48} />
                <p className="text-xs font-semibold text-foreground mt-3">Hey! Main tumhara SEO buddy hoon</p>
                <p className="text-[10px] text-muted-foreground mt-1">Kuch bhi poocho apne SEO data ke baare mein</p>
                <div className="mt-3 space-y-1.5">
                  {quickQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => { setInput(q); }}
                      className="block w-full text-left rounded-lg border border-border bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "gap-2"}`}>
                  {m.role === "assistant" && <MascotSVG mood="idle" size={20} />}
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 text-[12px] leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/60 text-foreground border border-border/50"
                  }`}>
                    {m.role === "assistant" ? (
                      <div className="prose prose-xs prose-invert max-w-none [&_p]:my-0.5 [&_ul]:my-0.5 [&_li]:my-0 [&_h1]:text-xs [&_h2]:text-xs [&_h3]:text-xs [&_strong]:text-foreground">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    ) : m.content}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex gap-2">
                <MascotSVG mood="thinking" size={20} />
                <div className="bg-muted/60 border border-border/50 rounded-xl px-3 py-2 text-[12px] text-muted-foreground flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin" /> Soch raha hoon...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-2 border-t border-border">
            <div className="flex gap-1.5">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Kuch poocho..."
                disabled={loading}
                className="flex-1 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-foreground placeholder-muted-foreground/50 outline-none focus:border-primary/50 disabled:opacity-50"
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                className="rounded-lg bg-primary px-3 py-2 text-primary-foreground hover:brightness-110 disabled:opacity-50 transition-all"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating mascot button */}
      <button
        onClick={() => { setOpen(!open); setMood("happy"); setTimeout(() => !open || setMood("idle"), 2000); }}
        onMouseEnter={() => { if (mood === "idle" || mood === "sleeping") setMood("happy"); }}
        onMouseLeave={() => { if (!open && mood === "happy") setMood("idle"); }}
        className="fixed bottom-6 right-6 z-[90] animate-float"
        style={{ animationDuration: "4s" }}
      >
        <div className="relative">
          <MascotSVG mood={mood} size={72} />

          {/* Notification dot */}
          {!open && messages.length === 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-primary text-[8px] font-bold text-primary-foreground items-center justify-center">?</span>
            </span>
          )}
        </div>
      </button>
    </>
  );
}
