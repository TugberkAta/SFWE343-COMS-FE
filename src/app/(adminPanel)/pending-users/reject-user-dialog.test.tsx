import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RejectUserDialog } from "./reject-user-dialog";

const mockPostRejectUser = vi.hoisted(() => vi.fn());

vi.mock("@/services/users/post-reject-user", () => ({
  default: mockPostRejectUser,
}));

const mockUser: import("@/types/user-with-no-role").UserWithNoRole = {
  userId: 1,
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  createdAt: "2024-01-15T10:00:00Z",
  userRole: null,
};

function renderDialog(props?: Partial<import("./reject-user-dialog").RejectUserDialogProps>) {
  const defaultProps: import("./reject-user-dialog").RejectUserDialogProps = {
    open: true,
    onOpenChange: vi.fn(),
    user: mockUser,
    onRejected: vi.fn(),
    ...props,
  };

  return render(<RejectUserDialog {...defaultProps} />);
}

describe("RejectUserDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the reject user dialog", () => {
    renderDialog();
    expect(screen.getByText("Reject this request?")).toBeInTheDocument();
  });

  it("displays user information (first name, last name)", () => {
    renderDialog();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("displays user email", () => {
    renderDialog();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });

  it("shows the dialog description", () => {
    renderDialog();
    expect(
      screen.getByText(/This removes the user from pending approval/i),
    ).toBeInTheDocument();
  });

  it("has cancel and reject buttons", () => {
    renderDialog();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reject request/i })).toBeInTheDocument();
  });

  it("calls onOpenChange when cancel is clicked", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderDialog({ onOpenChange });

    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("calls postRejectUser and onRejected when form is submitted", async () => {
    const user = userEvent.setup();
    const onRejected = vi.fn();
    mockPostRejectUser.mockResolvedValueOnce(undefined);

    renderDialog({ onRejected });

    await user.click(screen.getByRole("button", { name: /reject request/i }));

    await waitFor(() => {
      expect(mockPostRejectUser).toHaveBeenCalledWith({
        userId: 1,
      });
      expect(onRejected).toHaveBeenCalled();
    });
  });

  it("disables reject button when user is null", () => {
    renderDialog({ user: null });
    const rejectButton = screen.getByRole("button", { name: /reject request/i });
    expect(rejectButton).toBeDisabled();
  });

  it("shows rejecting state when form is submitting", async () => {
    mockPostRejectUser.mockImplementation(() => new Promise(() => {}));
    const onRejected = vi.fn();

    renderDialog({ onRejected });

    await userEvent.click(screen.getByRole("button", { name: /reject request/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /rejecting/i })).toBeInTheDocument();
    });
  });

  it("does not render user info when user is null", () => {
    renderDialog({ user: null });
    expect(screen.queryByText("Name")).not.toBeInTheDocument();
    expect(screen.queryByText("Email")).not.toBeInTheDocument();
  });

  it("renders nothing when dialog is closed", () => {
    renderDialog({ open: false });
    expect(screen.queryByText("Reject this request?")).not.toBeInTheDocument();
  });
});