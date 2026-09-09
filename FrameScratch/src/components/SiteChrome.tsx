import Link from "next/link";
import { ReactNode } from "react";

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="inline-block w-3 h-3 rounded-sm bg-orange-500" />
          FrameScratch
        </Link>
        <nav className="text-sm text-slate-500 flex gap-5">
          <Link href="/" className="hover:text-slate-900">App</Link>
          <Link href="/faq" className="hover:text-slate-900">FAQ</Link>
          <Link href="/github" className="hover:text-slate-900">GitHub</Link>
          <Link href="/privacy" className="hover:text-slate-900">Privacy</Link>
          <Link href="/terms" className="hover:text-slate-900">Terms</Link>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-slate-200 mt-16">
      <div className="max-w-4xl mx-auto px-6 py-6 text-xs text-slate-400 flex justify-between">
        <span>© {new Date().getFullYear()} FrameScratch</span>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-slate-600">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-slate-600">Terms of Service</Link>
          <Link href="/github" className="hover:text-slate-600">GitHub</Link>
        </div>
      </div>
    </footer>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
