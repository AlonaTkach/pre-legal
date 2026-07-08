"use client";

import { ReactElement, useEffect, useState } from "react";
import { fetchTemplate, ndaDataFromFields } from "@/lib/api";
import { NdaPreview } from "@/components/NdaPreview";
import { NdaPdfDocument } from "@/components/NdaPdfDocument";
import { DocumentPreview } from "@/components/DocumentPreview";
import { DocumentPdfDocument } from "@/components/DocumentPdfDocument";

function EmptyPreview() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center rounded-lg bg-white p-10 text-center text-sm text-slate-400 shadow-sm">
      Your document will appear here as you chat with the assistant.
    </div>
  );
}

type Rendered = {
  preview: ReactElement;
  pdfDoc: ReactElement | null;
  fileName: string;
  documentName: string | null;
};

export function useRenderedDocument(
  documentType: string | null,
  fields: Record<string, string>,
): Rendered {
  const [template, setTemplate] = useState<{
    id: string;
    name: string;
    markdown: string;
  } | null>(null);

  const isNda = documentType === "mutual-nda";

  useEffect(() => {
    if (!documentType || isNda) return;
    let active = true;
    fetchTemplate(documentType)
      .then((t) => {
        if (active) setTemplate({ id: t.id, name: t.name, markdown: t.markdown });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [documentType, isNda]);

  const activeTemplate =
    template && template.id === documentType ? template : null;

  if (isNda) {
    const data = ndaDataFromFields(fields);
    return {
      preview: <NdaPreview data={data} />,
      pdfDoc: <NdaPdfDocument data={data} />,
      fileName: "Mutual-NDA",
      documentName: "Mutual Non-Disclosure Agreement",
    };
  }

  if (documentType && activeTemplate) {
    return {
      preview: (
        <DocumentPreview
          name={activeTemplate.name}
          fields={fields}
          markdown={activeTemplate.markdown}
        />
      ),
      pdfDoc: (
        <DocumentPdfDocument
          name={activeTemplate.name}
          fields={fields}
          markdown={activeTemplate.markdown}
        />
      ),
      fileName: activeTemplate.name,
      documentName: activeTemplate.name,
    };
  }

  return {
    preview: <EmptyPreview />,
    pdfDoc: null,
    fileName: "document",
    documentName: null,
  };
}
