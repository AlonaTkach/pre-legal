import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "./page";
import * as api from "@/lib/api";

jest.mock("@react-pdf/renderer", () => ({
  pdf: () => ({ toBlob: async () => new Blob() }),
}));
jest.mock("@/components/NdaPdfDocument", () => ({
  NdaPdfDocument: () => null,
}));
jest.mock("@/lib/api", () => {
  const actual = jest.requireActual("@/lib/api");
  return { ...actual, sendChat: jest.fn() };
});

const mockedSendChat = api.sendChat as jest.MockedFunction<typeof api.sendChat>;

describe("Home page", () => {
  beforeEach(() => mockedSendChat.mockReset());

  it("shows the assistant chat and the preview side by side", () => {
    render(<Home />);
    expect(screen.getByLabelText("Assistant chat")).toBeInTheDocument();
    expect(screen.getByLabelText("Live document preview")).toBeInTheDocument();
  });

  it("hides the download button until the document is complete", () => {
    render(<Home />);
    expect(
      screen.queryByRole("button", { name: /download pdf/i }),
    ).not.toBeInTheDocument();
  });

  it("shows placeholders in the preview before any field is filled", () => {
    render(<Home />);
    const preview = screen.getByLabelText("NDA preview");
    expect(
      within(preview).getAllByText(/\[Governing Law\]/).length,
    ).toBeGreaterThan(0);
  });

  it("updates the preview from chat and reveals download when complete", async () => {
    mockedSendChat.mockResolvedValue({
      reply: "Your MNDA is ready to download.",
      fields: { governing_law: "New York" },
      complete: true,
    });
    const user = userEvent.setup();
    render(<Home />);

    await user.type(screen.getByLabelText("Message"), "finalize it");
    await user.click(screen.getByRole("button", { name: /send/i }));

    const preview = await screen.findByLabelText("NDA preview");
    await waitFor(() =>
      expect(within(preview).getAllByText(/New York/).length).toBeGreaterThan(0),
    );
    expect(
      screen.getByRole("button", { name: /download pdf/i }),
    ).toBeInTheDocument();
  });
});
