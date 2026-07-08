"use client";

import { useState } from "react";
import Link from "next/link";
import { ChatResult, saveDocument } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { useRenderedDocument } from "@/lib/useRenderedDocument";
import { Header } from "@/components/Header";
import { ChatPanel } from "@/components/ChatPanel";
import { DownloadButton } from "@/components/DownloadButton";

export default function Home() {
  const { session, signOut } = useAuth();
  const [result, setResult] = useState<ChatResult | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

  const docType = result?.document_type ?? null;
  const fields = result?.fields ?? {};
  const complete = result?.complete ?? false;
  const { preview, pdfDoc, fileName, documentName } = useRenderedDocument(
    docType,
    fields,
  );

  function handleResult(r: ChatResult) {
    setResult(r);
    setSaveState("idle");
  }

  async function handleSave() {
    if (!session || !docType) return;
    setSaveState("saving");
    try {
      await saveDocument(session.token, documentName ?? docType, docType, fields);
      setSaveState("saved");
    } catch {
      setSaveState("idle");
    }
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <Header
        title="Legal agreement drafter"
        subtitle="Chat with the assistant to draft a legal agreement, then download it as a PDF."
        session={session}
        onSignOut={signOut}
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-2">
        <section aria-label="Assistant chat">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Assistant</h2>
          <ChatPanel onResult={handleResult} />
        </section>

        <section aria-label="Live document preview">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-800">Preview</h2>
            {complete && pdfDoc && (
              <div className="flex items-center gap-2">
                {session ? (
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saveState !== "idle"}
                    className="rounded-lg border border-indigo-700 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 disabled:opacity-60"
                  >
                    {saveState === "saved"
                      ? "Saved"
                      : saveState === "saving"
                        ? "Saving…"
                        : "Save"}
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Sign in to save
                  </Link>
                )}
                <DownloadButton document={pdfDoc} fileName={fileName} />
              </div>
            )}
          </div>

          <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            These documents are drafts and are subject to legal review.
          </p>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-inner">
            <div className="max-h-[70vh] overflow-y-auto rounded-lg">{preview}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
