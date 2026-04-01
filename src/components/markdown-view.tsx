"use client";

import ReactMarkdown from "react-markdown";

export function MarkdownView({ content }: { content: string }) {
  return (
    <div className="prose-custom">
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1 className="text-lg font-bold text-white mt-5 mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-bold text-white mt-5 mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-bold text-indigo-300 mt-4 mb-1.5">{children}</h3>,
          h4: ({ children }) => <h4 className="text-sm font-semibold text-white/80 mt-3 mb-1">{children}</h4>,
          p: ({ children }) => <p className="text-sm text-white/60 leading-relaxed mb-2">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-white/90">{children}</strong>,
          em: ({ children }) => <em className="text-indigo-400/80">{children}</em>,
          ul: ({ children }) => <ul className="space-y-1 mb-3 ml-1">{children}</ul>,
          ol: ({ children }) => <ol className="space-y-1 mb-3 ml-1 list-decimal list-inside">{children}</ol>,
          li: ({ children }) => (
            <li className="text-sm text-white/60 leading-relaxed flex items-start gap-2">
              <span className="text-indigo-400/60 mt-1.5 flex-shrink-0 h-1 w-1 rounded-full bg-indigo-400/40" />
              <span>{children}</span>
            </li>
          ),
          hr: () => <hr className="border-white/[0.06] my-4" />,
          code: ({ children, className }) => {
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <div className="my-3 rounded-xl border border-white/[0.08] bg-black/40 overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/[0.06] bg-white/[0.02]">
                    <span className="text-[10px] text-white/30 font-mono">{className?.replace("language-", "") || "code"}</span>
                  </div>
                  <pre className="p-3 overflow-x-auto">
                    <code className="text-[11px] text-emerald-300/80 font-mono leading-relaxed">{children}</code>
                  </pre>
                </div>
              );
            }
            return <code className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[11px] font-mono text-amber-300/80">{children}</code>;
          },
          pre: ({ children }) => <>{children}</>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-xl border border-white/[0.08]">
              <table className="w-full text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-white/[0.03] border-b border-white/[0.06]">{children}</thead>,
          th: ({ children }) => <th className="px-3 py-2 text-left text-xs font-semibold text-white/60">{children}</th>,
          td: ({ children }) => <td className="px-3 py-2 text-xs text-white/50 border-t border-white/[0.04]">{children}</td>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-indigo-500/40 pl-3 my-3 text-white/40 italic">{children}</blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
