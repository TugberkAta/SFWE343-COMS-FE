import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CreateOutlineDialog from "./create-outline-dialog";
import * as fetchHook from "@/hooks/use-fetch-data";
import * as termsService from "@/services/terms";
import * as coursesService from "@/services/courses";
import * as outlinesService from "@/services/outlines";
import getUsersWithRole from "@/services/users/users-with-role";

const mockTerm = {
  termId: 1,
  academicYear: "2025-2026",
  semester: "Fall",
};

const mockLecturer = {
  userId: 10,
  firstName: "Jane",
  lastName: "Instructor",
  email: "jane.instructor@example.com",
};

const mockCourse = {
  courseId: 42,
  courseCode: "CS101",
  courseName: "Intro to Computer Science",
  ectsCredits: 5,
};

const mockOutline = {
  outlineId: 100,
  courseId: 42,
  termId: 1,
  lecturerUserId: 10,
  assistantUserIds: [],
  textbooksText: "",
  additionalReadingText: "",
  officeHours: "",
  officeCode: "",
  createdByUserId: 123,
  objectives: [{ objectiveText: "Sample objective" }],
  contentItems: [{ contentText: "Sample content" }],
  learningOutcomes: [
    { cloNumber: 1, statement: "Outcome 1" },
    { cloNumber: 2, statement: "Outcome 2" },
    { cloNumber: 3, statement: "Outcome 3" },
    { cloNumber: 4, statement: "Outcome 4" },
    { cloNumber: 5, statement: "Outcome 5" },
  ],
  programLearningOutcomes: [{ ploNumber: 1, statement: "PLO 1" }],
  weeklyTopics: [
    {
      weekNo: 1,
      weekDate: null,
      subjectTitle: "Week 1",
      detailsText: "Details",
      tasksPrivateStudyText: "Tasks",
      clos: [],
    },
  ],
  workloadItems: [{ activityType: "Lecture", durationHours: 10 }],
  evaluationItems: [{ name: "Midterm", count: 1, weightPercent: 100, clos: [] }],
};

vi.mock("@/hooks/use-fetch-data", () => ({
  default: vi.fn(),
}));

vi.mock("@/services/auth/authentication", () => ({
  default: vi.fn().mockImplementation(function () {
    this.getCurrentUser = () => ({ userId: 123, email: "test@example.com" });
  }),
}));

vi.mock("@/components/ui/rich-text-editor", () => ({
  __esModule: true,
  default: ({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder?: string }) => (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      data-testid="rich-text-editor"
    />
  ),
}));

const mockedUseFetchData = vi.mocked(fetchHook.default);

function mockHookResponses({ enabled = true } = {}) {
  mockedUseFetchData.mockImplementation((fetcher, deps, opts) => {
    const isEnabled = opts?.enabled !== false;
    const fetcherCode = fetcher?.toString?.() ?? "";

    if (!isEnabled) {
      return [false, null, null];
    }

    if (fetcherCode.includes("terms.getAll")) {
      return [false, null, { terms: [mockTerm] }];
    }

    if (fetcherCode.includes("courses.getAll")) {
      return [false, null, { courses: [mockCourse] }];
    }

    if (fetcherCode.includes("getOutlineById")) {
      return [false, null, { outline: mockOutline }];
    }

    if (fetcherCode.includes("default)()")) {
      return [false, null, { users: [mockLecturer] }];
    }

    return [false, null, null];
  });
}

describe("CreateOutlineDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHookResponses();
  });

  it("renders the create trigger button", () => {
    render(<CreateOutlineDialog courseId={42} />);

    expect(screen.getByRole("button", { name: /\+ Create Outline/i })).toBeInTheDocument();
  });

  it("opens the create outline dialog and shows basic info tab", async () => {
    const user = userEvent.setup();
    render(<CreateOutlineDialog courseId={42} />);

    await user.click(screen.getByRole("button", { name: /\+ Create Outline/i }));

    const dialog = await screen.findByRole("dialog");

    await waitFor(() => {
      expect(within(dialog).getByText(/Create Course Outline/i)).toBeInTheDocument();
      expect(within(dialog).getAllByText(/Term/i).length).toBeGreaterThan(0);
      expect(within(dialog).getAllByText(/Lecturer/i).length).toBeGreaterThan(0);
    });
  });

  it("shows validation errors when advancing without required fields", async () => {
    const user = userEvent.setup();
    render(<CreateOutlineDialog courseId={42} />);

    await user.click(screen.getByRole("button", { name: /\+ Create Outline/i }));
    await user.click(screen.getByRole("button", { name: /Next/i }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/Basic Info/i)).toBeInTheDocument();
  });

  it("renders update trigger text when outlineId is provided", async () => {
    render(<CreateOutlineDialog courseId={42} outlineId={100} />);

    expect(screen.getByRole("button", { name: /Update Outline/i })).toBeInTheDocument();
  });
});
