export type Locale = "en" | "ur";

export const LOCALES: { id: Locale; name: string; dir: "ltr" | "rtl" }[] = [
  { id: "en", name: "English", dir: "ltr" },
  { id: "ur", name: "اردو", dir: "rtl" },
];

const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Nav
    "nav.dashboard": "Dashboard",
    "nav.audit": "Run Audit",
    "nav.tools": "SEO Tools",
    "nav.projects": "Projects",
    "nav.tasks": "Tasks",
    "nav.team": "Team",
    "nav.reports": "Reports",
    "nav.pinboard": "Pinboard",
    "nav.settings": "Settings",
    "nav.activity": "Activity Log",
    "nav.compare": "Compare",
    "nav.search_console": "Search Console",
    "nav.portal": "Client Portal",
    "nav.docs": "API Docs",
    "nav.billing": "Billing",

    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.total_audits": "Total Audits",
    "dashboard.avg_score": "Avg SEO Score",
    "dashboard.active_projects": "Active Projects",
    "dashboard.pending_tasks": "Pending Tasks",
    "dashboard.recent_audits": "Recent Audits",
    "dashboard.quick_launch": "Quick Launch",
    "dashboard.no_audits": "No audits yet",
    "dashboard.run_first": "Run your first AI audit to get started",

    // Audit
    "audit.title": "AI Audit",
    "audit.subtitle": "SEO Intelligence",
    "audit.target": "Target Website",
    "audit.bulk_mode": "Bulk Mode",
    "audit.run_all": "Run All 5 Agents",
    "audit.select_agent": "Select Agent or Run All",

    // Common
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.loading": "Loading...",
    "common.export": "Export",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.view_all": "View all",
    "common.good_morning": "Good morning",
    "common.good_afternoon": "Good afternoon",
    "common.good_evening": "Good evening",
  },
  ur: {
    // Nav
    "nav.dashboard": "ڈیش بورڈ",
    "nav.audit": "آڈٹ چلائیں",
    "nav.tools": "SEO ٹولز",
    "nav.projects": "پروجیکٹس",
    "nav.tasks": "ٹاسکس",
    "nav.team": "ٹیم",
    "nav.reports": "رپورٹس",
    "nav.pinboard": "پن بورڈ",
    "nav.settings": "ترتیبات",
    "nav.activity": "سرگرمی لاگ",
    "nav.compare": "موازنہ",
    "nav.search_console": "سرچ کنسول",
    "nav.portal": "کلائنٹ پورٹل",
    "nav.docs": "API دستاویزات",
    "nav.billing": "بلنگ",

    // Dashboard
    "dashboard.title": "ڈیش بورڈ",
    "dashboard.total_audits": "کل آڈٹس",
    "dashboard.avg_score": "اوسط SEO سکور",
    "dashboard.active_projects": "فعال پروجیکٹس",
    "dashboard.pending_tasks": "زیر التواء ٹاسکس",
    "dashboard.recent_audits": "حالیہ آڈٹس",
    "dashboard.quick_launch": "فوری لانچ",
    "dashboard.no_audits": "ابھی تک کوئی آڈٹ نہیں",
    "dashboard.run_first": "شروع کرنے کے لیے اپنا پہلا AI آڈٹ چلائیں",

    // Audit
    "audit.title": "AI آڈٹ",
    "audit.subtitle": "SEO انٹیلی جنس",
    "audit.target": "ہدف ویب سائٹ",
    "audit.bulk_mode": "بلک موڈ",
    "audit.run_all": "تمام 5 ایجنٹس چلائیں",
    "audit.select_agent": "ایجنٹ منتخب کریں یا سب چلائیں",

    // Common
    "common.save": "محفوظ کریں",
    "common.cancel": "منسوخ",
    "common.delete": "حذف کریں",
    "common.loading": "لوڈ ہو رہا ہے...",
    "common.export": "برآمد",
    "common.search": "تلاش",
    "common.filter": "فلٹر",
    "common.view_all": "سب دیکھیں",
    "common.good_morning": "صبح بخیر",
    "common.good_afternoon": "دوپہر بخیر",
    "common.good_evening": "شام بخیر",
  },
};

export function t(key: string, locale: Locale = "en"): string {
  return translations[locale]?.[key] || translations.en[key] || key;
}

export function getLocaleFromStorage(): Locale {
  if (typeof window === "undefined") return "en";
  return (localStorage.getItem("seo-hub-locale") as Locale) || "en";
}

export function setLocaleToStorage(locale: Locale): void {
  localStorage.setItem("seo-hub-locale", locale);
}
