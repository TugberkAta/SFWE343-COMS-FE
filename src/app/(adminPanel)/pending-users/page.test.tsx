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

vi.mock("@/hooks/use-permission", () => ({
  usePermission: () => ({
    hasPermission: () => true,
  }),
}));

vi.mock("@/components/PermissionGate", () => ({
  PermissionGate: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/PermissionProtectedPage", () => ({
  PermissionProtectedPage: () => <div>No permission</div>,
}));


import useFetchData from "@/hooks/use-fetch-data";
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

function setupMocks({
  usersLoading = false,
  usersErrored = false,
  usersData = { users: mockUsers },
  rolesLoading = false,
  rolesErrored = false,
  rolesData = { userRoles: mockRoles },
  refetch = vi.fn(),
}: {
  usersLoading?: boolean;
  usersErrored?: boolean;
  usersData?: { users: import("@/types/user-with-no-role").UserWithNoRole[] };
  rolesLoading?: boolean;
  rolesErrored?: boolean;
  rolesData?: { userRoles: import("@/types/user-role").UserRoleRecord[] };
  refetch?: ReturnType<typeof vi.fn>;
} = {}) {
  let callCount = 0;
  vi.mocked(useFetchData).mockImplementation(() => {
    const isUsers = callCount % 2 === 0;
    callCount++;
    if (isUsers) {
      return [usersLoading, usersErrored, usersData, refetch] as const;
    }
    return [rolesLoading, rolesErrored, rolesData, vi.fn()] as const;
  });
  return { refetch };
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

  it("shows loading state for users", () => {
    setupMocks({ usersLoading: true });
    const { container } = render(
      <MemoryRouter>
        <PendingUsersPage />
      </MemoryRouter>,
    );
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("shows error state for users", () => {
    setupMocks({ usersErrored: true });
    const { container } = render(
      <MemoryRouter>
        <PendingUsersPage />
      </MemoryRouter>,
    );
    expect(container.querySelector(".text-destructive")).toBeInTheDocument();
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
    expect(approveButtons).toHaveLength(2);
    expect(rejectButtons).toHaveLength(2);
  });

  it("filters users by search term (email)", async () => {
    const user = userEvent.setup();
    renderPage();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/filter emails or names/i);
    await user.type(searchInput, "john");
    await waitFor(() => {
      expect(screen.queryByText("jane@example.com")).not.toBeInTheDocument();
    });
  });

  it("filters users by search term (name)", async () => {
    const user = userEvent.setup();
    renderPage();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/filter emails or names/i);
    await user.type(searchInput, "Jane");
    await waitFor(() => {
      expect(screen.queryByText("john@example.com")).not.toBeInTheDocument();
    });
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

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/Select a role for John Doe/i)).toBeInTheDocument();
  });

  it("opens reject dialog when reject button is clicked", async () => {
    const user = userEvent.setup();
    renderPage();

    const rejectButton = screen.getAllByRole("button", { name: /reject/i })[0];
    await user.click(rejectButton);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Reject this request?")).toBeInTheDocument();
  });

  it("calls postApproveUser and refetches when user is approved", async () => {
    const user = userEvent.setup();
    const { refetch } = setupMocks();


    vi.mocked(postApproveUser).mockResolvedValueOnce({} as any);

    renderPage();

    const approveButton = screen.getAllByRole("button", { name: /approve/i })[0];
    await user.click(approveButton);

    await screen.findByRole("dialog");

    const confirmButton = screen.getByRole("button", { name: /^confirm$/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(postApproveUser).toHaveBeenCalled();
      expect(refetch).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it("calls postRejectUser and refetches when user is rejected", async () => {
    const user = userEvent.setup();
    const { refetch } = setupMocks();

    vi.mocked(postRejectUser).mockResolvedValueOnce({} as any);

    renderPage();

    const rejectButton = screen.getAllByRole("button", { name: /^reject$/i })[0];
    await user.click(rejectButton);

    await screen.findByRole("dialog");

    const confirmButton = screen.getByRole("button", { name: /reject request/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(postRejectUser).toHaveBeenCalled();
      expect(refetch).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it("shows empty state when no users", () => {
    setupMocks({ usersData: { users: [] } });
    renderPage();
    expect(screen.getByText("No results.")).toBeInTheDocument();
  });

  it("displays formatted date for createdAt", () => {
    renderPage();
    const dateCells = screen.getAllByText(/2024/i);
    expect(dateCells.length).toBeGreaterThan(0);
  });
});