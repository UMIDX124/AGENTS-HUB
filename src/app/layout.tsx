import type { Metadata } from "next";
import localFont from "next/font/local";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-sans",
  weight: "100 900",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-mono",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SEO Agents Hub — AI-Powered SEO Command Center",
    template: "%s | SEO Agents Hub",
  },
  description:
    "Run AI-powered SEO audits, generate meta tags, schema markup, content, and outreach emails. 5 AI agents + 14 SEO tools.",
  keywords: [
    "SEO tool",
    "AI SEO",
    "SEO audit",
    "meta tags generator",
    "schema markup",
    "keyword research",
    "backlink finder",
  ],
  authors: [{ name: "Digital Point LLC" }],
  openGraph: {
    title: "SEO Agents Hub — AI-Powered SEO Command Center",
    description:
      "5 AI agents + 14 SEO tools. Analyze any website and generate ready-to-use SEO recommendations.",
    url: "https://agents-hub-fawn.vercel.app",
    siteName: "SEO Agents Hub",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Agents Hub",
    description:
      "AI-Powered SEO Command Center — 5 agents, 14 tools.",
  },
  robots: { index: true, follow: true },
  metadataBase: new URL("https://agents-hub-fawn.vercel.app"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <ThemeProvider>
          <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: "!bg-card !text-foreground !border-border",
            }}
            richColors
            closeButton
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
