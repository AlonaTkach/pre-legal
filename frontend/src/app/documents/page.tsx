"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listDocuments, SavedDocument } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { useRenderedDocument } from "@/lib/useRenderedDocument";
import { Header } from "@/components/Header";
import { DownloadButton } from "@/components/DownloadButton";

export default function DocumentsPage() {
  const { session, signOut } = useAuth();
  const [docs, setDocs] = useState<SavedDocument[]>([]);
  const [selected, setSelected] = useState<SavedDocument | null>(null);

  useEffect(() => {
    if (!session) return;
    let active = true;
    listDocuments(session.token)
      .then((d) => {
        if (active) {
          setDocs(d);
          setSelected((cur) => cur ?? d[0] ?? null);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [session]);

  const { preview, pdfDoc, fileName } = useRenderedDocument(
    selected?.document_type ?? null,
    selected?.fields ?? {},
  );

  return (
    <main className="min-h-screen bg-slate-100">
      <Header
        title="My documents"
        subtitle="Your saved drafts."
        session={session}
        onSignOut={signOut}
      />

      {!session ? (
        <div className="mx-auto max-w-md px-6 py-16 text-center">
          <p className="text-slate-600">Sign in to view your saved documents.</p>
          <Link
            href="/login"
            className="mt-4 inline-block rounded-lg bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-800"
          >
            Sign in
          </Link>
        </div>
      ) : (
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-[280px_1fr]">
          <aside aria-label="Saved documents list">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Saved</h2>
            {docs.length === 0 ? (
              <p className="text-sm text-slate-400">
                No documents yet.{" "}
                <Link href="/" className="text-indigo-700 hover:underline">
                  Draft one
                </Link>
                .
              </p>
            ) : (
              <ul className="space-y-2">
                {docs.map((d) => (
                  <li key={d.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(d)}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                        selected?.id === d.id
                          ? "border-indigo-500 bg-indigo-50 text-indigo-900"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="block font-semibold">{d.name}</span>
                      <span className="block text-xs text-slate-400">
                        {d.created_at}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          <section aria-label="Selected document preview">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Preview</h2>
              {selected && pdfDoc && (
                <DownloadButton document={pdfDoc} fileName={fileName} />
              )}
            </div>
            <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              These documents are drafts and are subject to legal review.
            </p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-inner">
              <div className="max-h-[70vh] overflow-y-auto rounded-lg">
                {selected ? (
                  preview
                ) : (
                  <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-400">
                    Select a document to preview it.
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
