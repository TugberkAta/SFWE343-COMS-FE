import { render, screen, fireEvent } from "@testing-library/react";
import ProgramsPage from "./page";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import * as fetchHook from "@/hooks/use-fetch-data";
import { vi } from "vitest";
import { BreadcrumbProvider } from "@/contexts/breadcrumb-context";


describe("ProgramsPage UI", () => {
  const mockDepartments = [
    { departmentId: 1, type: "science", name: "Science" },
    { departmentId: 2, type: "arts", name: "Arts" },
  ];
  const mockPrograms = [
    { programId: 10, departmentId: 1, name: "Physics", language: "EN", departmentType: "science", departmentName: "Science" },
    { programId: 11, departmentId: 1, name: "Chemistry", language: "EN", departmentType: "science", departmentName: "Science" },
    { programId: 20, departmentId: 2, name: "History", language: "TR", departmentType: "arts", departmentName: "Arts" },
  ];

  beforeEach(() => {
    vi.spyOn(fetchHook, "default").mockImplementation((fn) => {
      if (fn.name === "getDepartments") return [false, null, { departments: mockDepartments }];
      if (fn.name === "getPrograms") return [false, null, { programs: mockPrograms }];
      return [false, null, {}];
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders only programs for selected department as cards", () => {
    render(
      <BreadcrumbProvider>
        <MemoryRouter initialEntries={["/admin/programs?departmentId=1"]}>
          <Routes>
            <Route path="/admin/programs" element={<ProgramsPage />} />
          </Routes>
        </MemoryRouter>
      </BreadcrumbProvider>
    );
    expect(screen.getByRole("heading", { name: "Physics" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Chemistry" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "History" })).not.toBeInTheDocument();
  });
});
