import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import OutlineReviewPage from "./outline-review-page";

vi.mock("@/hooks/use-fetch-data");

const hasPermissionMock = vi.fn();
vi.mock("@/hooks/use-permission", () => ({
  usePermission: () => ({ hasPermission: hasPermissionMock }),
}));

vi.mock("@/components/PermissionProtectedPage", () => ({
  PermissionProtectedPage: () => <div>Access Denied</div>,
}));

const toastSuccess = vi.fn();
const toastError = vi.fn();
vi.mock("sonner", () => ({
  toast: {
    success: (msg: string) => toastSuccess(msg),
    error: (msg: string) => toastError(msg),
  },
}));


vi.mock("@/components/approval/outline-review-queue", () => ({
  default: ({ outlines, emptyMessage, onReview }: any) => (
    <div data-testid="review-queue">
      <span data-testid="queue-count">{outlines.length}</span>
      <span data-testid="queue-empty-message">{emptyMessage}</span>
      {outlines.map((o: any) => (
        <button
          key={o.outlineId}
          data-testid={`review-${o.outlineId}`}
          onClick={() => onReview(o)}
        >
          Review {o.outlineId}
        </button>
      ))}
    </div>
  ),
}));

vi.mock("@/components/approval/outline-review-dialog", () => ({
  default: ({ open, outline, stage, submitting, onSubmit }: any) => (
    <div data-testid="review-dialog">
      <span data-testid="dialog-open">{String(open)}</span>
      <span data-testid="dialog-stage">{stage}</span>
      <span data-testid="dialog-submitting">{String(submitting)}</span>
      <span data-testid="dialog-outline">{outline?.outlineId ?? "none"}</span>
      <button
        data-testid="dialog-approve"
        onClick={() => onSubmit("approve", "looks good")}
      >
        Approve
      </button>
    </div>
  ),
}));

import useFetchData from "@/hooks/use-fetch-data";

const mockOutlines = [
  { outlineId: 1, courseCode: "CS101" },
  { outlineId: 2, courseCode: "CS102" },
];

const refetchMock = vi.fn();

function setupFetch({
  loading = false,
  errored = false,
  data = { outlines: mockOutlines },
} = {}) {
  vi.mocked(useFetchData).mockReturnValue([loading, errored, data, refetchMock]);
}

const submitReviewMock = vi.fn();
const fetchQueueMock = vi.fn();

const baseProps = {
  title: "Stage 1 Review",
  description: "Outlines awaiting department-level review",
  stage: 1 as const,
  pagePermission: "approval.STAGE1",
  approvePermission: "approval.STAGE1_APPROVE",
  emptyMessage: "No outlines are waiting for stage 1 review.",
  fetchQueue: fetchQueueMock,
  submitReview: submitReviewMock,
  successMessages: {
    approve: "Outline approved and moved to stage 2.",
    request_changes: "Change request sent to the lecturer.",
    reject: "Outline rejected at stage 1.",
  } as any,
};

function renderPage(propsOverride = {}) {
  return render(<OutlineReviewPage {...baseProps} {...propsOverride} />);
}

describe("OutlineReviewPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hasPermissionMock.mockReturnValue(true);
    setupFetch();
  });

  it("renders the protected page when the user lacks page permission", () => {
    hasPermissionMock.mockReturnValue(false);
    renderPage();

    expect(screen.getByText("Access Denied")).toBeInTheDocument();
    expect(screen.queryByTestId("review-queue")).not.toBeInTheDocument();
  });

  it("shows a loading spinner while fetching", () => {
    setupFetch({ loading: true });
    const { container } = renderPage();

    expect(screen.queryByTestId("review-queue")).not.toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("shows an error icon when fetching fails", () => {
    setupFetch({ errored: true });
    const { container } = renderPage();

    expect(screen.queryByTestId("review-queue")).not.toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders title, description, queue and dialog on success", () => {
    renderPage();

    expect(screen.getByText("Stage 1 Review")).toBeInTheDocument();
    expect(
      screen.getByText("Outlines awaiting department-level review")
    ).toBeInTheDocument();
    expect(screen.getByTestId("review-queue")).toBeInTheDocument();
    expect(screen.getByTestId("review-dialog")).toBeInTheDocument();
  });

  it("passes the fetched outlines and empty message to the queue", () => {
    renderPage();

    expect(screen.getByTestId("queue-count")).toHaveTextContent("2");
    expect(screen.getByTestId("queue-empty-message")).toHaveTextContent(
      "No outlines are waiting for stage 1 review."
    );
  });

  it("falls back to an empty list when data has no outlines", () => {
    setupFetch({ data: {} as any });
    renderPage();

    expect(screen.getByTestId("queue-count")).toHaveTextContent("0");
  });

  it("passes the stage down to the dialog", () => {
    renderPage({ stage: 2 });
    expect(screen.getByTestId("dialog-stage")).toHaveTextContent("2");
  });

  it("keeps the dialog closed until an outline is selected", () => {
    renderPage();

    expect(screen.getByTestId("dialog-open")).toHaveTextContent("false");
    expect(screen.getByTestId("dialog-outline")).toHaveTextContent("none");
  });

  it("opens the dialog with the selected outline when review is triggered", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByTestId("review-1"));

    expect(screen.getByTestId("dialog-open")).toHaveTextContent("true");
    expect(screen.getByTestId("dialog-outline")).toHaveTextContent("1");
  });

  it("submits a review and shows the success toast", async () => {
    const user = userEvent.setup();
    submitReviewMock.mockResolvedValueOnce(undefined);
    renderPage();

    await user.click(screen.getByTestId("review-1"));
    await user.click(screen.getByTestId("dialog-approve"));

    await waitFor(() => {
      expect(submitReviewMock).toHaveBeenCalledWith(1, {
        action: "approve",
        commentText: "looks good",
      });
    });

    expect(toastSuccess).toHaveBeenCalledWith(
      "Outline approved and moved to stage 2."
    );
    expect(refetchMock).toHaveBeenCalled();
  });

  it("closes the dialog after a successful submit", async () => {
    const user = userEvent.setup();
    submitReviewMock.mockResolvedValueOnce(undefined);
    renderPage();

    await user.click(screen.getByTestId("review-1"));
    await user.click(screen.getByTestId("dialog-approve"));

    await waitFor(() => {
      expect(screen.getByTestId("dialog-open")).toHaveTextContent("false");
    });
  });

  it("shows an error toast when the submit fails", async () => {
    const user = userEvent.setup();
    submitReviewMock.mockRejectedValueOnce(new Error("network"));
    renderPage();

    await user.click(screen.getByTestId("review-1"));
    await user.click(screen.getByTestId("dialog-approve"));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith(
        "Failed to submit review. Please try again."
      );
    });
  });
});