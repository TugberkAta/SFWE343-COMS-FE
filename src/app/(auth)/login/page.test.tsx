import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import { toast } from "sonner";
import LoginPage from "./page";

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

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={<div data-testid="admin-destination">Admin</div>}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the login form", () => {
    renderPage();
    expect(
      screen.getByText("Login", { selector: '[data-slot="card-title"]' }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("m@example.com")).toBeInTheDocument();
    expect(
      document.querySelector('input[name="password"]'),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^login$/i })).toBeInTheDocument();
  });

  it("links to email signup", () => {
    renderPage();
    const link = screen.getByRole("link", { name: /create an account/i });
    expect(link).toHaveAttribute("href", "/email-auth");
  });

  it("logs in, toasts success, and navigates to /admin", async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce(undefined);
    renderPage();

    await user.type(
      screen.getByPlaceholderText("m@example.com"),
      "user@example.com",
    );
    await user.type(
      document.querySelector('input[name="password"]')!,
      "password12",
    );
    await user.click(screen.getByRole("button", { name: /^login$/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "password12",
      });
      expect(toast.success).toHaveBeenCalledWith("You're signed in.");
      expect(screen.getByTestId("admin-destination")).toBeInTheDocument();
    });
  });

  it("shows validation when password is too short", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(
      screen.getByPlaceholderText("m@example.com"),
      "user@example.com",
    );
    await user.type(document.querySelector('input[name="password"]')!, "short");
    await user.click(screen.getByRole("button", { name: /^login$/i }));

    expect(mockLogin).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(
        screen.getByText(/too small:.*8 character/i),
      ).toBeInTheDocument();
    });
  });

  it("shows a generic error toast on non-Axios failure", async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValueOnce(new Error("boom"));
    renderPage();

    await user.type(
      screen.getByPlaceholderText("m@example.com"),
      "user@example.com",
    );
    await user.type(
      document.querySelector('input[name="password"]')!,
      "password12",
    );
    await user.click(screen.getByRole("button", { name: /^login$/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong");
    });
  });

  it("shows axios response data on login error", async () => {
    const user = userEvent.setup();
    const err = { response: { data: "Unauthorized" } };
    mockLogin.mockRejectedValueOnce(err);
    vi.spyOn(axios, "isAxiosError").mockImplementation((e) => e === err);

    renderPage();

    await user.type(
      screen.getByPlaceholderText("m@example.com"),
      "user@example.com",
    );
    await user.type(
      document.querySelector('input[name="password"]')!,
      "password12",
    );
    await user.click(screen.getByRole("button", { name: /^login$/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Unauthorized");
    });

    vi.mocked(axios.isAxiosError).mockRestore();
  });
});
