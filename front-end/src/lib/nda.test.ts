import {
  DEFAULT_NDA,
  NdaData,
  STANDARD_TERMS,
  derive,
  fillClause,
  filledTerms,
  formatDate,
  partyLabel,
} from "./nda";

function make(overrides: Partial<NdaData> = {}): NdaData {
  return { ...DEFAULT_NDA, ...overrides };
}

describe("formatDate", () => {
  it("formats an ISO date to a human-readable string", () => {
    expect(formatDate("2026-07-08")).toBe("July 8, 2026");
  });

  it("returns empty string for empty or malformed input", () => {
    expect(formatDate("")).toBe("");
    expect(formatDate("not-a-date")).toBe("");
  });
});

describe("derive", () => {
  it("uses bracketed placeholders when fields are empty", () => {
    const d = derive(make({ purpose: "", governingLaw: "", jurisdiction: "", effectiveDate: "", mndaTermYears: "", confidentialityTermYears: "" }));
    expect(d.purpose).toBe("[Purpose]");
    expect(d.effectiveDate).toBe("[Effective Date]");
    expect(d.mndaTerm).toBe("[MNDA Term]");
    expect(d.confidentialityTerm).toBe("[Term of Confidentiality]");
    expect(d.governingLaw).toBe("[Governing Law]");
    expect(d.jurisdiction).toBe("[Jurisdiction]");
  });

  it("renders singular vs plural years correctly", () => {
    expect(derive(make({ mndaTermYears: "1" })).mndaTerm).toBe("1 year from the Effective Date");
    expect(derive(make({ mndaTermYears: "3" })).mndaTerm).toBe("3 years from the Effective Date");
  });

  it("treats zero or negative years as unset", () => {
    expect(derive(make({ mndaTermYears: "0" })).mndaTerm).toBe("[MNDA Term]");
    expect(derive(make({ confidentialityTermYears: "-2" })).confidentialityTerm).toBe("[Term of Confidentiality]");
  });

  it("passes real values through", () => {
    const d = derive(make({ governingLaw: "New York", jurisdiction: "New Castle, DE" }));
    expect(d.governingLaw).toBe("New York");
    expect(d.jurisdiction).toBe("New Castle, DE");
  });
});

describe("fillClause", () => {
  it("substitutes every placeholder token", () => {
    const d = derive(make({ purpose: "Testing", governingLaw: "California", jurisdiction: "SF, CA" }));
    const filled = fillClause(
      "Use for [[PURPOSE]] governed by [[GOVERNING_LAW]] in [[JURISDICTION]].",
      d,
    );
    expect(filled).toBe("Use for Testing governed by California in SF, CA.");
    expect(filled).not.toContain("[[");
  });
});

describe("filledTerms", () => {
  it("returns all standard-term clauses with no leftover tokens", () => {
    const terms = filledTerms(make({ purpose: "X", governingLaw: "NY", jurisdiction: "NYC", effectiveDate: "2026-01-01" }));
    expect(terms).toHaveLength(STANDARD_TERMS.length);
    for (const c of terms) {
      expect(c.body).not.toContain("[[");
    }
  });
});

describe("partyLabel", () => {
  it("uses the company name when present, else the fallback", () => {
    expect(partyLabel({ company: "Acme", name: "", title: "", noticeAddress: "" }, "Party 1")).toBe("Acme");
    expect(partyLabel({ company: "   ", name: "", title: "", noticeAddress: "" }, "Party 2")).toBe("Party 2");
  });
});
