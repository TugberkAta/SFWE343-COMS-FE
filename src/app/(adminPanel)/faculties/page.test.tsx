import { render, screen, fireEvent } from "@testing-library/react";
import FacultiesPage from "./page";
import { MemoryRouter } from "react-router-dom";
import * as fetchHook from "@/hooks/use-fetch-data";
import { vi } from "vitest";
import { BreadcrumbProvider } from "@/contexts/breadcrumb-context";


describe("FacultiesPage UI", () => {
  const mockDepartments = [
    { departmentId: 1, type: "science", name: "Science" },
    { departmentId: 2, type: "arts", name: "Arts" },
  ];

  beforeEach(() => {
    vi.spyOn(fetchHook, "default").mockImplementation(() => [false, null, { departments: mockDepartments }]);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders department cards without progression indicators", () => {
    render(
      <BreadcrumbProvider>
    <MemoryRouter>
      <FacultiesPage />
    </MemoryRouter>
  </BreadcrumbProvider>
    );
   expect(screen.getByRole("heading", { name: "Science" })).toBeInTheDocument();
   expect(screen.getByRole("heading", { name: "Arts" })).toBeInTheDocument();

    // No progression indicators (e.g., no progress bar or stepper)
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });
});
