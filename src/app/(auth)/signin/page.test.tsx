import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import { toast } from "sonner";
import SignInPage from "./page";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockLogin = vi.hoisted(() => vi.fn());
const mockRegister = vi.hoisted(() => vi.fn());

vi.mock("@/services/auth/authentication", () => ({
  default: class {
    login = mockLogin;
    register = mockRegister;
  },
}));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/sign-in" element={<SignInPage />} />
        <Route
          path="/admin"
          element={<div data-testid="admin-destination">Admin</div>}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("SignInPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the embedded login flow when shortcode and email are missing", () => {
    renderAt("/sign-in");
    expect(
      screen.getByText("Login", { selector: '[data-slot="card-title"]' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /create an account/i }),
    ).toBeInTheDocument();
  });

  it("renders the magic-link registration form when query params are present", () => {
    const email = "invite@example.com";
    renderAt(
      `/sign-in?shortcode=abc123&email=${encodeURIComponent(email)}`,
    );

    expect(
      screen.getByText("Sign in", { selector: '[data-slot="card-title"]' }),
    ).toBeInTheDocument();
    expect(document.getElementById("firstName")).toBeTruthy();
    expect(document.getElementById("lastName")).toBeTruthy();
    const emailInput = document.getElementById("email") as HTMLInputElement;
    expect(emailInput).toBeTruthy();
    expect(emailInput).toBeDisabled();
    expect(emailInput).toHaveValue(email);
    expect(
      screen.getByRole("link", { name: /start over/i }),
    ).toHaveAttribute("href", "/email-auth");
  });

  it("completes magic-link sign-in and navigates to /admin", async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValueOnce(undefined);
    const email = "invite@example.com";
    renderAt(
      `/sign-in?shortcode=short-1&email=${encodeURIComponent(email)}`,
    );

    await user.type(document.getElementById("firstName")!, "Ada");
    await user.type(document.getElementById("lastName")!, "Lovelace");
    await user.type(document.getElementById("password")!, "password12");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        firstName: "Ada",
        lastName: "Lovelace",
        email,
        password: "password12",
        shortcode: "short-1",
      });
      expect(toast.success).toHaveBeenCalledWith("You're signed in.");
      expect(screen.getByTestId("admin-destination")).toBeInTheDocument();
    });
  });

  it("shows the magic-link-specific error message on non-Axios failure", async () => {
    const user = userEvent.setup();
    mockRegister.mockRejectedValueOnce(new Error("fail"));
    const email = "invite@example.com";
    renderAt(
      `/sign-in?shortcode=sc&email=${encodeURIComponent(email)}`,
    );

    await user.type(document.getElementById("firstName")!, "Ada");
    await user.type(document.getElementById("lastName")!, "Lovelace");
    await user.type(document.getElementById("password")!, "password12");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "An error occurred while signing in.",
      );
    });
  });

  it("surfaces axios error data from register", async () => {
    const user = userEvent.setup();
    const err = { response: { data: "Code expired" } };
    mockRegister.mockRejectedValueOnce(err);
    vi.spyOn(axios, "isAxiosError").mockImplementation((e) => e === err);
    const email = "invite@example.com";
    renderAt(
      `/sign-in?shortcode=sc&email=${encodeURIComponent(email)}`,
    );

    await user.type(document.getElementById("firstName")!, "Ada");
    await user.type(document.getElementById("lastName")!, "Lovelace");
    await user.type(document.getElementById("password")!, "password12");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Code expired");
    });

    vi.mocked(axios.isAxiosError).mockRestore();
  });
});
