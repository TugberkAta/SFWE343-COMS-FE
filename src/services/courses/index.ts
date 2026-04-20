import http from "@/utils/http";
import { courses } from "@/constants/endpoints";

export type Course = {
  courseId: number;
  programId: number;
  code: string;
  name: string;
  language: string;
  courseLevelText: string;
  category: string;
  theoryHours: number;
  tutorialHours: number;
  labHours: number;
  localCredits: number;
  ectsCredits: number;
  programName: string;
  departmentId: number;
  departmentName: string;
  departmentType: string;
};

export type CoursesResponse = {
  courses: Course[];
};

export const getCourses = () => {
  const endpoint = courses.getAll();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  return http.get<CoursesResponse>(`${apiBaseUrl}${endpoint}`);
};
