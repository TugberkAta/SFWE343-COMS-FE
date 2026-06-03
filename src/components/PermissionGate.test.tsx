import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PermissionGate } from "./PermissionGate";

vi.mock("@/hooks/use-permission");

import { usePermission } from "@/hooks/use-permission";

const hasPermissionMock = vi.fn();

function setupPermission(allow: boolean | ((permission: string) => boolean)) {
  hasPermissionMock.mockImplementation(
    typeof allow === "function" ? allow : () => allow
  );
  vi.mocked(usePermission).mockReturnValue({ hasPermission: hasPermissionMock });
}

describe("PermissionGate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children when the user has the permission", () => {
    setupPermission(true);

    render(
      <PermissionGate permission="outlines.READ">
        <span>Protected content</span>
      </PermissionGate>
    );

    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });

  it("does not render children when the user lacks the permission", () => {
    setupPermission(false);

    render(
      <PermissionGate permission="outlines.READ">
        <span>Protected content</span>
      </PermissionGate>
    );

    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("renders the fallback when the user lacks the permission", () => {
    setupPermission(false);

    render(
      <PermissionGate
        permission="outlines.READ"
        fallback={<span>Access denied</span>}
      >
        <span>Protected content</span>
      </PermissionGate>
    );

    expect(screen.getByText("Access denied")).toBeInTheDocument();
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("renders nothing when permission is missing and no fallback is given", () => {
    setupPermission(false);

    const { container } = render(
      <PermissionGate permission="outlines.READ">
        <span>Protected content</span>
      </PermissionGate>
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("passes the given permission string to hasPermission", () => {
    setupPermission(true);

    render(
      <PermissionGate permission="outlines.DELETE">
        <span>Protected content</span>
      </PermissionGate>
    );

    expect(hasPermissionMock).toHaveBeenCalledWith("outlines.DELETE");
  });

  it("does not render the fallback when the user has the permission", () => {
    setupPermission(true);

    render(
      <PermissionGate
        permission="outlines.READ"
        fallback={<span>Access denied</span>}
      >
        <span>Protected content</span>
      </PermissionGate>
    );

    expect(screen.getByText("Protected content")).toBeInTheDocument();
    expect(screen.queryByText("Access denied")).not.toBeInTheDocument();
  });
});