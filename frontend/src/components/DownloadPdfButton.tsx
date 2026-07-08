"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { NdaData, partyLabel } from "@/lib/nda";
import { NdaPdfDocument } from "./NdaPdfDocument";

function fileName(data: NdaData): string {
  const p1 = partyLabel(data.party1, "Party1").replace(/[^a-z0-9]+/gi, "-");
  const p2 = partyLabel(data.party2, "Party2").replace(/[^a-z0-9]+/gi, "-");
  return `Mutual-NDA-${p1}-${p2}.pdf`.replace(/-+/g, "-");
}

export function DownloadPdfButton({ data }: { data: NdaData }) {
  const [generating, setGenerating] = useState(false);

  async function handleDownload() {
    setGenerating(true);
    try {
      const blob = await pdf(<NdaPdfDocument data={data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName(data);
      document.body.appendChild(link);
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
      className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {generating ? "Generating PDF…" : "Download PDF"}
    </button>
  );
}
