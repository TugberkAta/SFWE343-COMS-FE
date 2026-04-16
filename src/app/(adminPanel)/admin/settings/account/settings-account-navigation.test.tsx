import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AccountPage from "./page";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock authentication service
const mockGetCurrentUser = vi.fn();
vi.mock("@/services/auth/authentication", () => ({
  __esModule: true,
  default: class {
    getCurrentUser() {
      return mockGetCurrentUser();
    }
  },
}));

// Mock card component
vi.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) => <div className={className} data-testid="card">{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardHeader: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardTitle: ({ children, className }: any) => <h2 className={className}>{children}</h2>,
}));

// Mock avatar component
vi.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children }: { children: React.ReactNode }) => <div data-testid="avatar">{children}</div>,
  AvatarImage: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
  AvatarFallback: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("AccountPage - Settings Account Display", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUser.mockReturnValue({
      firstname: "John",
      lastname: "Doe",
      email: "john.doe@example.com",
    });
  });

  describe("Content Display", () => {
    it("renders Account page with correct heading", () => {
      render(<AccountPage />);
      expect(screen.getByText("Account")).toBeInTheDocument();
    });

    it("renders Account details card title", () => {
      render(<AccountPage />);
      expect(screen.getByText("Account details")).toBeInTheDocument();
    });

    it("displays First Name label", () => {
      render(<AccountPage />);
      expect(screen.getByText("First Name")).toBeInTheDocument();
    });

    it("displays Last Name label", () => {
      render(<AccountPage />);
      expect(screen.getByText("Last Name")).toBeInTheDocument();
    });

    it("displays Email label", () => {
      render(<AccountPage />);
      expect(screen.getByText("Email")).toBeInTheDocument();
    });
  });

  describe("Read-Only Verification", () => {
    it("does not contain any input fields", () => {
      const { container } = render(<AccountPage />);
      const inputs = container.querySelectorAll("input");
      expect(inputs.length).toBe(0);
    });

    it("does not contain any textarea elements", () => {
      const { container } = render(<AccountPage />);
      const textareas = container.querySelectorAll("textarea");
      expect(textareas.length).toBe(0);
    });

    it("does not contain any submit buttons", () => {
      const { container } = render(<AccountPage />);
      const submitButtons = container.querySelectorAll('button[type="submit"]');
      expect(submitButtons.length).toBe(0);
    });

    it("information is displayed as static text (read-only)", () => {
      const { container } = render(<AccountPage />);
      const editableElements = container.querySelectorAll('input, textarea, select, [contenteditable="true"]');
      expect(editableElements.length).toBe(0);
    });
  });

  describe("Styling Verification", () => {
    it("renders labels with muted foreground color", () => {
      render(<AccountPage />);
      const firstNameLabel = screen.getByText("First Name");
      expect(firstNameLabel.className).toContain("text-muted-foreground");
    });

    it("renders card with proper styling", () => {
      render(<AccountPage />);
      const card = screen.getByTestId("card");
      expect(card.className).toContain("border-border");
    });
  });
});
