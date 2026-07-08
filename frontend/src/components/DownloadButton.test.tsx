import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DownloadButton } from "./DownloadButton";

const toBlob = jest.fn(async () => new Blob(["%PDF-1.4"], { type: "application/pdf" }));

jest.mock("@react-pdf/renderer", () => ({
  pdf: () => ({ toBlob }),
}));

describe("DownloadButton", () => {
  beforeEach(() => {
    toBlob.mockClear();
    Object.defineProperty(URL, "createObjectURL", {
      writable: true,
      value: jest.fn(() => "blob:mock"),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      writable: true,
      value: jest.fn(),
    });
  });

  it("renders a download button", () => {
    render(<DownloadButton document={<div />} fileName="Test" />);
    expect(
      screen.getByRole("button", { name: /download pdf/i }),
    ).toBeInTheDocument();
  });

  it("generates a PDF blob and triggers a download on click", async () => {
    const clickSpy = jest
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    const user = userEvent.setup();
    render(<DownloadButton document={<div />} fileName="Cloud Service Agreement" />);

    await user.click(screen.getByRole("button", { name: /download pdf/i }));

    await waitFor(() => expect(toBlob).toHaveBeenCalledTimes(1));
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    clickSpy.mockRestore();
  });
});
