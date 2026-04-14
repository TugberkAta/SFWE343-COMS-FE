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
const mockRejectUser = vi.fn();

vi.mock("@/services/admin/userApproval", () => ({
  default: {
    fetchPendingUsers: () => mockFetchPendingUsers(),
    approveUser: (userId: string, role: string) => mockApproveUser(userId, role),
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

describe("SignInApproval Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchPendingUsers.mockResolvedValue(mockUsers);
    mockApproveUser.mockResolvedValue(undefined);
    mockRejectUser.mockResolvedValue(undefined);
  });

  it("completes full approval flow", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /accept/i })).toHaveLength(3);
    });

    const acceptButtons = screen.getAllByRole("button", { name: /accept/i });
    await user.click(acceptButtons[0]);

    const dropdown = screen.getByRole("combobox");
    await user.selectOptions(dropdown, "admin");

    const confirmButton = screen.getByRole("button", { name: /confirm/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockApproveUser).toHaveBeenCalledWith("1", "admin");
      expect(toast.success).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.queryByText("john@example.com")).not.toBeInTheDocument();
      expect(screen.getAllByRole("button", { name: /accept/i })).toHaveLength(2);
    });
  });

  it("completes full rejection flow", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /reject/i })).toHaveLength(3);
    });

    const rejectButtons = screen.getAllByRole("button", { name: /reject/i });
    await user.click(rejectButtons[1]);

    const confirmButton = screen.getByRole("button", { name: /confirm/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockRejectUser).toHaveBeenCalledWith("2");
      expect(toast.success).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.queryByText("jane@example.com")).not.toBeInTheDocument();
      expect(screen.getAllByRole("button", { name: /reject/i })).toHaveLength(2);
    });
  });

  it("handles multiple approvals in sequence", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /accept/i })).toHaveLength(3);
    });

    let acceptButtons = screen.getAllByRole("button", { name: /accept/i });
    await user.click(acceptButtons[0]);
    await user.selectOptions(screen.getByRole("combobox"), "admin");
    await user.click(screen.getByRole("button", { name: /confirm/i }));

    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /accept/i })).toHaveLength(2);
    });

    acceptButtons = screen.getAllByRole("button", { name: /accept/i });
    await user.click(acceptButtons[0]);
    await user.selectOptions(screen.getByRole("combobox"), "user");
    await user.click(screen.getByRole("button", { name: /confirm/i }));

    await waitFor(() => {
      expect(mockApproveUser).toHaveBeenCalledTimes(2);
      expect(screen.getAllByRole("button", { name: /accept/i })).toHaveLength(1);
    });
  });

  it("handles mixed approve and reject actions", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /accept/i })).toHaveLength(3);
    });

    const acceptButtons = screen.getAllByRole("button", { name: /accept/i });
    await user.click(acceptButtons[0]);
    await user.selectOptions(screen.getByRole("combobox"), "admin");
    await user.click(screen.getByRole("button", { name: /confirm/i }));

    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /reject/i })).toHaveLength(2);
    });

    const rejectButtons = screen.getAllByRole("button", { name: /reject/i });
    await user.click(rejectButtons[0]);
    await user.click(screen.getByRole("button", { name: /confirm/i }));

    await waitFor(() => {
      expect(mockApproveUser).toHaveBeenCalledTimes(1);
      expect(mockRejectUser).toHaveBeenCalledTimes(1);
      expect(screen.getAllByRole("button", { name: /accept/i })).toHaveLength(1);
    });
  });

  it("shows empty state after processing all users", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /accept/i })).toHaveLength(3);
    });

    for (let i = 0; i < 3; i++) {
      const acceptButtons = screen.getAllByRole("button", { name: /accept/i });
      await user.click(acceptButtons[0]);
      await user.selectOptions(screen.getByRole("combobox"), "user");
      await user.click(screen.getByRole("button", { name: /confirm/i }));

      await waitFor(() => {
        expect(mockApproveUser).toHaveBeenCalledTimes(i + 1);
      });
    }

    await waitFor(() => {
      expect(screen.getByText(/no pending users/i)).toBeInTheDocument();
    });
  });

  it("cancel actions do not affect user list", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /accept/i })).toHaveLength(3);
    });

    const acceptButtons = screen.getAllByRole("button", { name: /accept/i });
    await user.click(acceptButtons[0]);
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    const rejectButtons = screen.getAllByRole("button", { name: /reject/i });
    await user.click(rejectButtons[1]);
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(mockApproveUser).not.toHaveBeenCalled();
    expect(mockRejectUser).not.toHaveBeenCalled();
    expect(screen.getAllByRole("button", { name: /accept/i })).toHaveLength(3);
  });
});
