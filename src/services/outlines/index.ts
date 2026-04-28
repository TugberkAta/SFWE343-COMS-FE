import http from "@/utils/http";
import { outlines } from "@/constants/endpoints";
import postCourseOutline from "./post-course-outline";
import getOutlinePdfById from "./get-outline-pdf-by-id";
import deleteOutlineById from "./delete-outline-by-id";
import getOutlineById from "./get-outline-by-id";
import patchCourseOutline from "./patch-course-outline";

export type Outline = {
  outlineId: number;
  courseId: number;
  termId: number;
  versionNo: number;
  status: "published" | "pending" | "draft";
  createdAt: string;
  updatedAt: string;
  courseCode: string;
  courseName: string;
  programId: number;
  programName: string;
  departmentId: number;
  departmentName: string;
  academicYear: string;
  semester: string;
};

export type OutlinesResponse = {
  outlines: Outline[];
};

export const getOutlines = () => {
  const endpoint = outlines.getAll();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  return http.get<OutlinesResponse>(`${apiBaseUrl}${endpoint}`).catch(() => {
    // Fallback mock data when backend is unavailable
    return {
      data: {
        outlines: [
          {
            outlineId: 1,
            courseId: 1,
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
          },
          {
            outlineId: 2,
            courseId: 2,
            termId: 1,
            versionNo: 1,
            status: "draft",
            createdAt: "2026-02-15 10:30:00",
            updatedAt: "2026-02-15 10:30:00",
            courseCode: "COMP101",
            courseName: "INTRODUCTION TO PROGRAMMING",
            programId: 11,
            programName: "Computer Engineering",
            departmentId: 3,
            departmentName: "Faculty of Engineering",
            academicYear: "2025-2026",
            semester: "spring"
          },
          {
            outlineId: 3,
            courseId: 3,
            termId: 1,
            versionNo: 1,
            status: "pending",
            createdAt: "2026-02-20 14:15:00",
            updatedAt: "2026-02-20 14:15:00",
            courseCode: "COMP201",
            courseName: "DATA STRUCTURES",
            programId: 11,
            programName: "Computer Engineering",
            departmentId: 3,
            departmentName: "Faculty of Engineering",
            academicYear: "2025-2026",
            semester: "spring"
          }
        ]
      }
    } as any;
  });
};

export { postCourseOutline, patchCourseOutline, getOutlinePdfById, deleteOutlineById, getOutlineById };