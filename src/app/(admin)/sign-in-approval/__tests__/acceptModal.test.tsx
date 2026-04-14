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
const mockApproveUser = vi.fn();

vi.mock("@/services/admin/userApproval", () => ({
  default: {
    fetchPendingUsers: () => mockFetchPendingUsers(),
    approveUser: (userId: string, role: string) => mockApproveUser(userId, role),
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
];

describe("AcceptModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchPendingUsers.mockResolvedValue(mockUsers);
    mockApproveUser.mockResolvedValue(undefined);
  });

  it("opens modal when accept button clicked", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });

    const acceptButtons = screen.getAllByRole("button", { name: /accept/i });
    await user.click(acceptButtons[0]);

    expect(screen.getByText(/select role/i)).toBeInTheDocument();
  });

  it("displays role dropdown", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });

    const acceptButtons = screen.getAllByRole("button", { name: /accept/i });
    await user.click(acceptButtons[0]);

    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("approves user with selected role", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });

    const acceptButtons = screen.getAllByRole("button", { name: /accept/i });
    await user.click(acceptButtons[0]);

    const dropdown = screen.getByRole("combobox");
    await user.selectOptions(dropdown, "admin");

    const confirmButton = screen.getByRole("button", { name: /confirm/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockApproveUser).toHaveBeenCalledWith("1", "admin");
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Check your email for a sign-in link."
      );
    });
  });

  it("removes user from list after approval", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });

    const acceptButtons = screen.getAllByRole("button", { name: /accept/i });
    await user.click(acceptButtons[0]);

    const dropdown = screen.getByRole("combobox");
    await user.selectOptions(dropdown, "user");

    const confirmButton = screen.getByRole("button", { name: /confirm/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(screen.queryByText("john@example.com")).not.toBeInTheDocument();
    });

    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("closes modal on cancel", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });

    const acceptButtons = screen.getAllByRole("button", { name: /accept/i });
    await user.click(acceptButtons[0]);

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText(/select role/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });

  it("shows error on approval failure", async () => {
    const user = userEvent.setup();
    mockApproveUser.mockRejectedValue(new Error("Network error"));

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });

    const acceptButtons = screen.getAllByRole("button", { name: /accept/i });
    await user.click(acceptButtons[0]);

    const dropdown = screen.getByRole("combobox");
    await user.selectOptions(dropdown, "admin");

    const confirmButton = screen.getByRole("button", { name: /confirm/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong");
    });

    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });
});
