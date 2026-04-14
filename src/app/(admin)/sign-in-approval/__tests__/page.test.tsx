import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SignInApprovalPage from "../page";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockFetchPendingUsers = vi.fn();

vi.mock("@/services/admin/userApproval", () => ({
  default: {
    fetchPendingUsers: () => mockFetchPendingUsers(),
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

describe("SignInApprovalPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchPendingUsers.mockResolvedValue(mockUsers);
  });

  it("renders the page title", async () => {
    renderPage();
    expect(await screen.findByText(/sign in approval/i)).toBeInTheDocument();
  });

  it("fetches and displays pending users in table", async () => {
    renderPage();

    await waitFor(() => {
      expect(mockFetchPendingUsers).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    expect(screen.getByText("bob@example.com")).toBeInTheDocument();
  });

  it("displays table headers", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    const headers = screen.getAllByRole("columnheader");
    expect(headers.length).toBeGreaterThan(0);
  });

  it("shows accept and reject buttons for each user", async () => {
    renderPage();

    await waitFor(() => {
      const acceptButtons = screen.getAllByRole("button", { name: /accept/i });
      const rejectButtons = screen.getAllByRole("button", { name: /reject/i });

      expect(acceptButtons).toHaveLength(3);
      expect(rejectButtons).toHaveLength(3);
    });
  });

  it("shows empty state when no pending users", async () => {
    mockFetchPendingUsers.mockResolvedValue([]);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/no pending users/i)).toBeInTheDocument();
    });
  });

  it("handles fetch error", async () => {
    mockFetchPendingUsers.mockRejectedValue(new Error("Network error"));

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
  });
});
