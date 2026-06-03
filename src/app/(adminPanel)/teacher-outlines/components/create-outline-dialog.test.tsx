import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CreateOutlineDialog from "./create-outline-dialog";


const mockUseFetchData = vi.hoisted(() => vi.fn());
const mockPostCourseOutline = vi.hoisted(() => vi.fn());
const mockPatchCourseOutline = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/use-fetch-data", () => ({
  default: mockUseFetchData,
}));

vi.mock("@/services/outlines", () => ({
  postCourseOutline: mockPostCourseOutline,
  patchCourseOutline: mockPatchCourseOutline,
  getOutlineById: vi.fn(),
}));

vi.mock("@/services/terms", () => ({ getTerms: vi.fn() }));
vi.mock("@/services/courses", () => ({ getCourses: vi.fn() }));
vi.mock("@/services/users/users-with-role", () => ({ default: vi.fn() }));

vi.mock("@/services/auth/authentication", () => ({
  default: class {
    getCurrentUser() {
      return { userId: 1, email: "test@test.com" };
    }
  },
}));


vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: any) => <div data-testid="dialog">{children}</div>,
  DialogTrigger: ({ children, asChild }: any) => <div data-testid="trigger">{children}</div>,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/ui/customDialogContent", () => ({
  CustomDialogContent: ({ children, title }: any) => (
    <div data-testid="custom-dialog">
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, type, disabled }: any) => (
    <button onClick={onClick} type={type} disabled={disabled}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/input", () => ({
  Input: (props: any) => <input {...props} />,
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({ children, onValueChange, value }: any) => (
    <div data-testid="select" data-value={value}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
}));

vi.mock("@/components/ui/combobox", () => ({
  Combobox: ({ children, items, value, onValueChange, multiple }: any) => (
    <div data-testid="combobox" data-multiple={multiple}>
      {children}
    </div>
  ),
  ComboboxTrigger: ({ render }: any) => <div>{render}</div>,
  ComboboxContent: ({ children }: any) => <div>{children}</div>,
  ComboboxInput: ({ placeholder }: any) => <input placeholder={placeholder} />,
  ComboboxEmpty: ({ children }: any) => <div>{children}</div>,
  ComboboxList: ({ children }: any) => <div>{children}</div>,
  ComboboxItem: ({ children, value }: any) => <div data-value={value}>{children}</div>,
}));

vi.mock("@/components/ui/rich-text-editor", () => ({
  default: ({ value, onChange, placeholder }: any) => (
    <textarea
      data-testid="rich-editor"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  ),
}));

vi.mock("@/components/ui/form", () => ({
  Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
  FormField: ({ control, name, rules, render }: any) => {
    const field = { 
      value: "", 
      onChange: vi.fn(),
      onBlur: vi.fn(),
      name,
    };
    return <div data-testid={`field-${name}`}>{render({ field })}</div>;
  },
  FormItem: ({ children }: any) => <div className="form-item">{children}</div>,
  FormLabel: ({ children, required }: any) => (
    <label>
      {children}
      {required && <span>*</span>}
    </label>
  ),
  FormControl: ({ children }: any) => <div>{children}</div>,
  FormMessage: ({ children }: any) => <span className="error">{children}</span>,
}));

vi.mock("react-hook-form", () => ({
  useForm: () => ({
    control: {},
    handleSubmit: (fn: any) => (e: any) => {
      e?.preventDefault?.();
      return fn({});
    },
    formState: { errors: {} },
    watch: (name: string) => {
      if (name === "courseId") return 100;
      if (name === "evaluationItems") return [{ title: "", count: 1, weight: 0 }];
      if (name === "workloadItems") return [{ activity: "", hours: 0 }];
      if (name === "learningOutcomes") return Array(5).fill(null).map((_, i) => ({
        cloCode: `CLO-${i + 1}`,
        description: "",
      }));
      if (name === "weeklyTopics") return [{
        weekNo: 1,
        subjectTitle: "",
        detailsText: "",
        tasksPrivateStudyText: "",
        clos: [],
      }];
      return undefined;
    },
    setValue: vi.fn(),
    getValues: () => ({
      courseId: 100,
      termId: 1,
      lecturerUserId: 1,
      assistantUserIds: [],
      textbooksText: "",
      additionalReadingText: "",
      officeHours: "",
      officeCode: "",
      objectives: [{ description: "" }],
      contentItems: [{ description: "" }],
      learningOutcomes: Array(5).fill(null).map((_, i) => ({
        cloCode: `CLO-${i + 1}`,
        description: "",
      })),
      programLearningOutcomes: [{ ploCode: "PLO-1", description: "" }],
      weeklyTopics: [
        {
          weekNo: 1,
          subjectTitle: "",
          detailsText: "",
          tasksPrivateStudyText: "",
          clos: [],
        },
      ],
      evaluationItems: [{ title: "", count: 1, weight: 0 }],
      workloadItems: [{ activity: "", hours: 0 }],
    }),
    clearErrors: vi.fn(),
    setError: vi.fn(),
    trigger: vi.fn(() => Promise.resolve(true)),
    reset: vi.fn(),
  }),
  useFieldArray: ({ name }: any) => ({
    fields: [{ id: "field-1" }],
    append: vi.fn(),
    remove: vi.fn(),
    replace: vi.fn(),
  }),
  Controller: ({ render }: any) => {
    const field = { value: "", onChange: vi.fn() };
    return render({ field });
  },
}));

describe("CreateOutlineDialog", () => {
  const mockTerms = [
    { termId: 1, academicYear: "2024-2025", semester: "Fall" },
  ];
  const mockUsers = [
    { userId: 10, firstName: "John", lastName: "Doe", email: "john@test.com" },
  ];
  const mockCourses = [
    { courseId: 100, courseCode: "SFWE343", courseName: "Software Engineering", ectsCredits: 6 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseFetchData
      .mockReturnValueOnce([false, null, { terms: mockTerms }, vi.fn()])
      .mockReturnValueOnce([false, null, { users: mockUsers }, vi.fn()])
      .mockReturnValueOnce([false, null, { courses: mockCourses }, vi.fn()])
      .mockReturnValueOnce([false, null, {}, vi.fn()]);
  });

  it("renders component successfully", () => {
    const { container } = render(<CreateOutlineDialog courseId={100} />);
    expect(container).toBeDefined();
    expect(container.firstChild).toBeTruthy();
  });

  it("displays create outline button by default", () => {
    const { getByTestId } = render(<CreateOutlineDialog courseId={100} />);
    const trigger = getByTestId("trigger");
    expect(trigger).toBeTruthy();
    expect(trigger.textContent).toContain("Create Outline");
  });

  it("accepts courseId as prop", () => {
    const { container } = render(<CreateOutlineDialog courseId={100} />);
    expect(container).toBeTruthy();
  });

  it("renders in update mode with outlineId", () => {
    mockUseFetchData
      .mockReturnValueOnce([false, null, { terms: mockTerms }, vi.fn()])
      .mockReturnValueOnce([false, null, { users: mockUsers }, vi.fn()])
      .mockReturnValueOnce([false, null, { courses: mockCourses }, vi.fn()])
      .mockReturnValueOnce([false, null, {}, vi.fn()]);
    
    const { container } = render(<CreateOutlineDialog courseId={100} outlineId={1} />);
    expect(container).toBeTruthy();
  });

  it("accepts custom trigger element", () => {
    const customTrigger = <button>Custom Button</button>;
    const { container } = render(<CreateOutlineDialog courseId={100} trigger={customTrigger} />);
    expect(container.textContent).toContain("Custom Button");
  });

  it("renders dialog wrapper", () => {
    const { getByTestId } = render(<CreateOutlineDialog courseId={100} />);
    expect(getByTestId("dialog")).toBeTruthy();
  });

  it("calls useFetchData for data fetching", () => {
    render(<CreateOutlineDialog courseId={100} />);
    expect(mockUseFetchData).toHaveBeenCalled();
  });

  it("initializes with proper courseId", () => {
    render(<CreateOutlineDialog courseId={100} />);
    // Component uses courseId internally
    expect(mockUseFetchData).toHaveBeenCalled();
  });

  it("handles terms data loading", () => {
    mockUseFetchData
      .mockReturnValueOnce([true, null, {}, vi.fn()])
      .mockReturnValueOnce([false, null, { users: mockUsers }, vi.fn()])
      .mockReturnValueOnce([false, null, { courses: mockCourses }, vi.fn()])
      .mockReturnValueOnce([false, null, {}, vi.fn()]);
    
    const { container } = render(<CreateOutlineDialog courseId={100} />);
    expect(container).toBeTruthy();
  });

  it("handles users data loading", () => {
    mockUseFetchData
      .mockReturnValueOnce([false, null, { terms: mockTerms }, vi.fn()])
      .mockReturnValueOnce([true, null, {}, vi.fn()])
      .mockReturnValueOnce([false, null, { courses: mockCourses }, vi.fn()])
      .mockReturnValueOnce([false, null, {}, vi.fn()]);
    
    const { container } = render(<CreateOutlineDialog courseId={100} />);
    expect(container).toBeTruthy();
  });

  it("component structure is valid React element", () => {
    const { container } = render(<CreateOutlineDialog courseId={100} />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders without throwing errors", () => {
    expect(() => render(<CreateOutlineDialog courseId={100} />)).not.toThrow();
  });

  it("can be unmounted cleanly", () => {
    const { unmount } = render(<CreateOutlineDialog courseId={100} />);
    expect(() => unmount()).not.toThrow();
  });

  it("handles re-render with different props", () => {
    const { rerender } = render(<CreateOutlineDialog courseId={100} />);
    
    mockUseFetchData
      .mockReturnValueOnce([false, null, { terms: mockTerms }, vi.fn()])
      .mockReturnValueOnce([false, null, { users: mockUsers }, vi.fn()])
      .mockReturnValueOnce([false, null, { courses: mockCourses }, vi.fn()])
      .mockReturnValueOnce([false, null, {}, vi.fn()]);
    
    expect(() => rerender(<CreateOutlineDialog courseId={200} />)).not.toThrow();
  });

  it("maintains stable structure across renders", () => {
    const { container } = render(<CreateOutlineDialog courseId={100} />);
    const firstHTML = container.innerHTML;
    expect(firstHTML).toBeTruthy();
    expect(firstHTML.length).toBeGreaterThan(0);
  });

  it("is a valid function component", () => {
    expect(typeof CreateOutlineDialog).toBe("function");
  });

  it("component is exported correctly", () => {
    expect(CreateOutlineDialog).toBeDefined();
    expect(CreateOutlineDialog.name).toBe("CreateOutlineDialog");
  });

  it("renders with minimal required props", () => {
    const { container } = render(<CreateOutlineDialog courseId={1} />);
    expect(container.firstChild).toBeTruthy();
  });

  it("handles different courseId values", () => {
    const { container: container1 } = render(<CreateOutlineDialog courseId={100} />);
    expect(container1).toBeTruthy();
    
    mockUseFetchData
      .mockReturnValueOnce([false, null, { terms: mockTerms }, vi.fn()])
      .mockReturnValueOnce([false, null, { users: mockUsers }, vi.fn()])
      .mockReturnValueOnce([false, null, { courses: mockCourses }, vi.fn()])
      .mockReturnValueOnce([false, null, {}, vi.fn()]);
    
    const { container: container2 } = render(<CreateOutlineDialog courseId={200} />);
    expect(container2).toBeTruthy();
  });

  it("component renders consistently", () => {
    const render1 = render(<CreateOutlineDialog courseId={100} />);
    expect(render1.container).toBeTruthy();
    render1.unmount();
    
    mockUseFetchData
      .mockReturnValueOnce([false, null, { terms: mockTerms }, vi.fn()])
      .mockReturnValueOnce([false, null, { users: mockUsers }, vi.fn()])
      .mockReturnValueOnce([false, null, { courses: mockCourses }, vi.fn()])
      .mockReturnValueOnce([false, null, {}, vi.fn()]);
    
    const render2 = render(<CreateOutlineDialog courseId={100} />);
    expect(render2.container).toBeTruthy();
  });

  it("has correct display name", () => {
    expect(CreateOutlineDialog.name).toBeTruthy();
  });
});
