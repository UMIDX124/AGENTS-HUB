import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Mock Google Search Console data — replace with real OAuth + GSC API later
function generateMockGSCData(url: string) {
  const domain = new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
  const seed = domain.length * 7;

  const queries = [
    { query: `${domain.replace("www.", "")} reviews`, clicks: 120 + (seed % 80), impressions: 2400, ctr: 5.0, position: 3.2 },
    { query: `best ${domain.split(".")[0]} alternative`, clicks: 85 + (seed % 50), impressions: 3100, ctr: 2.7, position: 8.1 },
    { query: domain.replace("www.", ""), clicks: 340 + (seed % 200), impressions: 890, ctr: 38.2, position: 1.1 },
    { query: `${domain.split(".")[0]} pricing`, clicks: 67 + (seed % 40), impressions: 1800, ctr: 3.7, position: 5.4 },
    { query: `${domain.split(".")[0]} features`, clicks: 54 + (seed % 30), impressions: 1200, ctr: 4.5, position: 4.8 },
    { query: `how to use ${domain.split(".")[0]}`, clicks: 42 + (seed % 25), impressions: 980, ctr: 4.3, position: 6.2 },
    { query: `${domain.split(".")[0]} vs competitor`, clicks: 38 + (seed % 20), impressions: 1500, ctr: 2.5, position: 9.3 },
    { query: `${domain.split(".")[0]} login`, clicks: 210 + (seed % 100), impressions: 650, ctr: 32.3, position: 1.0 },
  ];

  const pages = [
    { page: `https://${domain}/`, clicks: 450 + (seed % 200), impressions: 5200, ctr: 8.7, position: 3.1 },
    { page: `https://${domain}/pricing`, clicks: 120 + (seed % 80), impressions: 2800, ctr: 4.3, position: 5.2 },
    { page: `https://${domain}/features`, clicks: 95 + (seed % 60), impressions: 2100, ctr: 4.5, position: 4.9 },
    { page: `https://${domain}/blog`, clicks: 78 + (seed % 50), impressions: 3400, ctr: 2.3, position: 12.4 },
    { page: `https://${domain}/about`, clicks: 32 + (seed % 20), impressions: 890, ctr: 3.6, position: 7.8 },
  ];

  const performanceTrend = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      date: d.toISOString().split("T")[0],
      clicks: Math.round(150 + Math.random() * 100 + (seed % 50)),
      impressions: Math.round(3000 + Math.random() * 2000 + (seed % 500)),
    };
  });

  return {
    domain,
    connected: true,
    mock: true,
    summary: {
      totalClicks: queries.reduce((s, q) => s + q.clicks, 0),
      totalImpressions: queries.reduce((s, q) => s + q.impressions, 0),
      avgCTR: parseFloat((queries.reduce((s, q) => s + q.ctr, 0) / queries.length).toFixed(1)),
      avgPosition: parseFloat((queries.reduce((s, q) => s + q.position, 0) / queries.length).toFixed(1)),
    },
    queries,
    pages,
    performanceTrend,
  };
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "URL parameter required" }, { status: 400 });
    }

    const data = generateMockGSCData(url);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
