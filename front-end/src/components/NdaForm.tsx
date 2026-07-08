"use client";

import { NdaData, Party } from "@/lib/nda";

type Props = {
  data: NdaData;
  onChange: (data: NdaData) => void;
};

const fieldClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200";
const labelClass = "mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

export function NdaForm({ data, onChange }: Props) {
  const set = (patch: Partial<NdaData>) => onChange({ ...data, ...patch });
  const setParty = (key: "party1" | "party2", patch: Partial<Party>) =>
    onChange({ ...data, [key]: { ...data[key], ...patch } });

  const partyFields = (key: "party1" | "party2", heading: string) => {
    const p = data[key];
    return (
      <fieldset className="space-y-3 rounded-lg border border-slate-200 p-4">
        <legend className="px-1 text-sm font-semibold text-slate-700">{heading}</legend>
        <Field label="Company">
          <input
            aria-label={`${heading} company`}
            className={fieldClass}
            value={p.company}
            onChange={(e) => setParty(key, { company: e.target.value })}
            placeholder="Acme, Inc."
          />
        </Field>
        <Field label="Signatory name">
          <input
            aria-label={`${heading} name`}
            className={fieldClass}
            value={p.name}
            onChange={(e) => setParty(key, { name: e.target.value })}
            placeholder="Jane Doe"
          />
        </Field>
        <Field label="Title">
          <input
            aria-label={`${heading} title`}
            className={fieldClass}
            value={p.title}
            onChange={(e) => setParty(key, { title: e.target.value })}
            placeholder="CEO"
          />
        </Field>
        <Field label="Notice address (email or postal)">
          <input
            aria-label={`${heading} notice address`}
            className={fieldClass}
            value={p.noticeAddress}
            onChange={(e) => setParty(key, { noticeAddress: e.target.value })}
            placeholder="legal@acme.com"
          />
        </Field>
      </fieldset>
    );
  };

  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
      <Field label="Purpose">
        <textarea
          aria-label="Purpose"
          className={`${fieldClass} min-h-[72px] resize-y`}
          value={data.purpose}
          onChange={(e) => set({ purpose: e.target.value })}
          placeholder="How confidential information may be used"
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Effective date">
          <input
            aria-label="Effective date"
            type="date"
            className={fieldClass}
            value={data.effectiveDate}
            onChange={(e) => set({ effectiveDate: e.target.value })}
          />
        </Field>
        <Field label="MNDA term (years)">
          <input
            aria-label="MNDA term years"
            type="number"
            min={0}
            className={fieldClass}
            value={data.mndaTermYears}
            onChange={(e) => set({ mndaTermYears: e.target.value })}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Term of confidentiality (years)">
          <input
            aria-label="Confidentiality term years"
            type="number"
            min={0}
            className={fieldClass}
            value={data.confidentialityTermYears}
            onChange={(e) => set({ confidentialityTermYears: e.target.value })}
          />
        </Field>
        <Field label="Governing law (state)">
          <input
            aria-label="Governing law"
            className={fieldClass}
            value={data.governingLaw}
            onChange={(e) => set({ governingLaw: e.target.value })}
            placeholder="New York"
          />
        </Field>
      </div>

      <Field label="Jurisdiction (city/county and state)">
        <input
          aria-label="Jurisdiction"
          className={fieldClass}
          value={data.jurisdiction}
          onChange={(e) => set({ jurisdiction: e.target.value })}
          placeholder="New Castle, DE"
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {partyFields("party1", "Party 1")}
        {partyFields("party2", "Party 2")}
      </div>
    </form>
  );
}
