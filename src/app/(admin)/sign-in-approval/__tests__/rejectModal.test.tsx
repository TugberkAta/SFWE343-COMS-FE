import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import SignInApprovalPage from "../page";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockFetchPendingUsers = vi.fn();
const mockRejectUser = vi.fn();

vi.mock("@/services/admin/userApproval", () => ({
  default: {
    fetchPendingUsers: () => mockFetchPendingUsers(),
    rejectUser: (userId: string) => mockRejectUser(userId),
  },
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <SignInApprovalPage />
    </MemoryRouter>
  );
}

const mockUsers = [
  { id: "1", email: "john@example.com", name: "John", surname: "Doe" },
  { id: "2", email: "jane@example.com", name: "Jane", surname: "Smith" },
  { id: "3", email: "bob@example.com", name: "Bob", surname: "Wilson" },
];

describe("RejectModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchPendingUsers.mockResolvedValue(mockUsers);
    mockRejectUser.mockResolvedValue(undefined);
  });

  it("opens modal when reject button clicked", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });

    const rejectButtons = screen.getAllByRole("button", { name: /reject/i });
    await user.click(rejectButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    });
  });

  it("displays user email in modal", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });

    const rejectButtons = screen.getAllByRole("button", { name: /reject/i });
    await user.click(rejectButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      expect(screen.getByText(/do you want to reject/i)).toBeInTheDocument();
    });
  });

  it("rejects user on confirmation", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    });

    const rejectButtons = screen.getAllByRole("button", { name: /reject/i });
    await user.click(rejectButtons[1]);

    await waitFor(() => {
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole("button", { name: /confirm/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockRejectUser).toHaveBeenCalledWith("2");
      expect(screen.queryByText("jane@example.com")).not.toBeInTheDocument();
    });
  });

  it("shows success toast after rejection", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("bob@example.com")).toBeInTheDocument();
    });

    const rejectButtons = screen.getAllByRole("button", { name: /reject/i });
    await user.click(rejectButtons[2]);

    await waitFor(() => {
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole("button", { name: /confirm/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Check your email for a sign-in link."
      );
    });
  });

  it("closes modal on cancel", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });

    const rejectButtons = screen.getAllByRole("button", { name: /reject/i });
    await user.click(rejectButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument();
    });

    expect(mockRejectUser).not.toHaveBeenCalled();
  });

  it("shows error on rejection failure", async () => {
    const user = userEvent.setup();
    mockRejectUser.mockRejectedValue(new Error("Server error"));

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("bob@example.com")).toBeInTheDocument();
    });

    const rejectButtons = screen.getAllByRole("button", { name: /reject/i });
    await user.click(rejectButtons[2]);

    await waitFor(() => {
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole("button", { name: /confirm/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong");
    });
  });
});
