import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "./page";

jest.mock("@react-pdf/renderer", () => ({
  pdf: () => ({ toBlob: async () => new Blob() }),
}));
jest.mock("@/components/NdaPdfDocument", () => ({
  NdaPdfDocument: () => null,
}));

describe("Home page", () => {
  it("renders both the form and the preview side by side", () => {
    render(<Home />);
    expect(screen.getByLabelText("NDA details form")).toBeInTheDocument();
    expect(screen.getByLabelText("Live document preview")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /download pdf/i })).toBeInTheDocument();
  });

  it("updates the preview live as the user edits the form", async () => {
    const user = userEvent.setup();
    render(<Home />);

    const govInput = screen.getByLabelText("Governing law");
    await user.type(govInput, "New York");

    const preview = screen.getByLabelText("NDA preview");
    expect(within(preview).getAllByText(/New York/).length).toBeGreaterThan(0);
  });

  it("shows a placeholder in the preview before a field is filled", () => {
    render(<Home />);
    const preview = screen.getByLabelText("NDA preview");
    expect(within(preview).getAllByText(/\[Governing Law\]/).length).toBeGreaterThan(0);
  });
});
