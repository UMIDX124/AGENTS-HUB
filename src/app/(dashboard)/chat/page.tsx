"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Topbar } from "@/components/topbar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProviderSelect, useProvider } from "@/components/provider-select";
import ReactMarkdown from "react-markdown";
import { Send, Bot, User, Loader2, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  "What are my biggest SEO issues right now?",
  "How can I improve my lowest scoring audit?",
  "Give me a quick SEO action plan for this week",
  "Explain my latest audit findings",
  "What should I prioritize fixing first?",
];

export default function ChatPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [provider, setProvider] = useProvider();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text?: string) {
    const msg = text || input.trim();
    if (!msg || loading) return;

    const userMsg: ChatMessage = { role: "user", content: msg, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, provider }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const assistantMsg: ChatMessage = { role: "assistant", content: data.reply, timestamp: new Date() };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      toast.error(`Chat error: ${err.message}`);
      setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${err.message}`, timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Topbar user={{ name: user?.name || "User", role: user?.role || "SPECIALIST" }} title="AI Chat" subtitle="SEO Assistant" />

      <div className="flex-1 flex flex-col p-4 sm:p-6 max-w-3xl w-full mx-auto">
        <Breadcrumbs />

        {/* Provider selector */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Model</span>
          </div>
          <ProviderSelect value={provider} onChange={setProvider} />
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-[300px]">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">SEO Assistant</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md">
                Ask me anything about your SEO data, audit results, or get recommendations
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground hover:border-primary/30"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary mt-0.5">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/60 text-foreground border border-border/50"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5 [&_h1]:text-sm [&_h2]:text-sm [&_h3]:text-xs">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted mt-0.5">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))
          )}
          {loading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl bg-muted/60 border border-border/50 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking...
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="sticky bottom-0 bg-background pt-2">
          {messages.length > 0 && (
            <div className="flex justify-center mb-2">
              <button
                onClick={() => setMessages([])}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <Trash2 className="h-3 w-3" /> Clear conversation
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Ask about your SEO data..."
              disabled={loading}
              className="flex-1 rounded-xl border border-border bg-muted/60 px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 outline-none transition-all focus:border-primary/50 disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="flex items-center justify-center rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-3 text-white shadow-lg shadow-teal-500/20 hover:brightness-110 disabled:opacity-50 transition-all"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
