import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#04050b]">
      <div className="text-center">
        <h1 className="text-7xl font-black text-white/10">404</h1>
        <p className="mt-2 text-lg font-semibold text-foreground">Page not found</p>
        <p className="mt-1 text-sm text-muted-foreground">The page you are looking for does not exist.</p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/20"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
