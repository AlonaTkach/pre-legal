"use client";

import ReactMarkdown from "react-markdown";
import { humanizeKey } from "@/lib/api";

type Props = {
  name: string;
  fields: Record<string, string>;
  markdown: string;
};

export function DocumentPreview({ name, fields, markdown }: Props) {
  const entries = Object.entries(fields).filter(([, v]) => v && v.trim());

  return (
    <article
      aria-label="Document preview"
      className="mx-auto max-w-2xl bg-white px-8 py-10 text-slate-900 shadow-sm"
    >
      <h1 className="text-2xl font-bold">{name}</h1>

      {entries.length > 0 && (
        <div className="mt-6">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Key details
          </h2>
          <dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            {entries.map(([k, v]) => (
              <div key={k}>
                <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {humanizeKey(k)}
                </dt>
                <dd className="text-sm text-slate-800">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <hr className="my-8 border-slate-200" />

      <div className="prose-sm space-y-3 text-justify text-sm leading-relaxed text-slate-700 [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-semibold [&_strong]:font-semibold [&_a]:text-indigo-700">
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </div>
    </article>
  );
}
