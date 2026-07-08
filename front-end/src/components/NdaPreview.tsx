"use client";

import {
  ATTRIBUTION,
  derive,
  filledTerms,
  NdaData,
  partyLabel,
} from "@/lib/nda";

function PartyCard({
  heading,
  company,
  name,
  title,
  notice,
}: {
  heading: string;
  company: string;
  name: string;
  title: string;
  notice: string;
}) {
  const row = (label: string, value: string) => (
    <p className="text-sm text-slate-700">
      <span className="text-slate-400">{label}: </span>
      <span className={value ? "" : "text-slate-300"}>{value || "—"}</span>
    </p>
  );
  return (
    <div className="flex-1 rounded-md border border-slate-200 p-3">
      <p className="mb-2 text-xs font-bold text-slate-600">{heading}</p>
      <div className="space-y-1">
        {row("Company", company)}
        {row("Name", name)}
        {row("Title", title)}
        {row("Notice", notice)}
      </div>
    </div>
  );
}

export function NdaPreview({ data }: { data: NdaData }) {
  const d = derive(data);
  const terms = filledTerms(data);
  const p1 = partyLabel(data.party1, "Party 1");
  const p2 = partyLabel(data.party2, "Party 2");

  const coverField = (label: string, value: string) => (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p className="text-sm text-slate-800">{value}</p>
    </div>
  );

  return (
    <article
      aria-label="NDA preview"
      className="mx-auto max-w-2xl bg-white px-8 py-10 text-slate-900 shadow-sm"
    >
      <h1 className="text-2xl font-bold">Mutual Non-Disclosure Agreement</h1>
      <p className="mt-1 text-sm text-slate-500">
        Cover Page · {p1} &amp; {p2}
      </p>

      <div className="mt-6 space-y-4">
        {coverField("Purpose", d.purpose)}
        <div className="grid grid-cols-2 gap-4">
          {coverField("Effective Date", d.effectiveDate)}
          {coverField("MNDA Term", d.mndaTerm)}
          {coverField("Term of Confidentiality", d.confidentialityTerm)}
          {coverField("Governing Law", d.governingLaw)}
        </div>
        {coverField("Jurisdiction", d.jurisdiction)}
      </div>

      <div className="mt-6 flex gap-3">
        <PartyCard
          heading="Party 1"
          company={data.party1.company}
          name={data.party1.name}
          title={data.party1.title}
          notice={data.party1.noticeAddress}
        />
        <PartyCard
          heading="Party 2"
          company={data.party2.company}
          name={data.party2.name}
          title={data.party2.title}
          notice={data.party2.noticeAddress}
        />
      </div>

      <hr className="my-8 border-slate-200" />

      <h2 className="text-lg font-bold">Standard Terms</h2>
      <div className="mt-3 space-y-3">
        {terms.map((c) => (
          <div key={c.n}>
            <p className="text-sm font-semibold text-slate-900">
              {c.n}. {c.title}
            </p>
            <p className="text-justify text-sm leading-relaxed text-slate-700">
              {c.body}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-8 text-[10px] text-slate-400">{ATTRIBUTION}</p>
    </article>
  );
}
