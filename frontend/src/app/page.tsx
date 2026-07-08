"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChatResult, fetchTemplate, ndaDataFromFields } from "@/lib/api";
import { ChatPanel } from "@/components/ChatPanel";
import { NdaPreview } from "@/components/NdaPreview";
import { NdaPdfDocument } from "@/components/NdaPdfDocument";
import { DocumentPreview } from "@/components/DocumentPreview";
import { DocumentPdfDocument } from "@/components/DocumentPdfDocument";
import { DownloadButton } from "@/components/DownloadButton";

function EmptyPreview() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center rounded-lg bg-white p-10 text-center text-sm text-slate-400 shadow-sm">
      Your document will appear here as you chat with the assistant.
    </div>
  );
}

export default function Home() {
  const [result, setResult] = useState<ChatResult | null>(null);
  const [template, setTemplate] = useState<{
    id: string;
    name: string;
    markdown: string;
  } | null>(null);

  const docType = result?.document_type ?? null;
  const isNda = docType === "mutual-nda";
  const complete = result?.complete ?? false;

  useEffect(() => {
    if (!docType || isNda) return;
    let active = true;
    fetchTemplate(docType)
      .then((t) => {
        if (active) setTemplate({ id: t.id, name: t.name, markdown: t.markdown });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [docType, isNda]);

  // Only treat the fetched template as current once it matches the chosen type.
  const activeTemplate = template && template.id === docType ? template : null;

  let preview = <EmptyPreview />;
  let pdfDoc: React.ReactElement | null = null;
  let fileName = "document";

  if (isNda && result) {
    const data = ndaDataFromFields(result.fields);
    preview = <NdaPreview data={data} />;
    pdfDoc = <NdaPdfDocument data={data} />;
    fileName = "Mutual-NDA";
  } else if (docType && activeTemplate && result) {
    preview = (
      <DocumentPreview
        name={activeTemplate.name}
        fields={result.fields}
        markdown={activeTemplate.markdown}
      />
    );
    pdfDoc = (
      <DocumentPdfDocument
        name={activeTemplate.name}
        fields={result.fields}
        markdown={activeTemplate.markdown}
      />
    );
    fileName = activeTemplate.name;
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-start justify-between gap-4 px-6 py-5">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-700">
              pre-legal
            </p>
            <h1 className="text-2xl font-bold text-slate-900">Legal agreement drafter</h1>
            <p className="text-sm text-slate-500">
              Chat with the assistant to draft a legal agreement, then download
              it as a PDF.
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
          <ChatPanel onResult={setResult} />
        </section>

        <section aria-label="Live document preview">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Preview</h2>
            {complete && pdfDoc && (
              <DownloadButton document={pdfDoc} fileName={fileName} />
            )}
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-inner">
            <div className="max-h-[70vh] overflow-y-auto rounded-lg">{preview}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
