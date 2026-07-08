import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DEFAULT_NDA, NdaData } from "@/lib/nda";
import { NdaChat } from "./NdaChat";
import * as api from "@/lib/api";

jest.mock("@/lib/api", () => {
  const actual = jest.requireActual("@/lib/api");
  return { ...actual, sendChat: jest.fn() };
});

const mockedSendChat = api.sendChat as jest.MockedFunction<typeof api.sendChat>;

function Harness() {
  const [data, setData] = useState<NdaData>(DEFAULT_NDA);
  const [complete, setComplete] = useState(false);
  return (
    <div>
      <NdaChat onFieldsChange={setData} onComplete={setComplete} />
      <output data-testid="gov">{data.governingLaw}</output>
      <output data-testid="complete">{complete ? "yes" : "no"}</output>
    </div>
  );
}

describe("NdaChat", () => {
  beforeEach(() => mockedSendChat.mockReset());

  it("shows the greeting on mount", () => {
    render(<Harness />);
    expect(screen.getByText(/help you draft a mutual NDA/i)).toBeInTheDocument();
  });

  it("sends a message, shows the reply, and lifts extracted fields", async () => {
    mockedSendChat.mockResolvedValue({
      reply: "Got it. What's the effective date?",
      fields: { governing_law: "New York" },
      complete: false,
    });
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByLabelText("Message"), "Evaluate a partnership");
    await user.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() =>
      expect(screen.getByText(/what's the effective date/i)).toBeInTheDocument(),
    );
    expect(mockedSendChat).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("gov")).toHaveTextContent("New York");
    expect(screen.getByTestId("complete")).toHaveTextContent("no");
  });

  it("marks complete when the backend says so", async () => {
    mockedSendChat.mockResolvedValue({
      reply: "Your MNDA is ready to download.",
      fields: { governing_law: "New York" },
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
