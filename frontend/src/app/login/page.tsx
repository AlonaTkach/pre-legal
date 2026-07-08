"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// PL-4: placeholder login screen only. No authentication — any input brings
// the user into the platform. Real auth arrives in PL-7.
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  function enter(e: React.FormEvent) {
    e.preventDefault();
    router.push("/");
  }

  const field =
    "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-700">
          pre-legal
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Sign in</h1>
        <p className="mt-1 text-sm text-slate-500">
          Draft legal agreements in minutes.
        </p>

        <form className="mt-6 space-y-4" onSubmit={enter}>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Email
            </label>
            <input
              aria-label="Email"
              type="email"
              className={field}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Password
            </label>
            <input aria-label="Password" type="password" className={field} placeholder="••••••••" />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-800"
          >
            Enter platform
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-400">
          Demo login — no account required.
        </p>
      </div>
    </main>
  );
}
