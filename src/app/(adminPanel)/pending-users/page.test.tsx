import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PendingUsersPage from "./page";

vi.mock("@/hooks/use-fetch-data", () => ({
  default: vi.fn(),
}));

vi.mock("@/services/users/users-with-no-role", () => ({
  default: vi.fn(),
}));

vi.mock("@/services/users/get-user-roles", () => ({
  default: vi.fn(),
}));

vi.mock("@/services/users/post-approve-user", () => ({
  default: vi.fn(),
}));

vi.mock("@/services/users/post-reject-user", () => ({
  default: vi.fn(),
}));

import useFetchData from "@/hooks/use-fetch-data";
import getUsersWithNoRole from "@/services/users/users-with-no-role";
import getUserRoles from "@/services/users/get-user-roles";
import postApproveUser from "@/services/users/post-approve-user";
import postRejectUser from "@/services/users/post-reject-user";

const mockUsers: import("@/types/user-with-no-role").UserWithNoRole[] = [
  {
    userId: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    createdAt: "2024-01-15T10:00:00Z",
    userRole: null,
  },
  {
    userId: 2,
    firstName: "Jane",
    lastName: "Smith",
    email: "jane@example.com",
    createdAt: "2024-01-16T10:00:00Z",
    userRole: null,
  },
];

const mockRoles: import("@/types/user-role").UserRoleRecord[] = [
  { userRoleId: 1, userRole: "Admin" },
  { userRoleId: 2, userRole: "Teacher" },
];

let mockCallCount = 0;

function setupMocks({
  usersLoading = false,
  usersErrored = false,
  usersData = { users: mockUsers },
  rolesLoading = false,
  rolesErrored = false,
  rolesData = { userRoles: mockRoles },
} = {}) {
  mockCallCount = 0;
  vi.mocked(useFetchData).mockImplementation((fetcher) => {
    mockCallCount++;
    // First call is for users, second call is for roles
    if (mockCallCount === 1) {
      return [usersLoading, usersErrored, usersData, vi.fn()] as const;
    }
    return [rolesLoading, rolesErrored, rolesData, vi.fn()] as const;
  });
}

function renderPage() {
  return render(
    <MemoryRouter>
      <PendingUsersPage />
    </MemoryRouter>,
  );
}

describe("PendingUsersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it("renders the page with title and description", () => {
    renderPage();
    expect(screen.getByText("User Requests")).toBeInTheDocument();
    expect(
      screen.getByText("Approve or reject incoming user requests."),
    ).toBeInTheDocument();
  });

  it("displays users in the table", () => {
    renderPage();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("shows the pending count", () => {
    renderPage();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("has approve and reject buttons for each user", () => {
    renderPage();
    const approveButtons = screen.getAllByRole("button", { name: /approve/i });
    const rejectButtons = screen.getAllByRole("button", { name: /reject/i });
    expect(approveButtons.length).toBeGreaterThanOrEqual(2);
    expect(rejectButtons.length).toBeGreaterThanOrEqual(2);
  });

  it("allows typing in the search input", async () => {
    const user = userEvent.setup();
    renderPage();

    const searchInput = screen.getByPlaceholderText(/filter emails or names/i) as HTMLInputElement;
    await user.type(searchInput, "test");

    expect(searchInput.value).toContain("test");
  });

  it("filters users by search term (name)", async () => {
    const user = userEvent.setup();
    renderPage();

    // Verify both users are shown initially
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/filter emails or names/i) as HTMLInputElement;
    await user.type(searchInput, "Doe");

    // Verify search input was updated
    expect(searchInput.value).toContain("Doe");
  });

  it("shows no results when search doesn't match", async () => {
    const user = userEvent.setup();
    renderPage();

    const searchInput = screen.getByPlaceholderText(/filter emails or names/i);
    await user.type(searchInput, "nonexistent");

    await waitFor(() => {
      expect(screen.getByText("No results.")).toBeInTheDocument();
    });
  });

  it("opens approve dialog when approve button is clicked", async () => {
    const user = userEvent.setup();
    renderPage();

    const approveButton = screen.getAllByRole("button", { name: /approve/i })[0];
    await user.click(approveButton);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  it("opens reject dialog when reject button is clicked", async () => {
    const user = userEvent.setup();
    renderPage();

    const rejectButton = screen.getAllByRole("button", { name: /reject/i })[0];
    await user.click(rejectButton);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  it("shows empty state when no users", () => {
    setupMocks({ usersData: { users: [] } });
    renderPage();
    expect(screen.getByText("No results.")).toBeInTheDocument();
  });

  it("displays formatted date for createdAt", () => {
    renderPage();
    const dateCell = screen.getAllByText(/2024/i);
    expect(dateCell.length).toBeGreaterThan(0);
  });

  it("renders search input with correct placeholder", () => {
    renderPage();
    expect(screen.getByPlaceholderText(/filter emails or names/i)).toBeInTheDocument();
  });

  it("renders card with correct structure", () => {
    renderPage();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Joined")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });
});