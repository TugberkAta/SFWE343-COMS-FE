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

  return http.get<OutlinesResponse>(`${apiBaseUrl}${endpoint}`);
};

export { postCourseOutline, patchCourseOutline, getOutlinePdfById, deleteOutlineById, getOutlineById };