import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TeacherOutlinesPage from "./page";

vi.mock("@/hooks/use-fetch-data");
vi.mock("@/services/outlines");
vi.mock("@/hooks/use-permission", () => ({
  usePermission: () => ({ hasPermission: () => true }),
}));
vi.mock("@/components/PermissionGate", () => ({
  PermissionGate: ({ children }: any) => <>{children}</>,
}));
vi.mock("./components/create-outline-dialog", () => ({
  default: ({ courseId, outlineId, trigger }: any) => (
    <button data-testid={`create-outline-${courseId}-${outlineId || "new"}`}>
      {trigger ? "Edit" : "Create Outline"}
    </button>
  ),
}));

import useFetchData from "@/hooks/use-fetch-data";
import { getOutlines, deleteOutlineById, getOutlinePdfById } from "@/services/outlines";

const mockOutlines = [
  {
    outlineId: 1,
    courseCode: "CS101",
    courseName: "Introduction to Computer Science",
    programName: "Computer Science",
    departmentName: "Engineering",
    academicYear: "2023-2024",
    semester: "Fall",
    status: "published" as const,
    programId: 1,
    courseId: 1,
  },
  {
    outlineId: 2,
    courseCode: "CS102",
    courseName: "Data Structures",
    programName: "Computer Science",
    departmentName: "Engineering",
    academicYear: "2023-2024",
    semester: "Spring",
    status: "draft" as const,
    programId: 1,
    courseId: 2,
  },
  {
    outlineId: 3,
    courseCode: "MATH101",
    courseName: "Calculus I",
    programName: "Mathematics",
    departmentName: "Science",
    academicYear: "2023-2024",
    semester: "Fall",
    status: "pending" as const,
    programId: 2,
    courseId: 3,
  },
];

function setupMocks({
  loading = false,
  error = false,
  data = { outlines: mockOutlines },
} = {}) {
  vi.mocked(useFetchData).mockReturnValue([loading, error, data, vi.fn()]);
}

function renderPage() {
  return render(
    <MemoryRouter>
      <TeacherOutlinesPage />
    </MemoryRouter>
  );
}

describe("TeacherOutlinesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it("renders the page with title and description", () => {
    renderPage();
    expect(screen.getByText("Course Outlines")).toBeInTheDocument();
    expect(screen.getByText("Manage your course outlines")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    setupMocks({ loading: true });
    renderPage();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows error state", () => {
    setupMocks({ error: true });
    renderPage();
    expect(screen.getByText("Error loading outlines")).toBeInTheDocument();
  });

  it("displays outlines in the table", () => {
    renderPage();
    expect(screen.getByText("CS101")).toBeInTheDocument();
    expect(screen.getByText("Introduction to Computer Science")).toBeInTheDocument();
    expect(screen.getAllByText("Computer Science").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Engineering").length).toBeGreaterThan(0);
    expect(screen.getAllByText("2023-2024").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Fall").length).toBeGreaterThan(0);
  });

  it("displays status badges correctly", () => {
    renderPage();
    expect(screen.getByText("Published")).toBeInTheDocument();
    expect(screen.getByText("Draft")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("renders the Create Outline button", () => {
    renderPage();
    const createButtons = screen.getAllByTestId(/create-outline/);
    expect(createButtons.length).toBeGreaterThan(0);
  });

  it("renders table with correct rows for outlines", () => {
    renderPage();
    const rows = screen.getAllByRole("row");
    expect(rows.length).toBe(4);
  });

  it("shows edit button only for editable outlines", () => {
    renderPage();
    const editButtons = screen.getAllByTestId(/create-outline-\d+-\d+$/);
    expect(editButtons.length).toBe(1);
  });

  it("renders the card with correct title and description", () => {
    renderPage();
    expect(screen.getByText("My Course Outlines")).toBeInTheDocument();
    expect(screen.getByText("View and manage your outlines")).toBeInTheDocument();
  });

  it("renders table headers correctly", () => {
    renderPage();
    expect(screen.getByText("Course Code")).toBeInTheDocument();
    expect(screen.getByText("Course Name")).toBeInTheDocument();
    expect(screen.getByText("Program")).toBeInTheDocument();
    expect(screen.getByText("Department")).toBeInTheDocument();
    expect(screen.getByText("Academic Year")).toBeInTheDocument();
    expect(screen.getByText("Semester")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("displays all outline codes in table", () => {
    renderPage();
    expect(screen.getByText("CS101")).toBeInTheDocument();
    expect(screen.getByText("CS102")).toBeInTheDocument();
    expect(screen.getByText("MATH101")).toBeInTheDocument();
  });

  it("renders action buttons for each outline", () => {
    renderPage();
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(12);
  });

  it("does not display edit dialog when status is published", () => {
    renderPage();
    const editButtons = screen.queryAllByTestId(/create-outline-1-1/);
    expect(editButtons.length).toBe(0);
  });

  it("displays all three course names", () => {
    renderPage();
    expect(screen.getByText("Introduction to Computer Science")).toBeInTheDocument();
    expect(screen.getByText("Data Structures")).toBeInTheDocument();
    expect(screen.getByText("Calculus I")).toBeInTheDocument();
  });

  it("displays all departments", () => {
    renderPage();
    expect(screen.getAllByText("Engineering").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Science").length).toBeGreaterThan(0);
  });

  it("displays all semesters", () => {
    renderPage();
    const falls = screen.getAllByText("Fall");
    const springs = screen.getAllByText("Spring");
    expect(falls.length).toBeGreaterThan(0);
    expect(springs.length).toBeGreaterThan(0);
  });
});
