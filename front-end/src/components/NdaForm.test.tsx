import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DEFAULT_NDA, NdaData } from "@/lib/nda";
import { NdaForm } from "./NdaForm";

function Harness({ initial = DEFAULT_NDA }: { initial?: NdaData }) {
  const [data, setData] = useState<NdaData>(initial);
  return (
    <div>
      <NdaForm data={data} onChange={setData} />
      <output data-testid="governing">{data.governingLaw}</output>
      <output data-testid="p1company">{data.party1.company}</output>
    </div>
  );
}

describe("NdaForm", () => {
  it("renders the key cover-page fields", () => {
    render(<NdaForm data={DEFAULT_NDA} onChange={() => {}} />);
    expect(screen.getByLabelText("Purpose")).toBeInTheDocument();
    expect(screen.getByLabelText("Effective date")).toBeInTheDocument();
    expect(screen.getByLabelText("Governing law")).toBeInTheDocument();
    expect(screen.getByLabelText("Jurisdiction")).toBeInTheDocument();
    expect(screen.getByLabelText("Party 1 company")).toBeInTheDocument();
    expect(screen.getByLabelText("Party 2 company")).toBeInTheDocument();
  });

  it("propagates top-level field edits through onChange", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(screen.getByLabelText("Governing law"), "New York");
    expect(screen.getByTestId("governing")).toHaveTextContent("New York");
  });

  it("propagates nested party field edits through onChange", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(screen.getByLabelText("Party 1 company"), "Bananas Inc.");
    expect(screen.getByTestId("p1company")).toHaveTextContent("Bananas Inc.");
  });
});
