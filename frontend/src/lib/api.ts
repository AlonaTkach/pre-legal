import { DEFAULT_NDA, NdaData } from "./nda";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type NdaApiFields = {
  purpose?: string | null;
  effective_date?: string | null;
  mnda_term_years?: number | null;
  confidentiality_term_years?: number | null;
  governing_law?: string | null;
  jurisdiction?: string | null;
  party1_company?: string | null;
  party1_name?: string | null;
  party1_title?: string | null;
  party1_notice?: string | null;
  party2_company?: string | null;
  party2_name?: string | null;
  party2_title?: string | null;
  party2_notice?: string | null;
};

export type ChatResult = {
  reply: string;
  fields: NdaApiFields;
  complete: boolean;
};

// Same-origin in Docker (backend serves the frontend). For `npm run dev`, set
// NEXT_PUBLIC_API_BASE=http://localhost:8000.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

export async function sendChat(messages: ChatMessage[]): Promise<ChatResult> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) throw new Error(`Chat request failed: ${res.status}`);
  return res.json();
}

const years = (n: number | null | undefined) =>
  n === null || n === undefined ? "" : String(n);

export function apiFieldsToNdaData(f: NdaApiFields): NdaData {
  return {
    ...DEFAULT_NDA,
    purpose: f.purpose ?? "",
    effectiveDate: f.effective_date ?? "",
    mndaTermYears: years(f.mnda_term_years),
    confidentialityTermYears: years(f.confidentiality_term_years),
    governingLaw: f.governing_law ?? "",
    jurisdiction: f.jurisdiction ?? "",
    party1: {
      company: f.party1_company ?? "",
      name: f.party1_name ?? "",
      title: f.party1_title ?? "",
      noticeAddress: f.party1_notice ?? "",
    },
    party2: {
      company: f.party2_company ?? "",
      name: f.party2_name ?? "",
      title: f.party2_title ?? "",
      noticeAddress: f.party2_notice ?? "",
    },
  };
}
