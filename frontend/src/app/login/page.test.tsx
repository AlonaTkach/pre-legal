import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "./page";
import * as api from "@/lib/api";

const pushMock = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: pushMock }) }));
jest.mock("@/lib/api", () => {
  const actual = jest.requireActual("@/lib/api");
  return { ...actual, login: jest.fn(), signup: jest.fn() };
});

const mockedLogin = api.login as jest.MockedFunction<typeof api.login>;
const mockedSignup = api.signup as jest.MockedFunction<typeof api.signup>;

describe("LoginPage", () => {
  beforeEach(() => {
    pushMock.mockReset();
    mockedLogin.mockReset();
    mockedSignup.mockReset();
    localStorage.clear();
  });

  it("logs in and stores the session, then navigates home", async () => {
    mockedLogin.mockResolvedValue({ token: "tok123", email: "a@b.com" });
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "a@b.com");
    await user.type(screen.getByLabelText("Password"), "secret1");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() =>
      expect(mockedLogin).toHaveBeenCalledWith("a@b.com", "secret1"),
    );
    expect(localStorage.getItem("prelegal_token")).toBe("tok123");
    expect(pushMock).toHaveBeenCalledWith("/");
  });

  it("switches to sign-up mode and calls signup", async () => {
    mockedSignup.mockResolvedValue({ token: "tok", email: "n@b.com" });
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole("button", { name: /create an account/i }));
    await user.type(screen.getByLabelText("Email"), "n@b.com");
    await user.type(screen.getByLabelText("Password"), "secret1");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() =>
      expect(mockedSignup).toHaveBeenCalledWith("n@b.com", "secret1"),
    );
  });

  it("shows an error when authentication fails", async () => {
    mockedLogin.mockRejectedValue(new Error("Invalid email or password"));
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "a@b.com");
    await user.type(screen.getByLabelText("Password"), "wrongpw");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /invalid email or password/i,
    );
  });
});
