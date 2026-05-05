import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PageHeader } from "./app-header";

vi.mock("react-router-dom", () => ({
  useLocation: () => ({ pathname: "/projects/123" }),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

vi.mock("@/contexts/breadcrumb-context", () => ({
  useBreadcrumb: () => ({
    breadcrumbData: { labels: {}, rules: {}, searchParams: {} },
    setBreadcrumbItem: vi.fn(),
    removeBreadcrumbItem: vi.fn(),
    setBreadcrumbRules: vi.fn(),
    clearBreadcrumbData: vi.fn(),
  }),
}));

vi.mock("@/components/ui/sidebar", () => ({
  SidebarTrigger: () => <button>Toggle</button>,
}));

vi.mock("@/components/ui/separator", () => ({
  Separator: () => <hr />,
}));

describe("PageHeader", () => {
  it("renders without crashing", () => {
    render(<PageHeader />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("renders breadcrumb navigation", () => {
    render(<PageHeader />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("shows sidebar trigger button", () => {
    render(<PageHeader />);
    expect(screen.getByText("Toggle")).toBeInTheDocument();
  });
});
