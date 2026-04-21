import { render, screen, waitFor } from "@testing-library/react";
import TeacherOutlinesPage from "./page";
import * as fetchHook from "@/hooks/use-fetch-data";
import { vi } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { BreadcrumbProvider } from "@/contexts/breadcrumb-context";

const mockOutlines = [
  {
    outlineId: 1,
    courseCode: "CS101",
    courseName: "Intro to CS",
    programName: "Computer Science",
    programId: 10,
    departmentName: "Engineering",
    academicYear: "2025-2026",
    semester: "Fall",
    status: "published",
  },
  {
    outlineId: 2,
    courseCode: "CS102",
    courseName: "Data Structures",
    programName: "Computer Science",
    programId: 11,
    departmentName: "Engineering",
    academicYear: "2025-2026",
    semester: "Spring",
    status: "pending",
  },
  {
    outlineId: 3,
    courseCode: "HIST101",
    courseName: "World History",
    programName: "History",
    programId: 20,
    departmentName: "Arts",
    academicYear: "2025-2026",
    semester: "Fall",
    status: "draft",
  },
];

describe("TeacherOutlinesPage UI", () => {
  beforeEach(() => {
    vi.spyOn(fetchHook, "default").mockImplementation(() => [false, null, { outlines: mockOutlines }]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders table headers", async () => {
    render(
      <MemoryRouter>
        <TeacherOutlinesPage />
      </MemoryRouter>
    );
    expect(screen.getByText(/Course Code/i)).toBeInTheDocument();
    expect(screen.getByText(/Course Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Program/i)).toBeInTheDocument();
    expect(screen.getByText(/Department/i)).toBeInTheDocument();
    expect(screen.getByText(/Academic Year/i)).toBeInTheDocument();
    expect(screen.getByText(/Semester/i)).toBeInTheDocument();
    expect(screen.getByText(/Status/i)).toBeInTheDocument();
    expect(screen.getByText(/Actions/i)).toBeInTheDocument();
  });

  it("renders outlines data", async () => {
    render(
      <MemoryRouter>
        <TeacherOutlinesPage />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText("CS101")).toBeInTheDocument();
      expect(screen.getByText("Intro to CS")).toBeInTheDocument();
      // There are two outlines with 'Computer Science', so check both
      expect(screen.getAllByText("Computer Science").length).toBe(2);
      expect(screen.getAllByText("Engineering").length).toBe(2);
      expect(screen.getAllByText("2025-2026").length).toBe(3);
     expect(screen.getAllByText("Fall")[0]).toBeInTheDocument();
      expect(screen.getByText("Published")).toBeInTheDocument();
    });
  });

  it("shows loading state", () => {
    vi.spyOn(fetchHook, "default").mockImplementation(() => [true, null, null]);
    render(
      <MemoryRouter>
        <TeacherOutlinesPage />
      </MemoryRouter>
    );
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it("shows error state", () => {
    vi.spyOn(fetchHook, "default").mockImplementation(() => [false, "error", null]);
    render(
      <MemoryRouter>
        <TeacherOutlinesPage />
      </MemoryRouter>
    );
    expect(screen.getByText(/Error loading outlines/i)).toBeInTheDocument();
  });
    it("filters outlines after department and program selection", async () => {
    render(
         <BreadcrumbProvider>
      <MemoryRouter initialEntries={["/admin/teacher-outlines?departmentId=1&programId=10"]}>
        <Routes>
          <Route path="/admin/teacher-outlines" element={<TeacherOutlinesPage />} />
        </Routes>
      </MemoryRouter>
      </BreadcrumbProvider>
    );
    await waitFor(() => {
      // Only outlines with programId 10 (Physics) should be shown
      expect(screen.getByText("CS101")).toBeInTheDocument();
      expect(screen.queryByText("CS102")).not.toBeInTheDocument();
      expect(screen.queryByText("HIST101")).not.toBeInTheDocument();
    });
  });

  it("shows only outlines matching selected program", async () => {
    render(
         <BreadcrumbProvider>
      <MemoryRouter initialEntries={["/admin/teacher-outlines?departmentId=1&programId=11"]}>
        <Routes>
          <Route path="/admin/teacher-outlines" element={<TeacherOutlinesPage />} />
        </Routes>
      </MemoryRouter>
      </BreadcrumbProvider>
    );
    await waitFor(() => {
      expect(screen.getByText("CS102")).toBeInTheDocument();
      expect(screen.queryByText("CS101")).not.toBeInTheDocument();
      expect(screen.queryByText("HIST101")).not.toBeInTheDocument();
    });
  });
});
