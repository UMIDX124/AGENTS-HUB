"use client";

import ReactMarkdown from "react-markdown";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function MarkdownView({ content }: { content: string }) {
  return (
    <div className="prose-custom">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-lg font-bold text-foreground mt-5 mb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-bold text-foreground mt-5 mb-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-bold text-primary mt-4 mb-1.5">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm font-semibold text-foreground/80 mt-3 mb-1">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-sm text-muted-foreground leading-relaxed mb-2">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground/90">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="text-primary/80">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="space-y-1 mb-3 ml-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-1 mb-3 ml-1 list-decimal list-inside">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-sm text-muted-foreground leading-relaxed flex items-start gap-2">
              <span className="mt-2 size-1 shrink-0 rounded-full bg-primary/40" />
              <span>{children}</span>
            </li>
          ),
          hr: () => <Separator className="my-4" />,
          code: ({ children, className }) => {
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <Card className="my-3 overflow-hidden">
                  <div className="flex items-center px-3 py-1.5 border-b border-border bg-muted/30">
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {className?.replace("language-", "") || "code"}
                    </span>
                  </div>
                  <pre className="p-3 overflow-x-auto">
                    <code className="text-[11px] text-emerald-400/80 font-mono leading-relaxed">
                      {children}
                    </code>
                  </pre>
                </Card>
              );
            }
            return (
              <code className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-mono text-amber-400/80">
                {children}
              </code>
            );
          },
          pre: ({ children }) => <>{children}</>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 underline underline-offset-2"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-lg border border-border">
              <Table>{children}</Table>
            </div>
          ),
          thead: ({ children }) => <TableHeader>{children}</TableHeader>,
          th: ({ children }) => <TableHead>{children}</TableHead>,
          td: ({ children }) => <TableCell>{children}</TableCell>,
          tr: ({ children }) => <TableRow>{children}</TableRow>,
          tbody: ({ children }) => <TableBody>{children}</TableBody>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-primary/40 pl-3 my-3 text-muted-foreground italic">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
