import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "./page";
import * as api from "@/lib/api";

jest.mock("@react-pdf/renderer", () => ({
  pdf: () => ({ toBlob: async () => new Blob() }),
}));
jest.mock("@/components/NdaPdfDocument", () => ({ NdaPdfDocument: () => null }));
jest.mock("@/components/DocumentPdfDocument", () => ({
  DocumentPdfDocument: () => null,
}));
jest.mock("@/lib/api", () => {
  const actual = jest.requireActual("@/lib/api");
  return { ...actual, sendChat: jest.fn(), fetchTemplate: jest.fn() };
});

const mockedSendChat = api.sendChat as jest.MockedFunction<typeof api.sendChat>;
const mockedFetchTemplate = api.fetchTemplate as jest.MockedFunction<
  typeof api.fetchTemplate
>;

async function answer(text: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Message"), text);
  await user.click(screen.getByRole("button", { name: /send/i }));
}

describe("Home page", () => {
  beforeEach(() => {
    mockedSendChat.mockReset();
    mockedFetchTemplate.mockReset();
  });

  it("shows the assistant chat and the preview side by side", () => {
    render(<Home />);
    expect(screen.getByLabelText("Assistant chat")).toBeInTheDocument();
    expect(screen.getByLabelText("Live document preview")).toBeInTheDocument();
  });

  it("shows an empty-state preview and no download before any document", () => {
    render(<Home />);
    expect(screen.getByText(/your document will appear here/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /download pdf/i }),
    ).not.toBeInTheDocument();
  });

  it("renders the NDA preview and download for a completed mutual NDA", async () => {
    mockedSendChat.mockResolvedValue({
      reply: "Your MNDA is ready to download.",
      document_type: "mutual-nda",
      fields: { governing_law: "New York" },
      complete: true,
    });
    render(<Home />);
    await answer("finalize it");

    const preview = await screen.findByLabelText("NDA preview");
    await waitFor(() =>
      expect(within(preview).getAllByText(/New York/).length).toBeGreaterThan(0),
    );
    expect(
      screen.getByRole("button", { name: /download pdf/i }),
    ).toBeInTheDocument();
    expect(mockedFetchTemplate).not.toHaveBeenCalled();
  });

  it("fetches and renders a generic document template", async () => {
    mockedSendChat.mockResolvedValue({
      reply: "Your agreement is ready to download.",
      document_type: "cloud-service-agreement",
      fields: { provider_company: "Acme Cloud" },
      complete: true,
    });
    mockedFetchTemplate.mockResolvedValue({
      id: "cloud-service-agreement",
      name: "Cloud Service Agreement",
      markdown: "# Cloud Service Agreement\n\nSome standard terms here.",
    });
    render(<Home />);
    await answer("I want a cloud service agreement");

    const preview = await screen.findByLabelText("Document preview");
    expect(
      within(preview).getByRole("heading", { name: /Cloud Service Agreement/i }),
    ).toBeInTheDocument();
    expect(within(preview).getByText(/Acme Cloud/)).toBeInTheDocument();
    await waitFor(() =>
      expect(mockedFetchTemplate).toHaveBeenCalledWith("cloud-service-agreement"),
    );
    expect(
      screen.getByRole("button", { name: /download pdf/i }),
    ).toBeInTheDocument();
  });
});
