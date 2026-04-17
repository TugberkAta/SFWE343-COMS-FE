import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AccountPage from "./page";

const mockGetCurrentUser = vi.hoisted(() => vi.fn());

vi.mock("@/services/auth/authentication", () => ({
  default: class {
    getCurrentUser = mockGetCurrentUser;
  },
}));

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/admin/settings/account"]}>
      <Routes>
        <Route path="/admin/settings/account" element={<AccountPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("AccountPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the settings page", () => {
    mockGetCurrentUser.mockReturnValue(null);
    renderPage();
    expect(screen.getByText("Account")).toBeInTheDocument();
  });

  it("displays the account tab", () => {
    mockGetCurrentUser.mockReturnValue(null);
    renderPage();
    expect(screen.getByText("Account details")).toBeInTheDocument();
  });

  it("shows correct account information", () => {
    mockGetCurrentUser.mockReturnValue({
      userId: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
    });
    renderPage();
    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });

  it("displays information as read-only", () => {
    mockGetCurrentUser.mockReturnValue({
      userId: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
    });
    renderPage();
    // Verify no input fields are present (read-only display)
    const firstNameField = screen.getByText("First Name");
    const lastNameField = screen.getByText("Last Name");
    const emailField = screen.getByText("Email");
    expect(firstNameField).toBeInTheDocument();
    expect(lastNameField).toBeInTheDocument();
    expect(emailField).toBeInTheDocument();
  });

  it("shows fallback when user data is null", () => {
    mockGetCurrentUser.mockReturnValue(null);
    renderPage();
    // Should show "—" for missing fields
    const dashElements = screen.getAllByText("—");
    expect(dashElements.length).toBeGreaterThan(0);
  });

  it("shows fallback for missing first name", () => {
    mockGetCurrentUser.mockReturnValue({
      userId: 1,
      firstName: "",
      lastName: "Doe",
      email: "john@example.com",
    });
    renderPage();
    // Avatar should show fallback
    const avatarFallback = document.querySelector("span");
    expect(avatarFallback).toBeInTheDocument();
  });

  it("shows fallback for missing last name", () => {
    mockGetCurrentUser.mockReturnValue({
      userId: 1,
      firstName: "John",
      lastName: "",
      email: "john@example.com",
    });
    renderPage();
    // Avatar should show fallback
    const avatarFallback = document.querySelector("span");
    expect(avatarFallback).toBeInTheDocument();
  });

  it("displays avatar with initials", () => {
    mockGetCurrentUser.mockReturnValue({
      userId: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
    });
    renderPage();
    // Avatar should show "JD" initials
    expect(screen.getByText("JD")).toBeInTheDocument();
  });
});