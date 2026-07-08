import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatPanel } from "./ChatPanel";
import * as api from "@/lib/api";

jest.mock("@/lib/api", () => {
  const actual = jest.requireActual("@/lib/api");
  return { ...actual, sendChat: jest.fn() };
});

const mockedSendChat = api.sendChat as jest.MockedFunction<typeof api.sendChat>;

function Harness() {
  const [result, setResult] = useState<api.ChatResult | null>(null);
  return (
    <div>
      <ChatPanel onResult={setResult} />
      <output data-testid="doctype">{result?.document_type ?? ""}</output>
      <output data-testid="gov">{result?.fields.governing_law ?? ""}</output>
      <output data-testid="complete">{result?.complete ? "yes" : "no"}</output>
    </div>
  );
}

describe("ChatPanel", () => {
  beforeEach(() => mockedSendChat.mockReset());

  it("shows the greeting on mount", () => {
    render(<Harness />);
    expect(
      screen.getByText(/help you draft a legal agreement/i),
    ).toBeInTheDocument();
  });

  it("sends a message, shows the reply, and lifts the chat result", async () => {
    mockedSendChat.mockResolvedValue({
      reply: "Got it. What's the effective date?",
      document_type: "mutual-nda",
      fields: { governing_law: "New York" },
      complete: false,
    });
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByLabelText("Message"), "I need a mutual NDA");
    await user.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() =>
      expect(screen.getByText(/what's the effective date/i)).toBeInTheDocument(),
    );
    expect(mockedSendChat).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("doctype")).toHaveTextContent("mutual-nda");
    expect(screen.getByTestId("gov")).toHaveTextContent("New York");
    expect(screen.getByTestId("complete")).toHaveTextContent("no");
  });

  it("marks complete when the backend says so", async () => {
    mockedSendChat.mockResolvedValue({
      reply: "Your document is ready to download.",
      document_type: "mutual-nda",
      fields: {},
      complete: true,
    });
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByLabelText("Message"), "finalize");
    await user.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() =>
      expect(screen.getByTestId("complete")).toHaveTextContent("yes"),
    );
  });
});
