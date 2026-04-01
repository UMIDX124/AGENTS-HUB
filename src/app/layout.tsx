import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const inter = localFont({
  src: [
    { path: "./fonts/GeistVF.woff", weight: "100 900" },
  ],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SEO Agents Hub — AI-Powered SEO Command Center",
    template: "%s | SEO Agents Hub",
  },
  description: "Run AI-powered SEO audits, generate meta tags, schema markup, content, and outreach emails. 14 free SEO tools powered by GPT-5.",
  keywords: ["SEO tool", "AI SEO", "SEO audit", "meta tags generator", "schema markup", "keyword research", "backlink finder"],
  authors: [{ name: "Digital Point LLC" }],
  openGraph: {
    title: "SEO Agents Hub — AI-Powered SEO Command Center",
    description: "5 AI agents + 14 SEO tools. Analyze any website, generate ready-to-use code. Free, powered by GPT-5.",
    url: "https://agents-hub-fawn.vercel.app",
    siteName: "SEO Agents Hub",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Agents Hub",
    description: "AI-Powered SEO Command Center — 5 agents, 14 tools, zero cost.",
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
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
