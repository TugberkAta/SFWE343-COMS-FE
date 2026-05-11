import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PageHeader } from "./app-header";

vi.mock("react-router-dom", () => ({
  useLocation: () => ({ pathname: "/admin/courses" }),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

vi.mock("@/contexts/breadcrumb-context", () => ({
  useBreadcrumb: () => ({
    breadcrumbData: {
      labels: {},
      rules: {},
      searchParams: {},
    },
  }),
}));

vi.mock("@/components/ui/sidebar", () => ({
  SidebarTrigger: () => <button>Toggle Sidebar</button>,
}));

vi.mock("@/components/ui/separator", () => ({
  Separator: () => <hr data-testid="separator" />,
}));

vi.mock("@/constants/routes", () => ({
  isValidRoute: () => true,
}));

vi.mock("@/utils/capitalize", () => ({
  capitalize: (str: string) => str.charAt(0).toUpperCase() + str.slice(1),
}));

describe("PageHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
    expect(screen.getByText("Toggle Sidebar")).toBeInTheDocument();
  });

  it("renders breadcrumb items based on pathname", () => {
    render(<PageHeader />);
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("Courses")).toBeInTheDocument();
  });

  it("renders separator between trigger and breadcrumb", () => {
    render(<PageHeader />);
    expect(screen.getByTestId("separator")).toBeInTheDocument();
  });
});
