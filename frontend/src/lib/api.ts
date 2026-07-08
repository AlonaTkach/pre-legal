import { DEFAULT_NDA, NdaData } from "./nda";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type ChatResult = {
  reply: string;
  document_type: string | null;
  fields: Record<string, string>;
  complete: boolean;
};

export type TemplateDoc = { id: string; name: string; markdown: string };

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

export async function fetchTemplate(id: string): Promise<TemplateDoc> {
  const res = await fetch(`${API_BASE}/api/template/${id}`);
  if (!res.ok) throw new Error(`Template request failed: ${res.status}`);
  return res.json();
}

// Map the mutual-NDA field keys the assistant returns onto the structured
// NdaData used by the polished NDA renderer.
export function ndaDataFromFields(f: Record<string, string>): NdaData {
  const get = (k: string) => f[k] ?? "";
  return {
    ...DEFAULT_NDA,
    purpose: get("purpose"),
    effectiveDate: get("effective_date"),
    mndaTermYears: get("mnda_term_years"),
    confidentialityTermYears: get("confidentiality_term_years"),
    governingLaw: get("governing_law"),
    jurisdiction: get("jurisdiction"),
    party1: {
      company: get("party1_company"),
      name: get("party1_name"),
      title: get("party1_title"),
      noticeAddress: get("party1_notice"),
    },
    party2: {
      company: get("party2_company"),
      name: get("party2_name"),
      title: get("party2_title"),
      noticeAddress: get("party2_notice"),
    },
  };
}

// Turn a snake_case field key into a readable label, e.g. party1_company ->
// "Party1 company".
export function humanizeKey(key: string): string {
  const s = key.replace(/_/g, " ").trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}
