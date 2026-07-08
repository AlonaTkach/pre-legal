"use client";

import { useState } from "react";
import Link from "next/link";
import { DEFAULT_NDA, NdaData } from "@/lib/nda";
import { NdaChat } from "@/components/NdaChat";
import { NdaPreview } from "@/components/NdaPreview";
import { DownloadPdfButton } from "@/components/DownloadPdfButton";

export default function Home() {
  const [data, setData] = useState<NdaData>(DEFAULT_NDA);
  const [complete, setComplete] = useState(false);

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-start justify-between gap-4 px-6 py-5">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-700">
              pre-legal
            </p>
            <h1 className="text-2xl font-bold text-slate-900">Mutual NDA Creator</h1>
            <p className="text-sm text-slate-500">
              Chat with the assistant to draft your Mutual Non-Disclosure
              Agreement, then download it as a PDF.
            </p>
          </div>
          <Link
            href="/login"
            className="shrink-0 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Sign in
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-2">
        <section aria-label="Assistant chat">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Assistant</h2>
          <NdaChat onFieldsChange={setData} onComplete={setComplete} />
        </section>

        <section aria-label="Live document preview">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Preview</h2>
            {complete && <DownloadPdfButton data={data} />}
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-inner">
            <div className="max-h-[70vh] overflow-y-auto rounded-lg">
              <NdaPreview data={data} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
