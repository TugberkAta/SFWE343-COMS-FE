import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import { toast } from "sonner";
import EmailAuthPage from "./page";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockEmailAuth = vi.hoisted(() => vi.fn());

vi.mock("@/services/auth/email-auth", () => ({
  default: mockEmailAuth,
}));

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/email-auth"]}>
      <Routes>
        <Route path="/email-auth" element={<EmailAuthPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("EmailAuthPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the verify-email form", () => {
    renderPage();
    expect(screen.getByText(/verify your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("m@example.com")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^sign up$/i }),
    ).toBeInTheDocument();
  });

  it("links to sign-in for existing accounts", () => {
    renderPage();
    const link = screen.getByRole("link", { name: /sign in/i });
    expect(link).toHaveAttribute("href", "/sign-in");
  });

  it("calls emailAuth and shows success toast on submit", async () => {
    const user = userEvent.setup();
    mockEmailAuth.mockResolvedValueOnce(undefined);
    renderPage();

    await user.type(
      screen.getByPlaceholderText("m@example.com"),
      "user@example.com",
    );
    await user.click(screen.getByRole("button", { name: /^sign up$/i }));

    await waitFor(() => {
      expect(mockEmailAuth).toHaveBeenCalledWith({ email: "user@example.com" });
      expect(toast.success).toHaveBeenCalledWith(
        "Check your email for a sign-in link.",
      );
    });
  });

  it("shows a generic error toast when the request fails with a non-Axios error", async () => {
    const user = userEvent.setup();
    mockEmailAuth.mockRejectedValueOnce(new Error("network"));
    renderPage();

    await user.type(
      screen.getByPlaceholderText("m@example.com"),
      "user@example.com",
    );
    await user.click(screen.getByRole("button", { name: /^sign up$/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong");
    });
  });

  it("shows the server message when axios reports an error response", async () => {
    const user = userEvent.setup();
    const err = { response: { data: "Invalid email" } };
    mockEmailAuth.mockRejectedValueOnce(err);
    vi.spyOn(axios, "isAxiosError").mockImplementation((e) => e === err);

    renderPage();

    await user.type(
      screen.getByPlaceholderText("m@example.com"),
      "user@example.com",
    );
    await user.click(screen.getByRole("button", { name: /^sign up$/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid email");
    });

    vi.mocked(axios.isAxiosError).mockRestore();
  });
});
