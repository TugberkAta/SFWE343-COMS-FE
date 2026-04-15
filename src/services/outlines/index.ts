const mockOutlines = {
  outlines: [
    {
      outlineId: 1,
      courseId: 30,
      termId: 1,
      versionNo: 1,
      status: "published",
      createdAt: "2026-02-10 09:00:00",
      updatedAt: "2026-02-10 09:00:00",
      courseCode: "SFWE343",
      courseName: "SOFTWARE ANALYSIS AND DESIGN",
      programId: 11,
      programName: "Computer Engineering",
      departmentId: 3,
      departmentName: "Faculty of Engineering",
      academicYear: "2025-2026",
      semester: "spring"
    }
  ]
};

export const getOutlines = () => {
  return Promise.resolve({ data: mockOutlines });
};