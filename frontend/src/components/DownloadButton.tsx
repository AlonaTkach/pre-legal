"use client";

import { ReactElement, useState } from "react";
import { pdf } from "@react-pdf/renderer";

function safeName(raw: string): string {
  return (
    raw
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "document"
  );
}

export function DownloadButton({
  document: doc,
  fileName,
}: {
  document: ReactElement;
  fileName: string;
}) {
  const [generating, setGenerating] = useState(false);

  async function handleDownload() {
    setGenerating(true);
    try {
      const blob = await pdf(doc as Parameters<typeof pdf>[0]).toBlob();
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = `${safeName(fileName)}.pdf`;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={generating}
      className="inline-flex items-center gap-2 rounded-lg bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {generating ? "Generating PDF…" : "Download PDF"}
    </button>
  );
}
