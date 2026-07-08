"use client";

import Link from "next/link";
import { Session } from "@/lib/useAuth";

type Props = {
  title: string;
  subtitle?: string;
  session: Session;
  onSignOut: () => void;
};

export function Header({ title, subtitle, session, onSignOut }: Props) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-start justify-between gap-4 px-6 py-5">
        <div className="flex flex-col gap-1">
          <Link
            href="/"
            className="text-xs font-bold uppercase tracking-widest text-indigo-700"
          >
            pre-legal
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>

        <nav className="flex shrink-0 items-center gap-3">
          {session ? (
            <>
              <Link
                href="/documents"
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                My documents
              </Link>
              <span className="hidden text-sm text-slate-400 sm:inline">
                {session.email}
              </span>
              <button
                type="button"
                onClick={onSignOut}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
