import { render, screen, within } from "@testing-library/react";
import { DEFAULT_NDA, NdaData } from "@/lib/nda";
import { NdaPreview } from "./NdaPreview";

function make(overrides: Partial<NdaData> = {}): NdaData {
  return { ...DEFAULT_NDA, ...overrides };
}

describe("NdaPreview", () => {
  it("renders the document title and all standard-term clauses", () => {
    render(<NdaPreview data={make()} />);
    expect(
      screen.getByRole("heading", { name: /Mutual Non-Disclosure Agreement/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/1\. Introduction/)).toBeInTheDocument();
    expect(screen.getByText(/11\. General/)).toBeInTheDocument();
  });

  it("shows bracketed placeholders when fields are empty", () => {
    render(<NdaPreview data={make({ governingLaw: "", jurisdiction: "" })} />);
    const preview = screen.getByLabelText("NDA preview");
    expect(within(preview).getAllByText(/\[Governing Law\]/).length).toBeGreaterThan(0);
    expect(within(preview).getAllByText(/\[Jurisdiction\]/).length).toBeGreaterThan(0);
  });

  it("reflects filled-in values live", () => {
    render(
      <NdaPreview
        data={make({
          governingLaw: "New York",
          effectiveDate: "2026-07-08",
          party1: { company: "Bananas Inc.", name: "", title: "", noticeAddress: "" },
        })}
      />,
    );
    const preview = screen.getByLabelText("NDA preview");
    expect(within(preview).getAllByText(/New York/).length).toBeGreaterThan(0);
    expect(within(preview).getAllByText(/July 8, 2026/).length).toBeGreaterThan(0);
    expect(within(preview).getAllByText(/Bananas Inc\./).length).toBeGreaterThan(0);
  });
});
