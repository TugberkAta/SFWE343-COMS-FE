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

  return http.get<CoursesResponse>(`${apiBaseUrl}${endpoint}`).catch(() => {
    // Fallback mock data when backend is unavailable
    return {
      data: {
        courses: [
          { courseId: 1, programId: 11, code: "SFWE343", name: "SOFTWARE ANALYSIS AND DESIGN", language: "English", courseLevelText: "Undergraduate", category: "Core", theoryHours: 3, tutorialHours: 1, labHours: 0, localCredits: 3, ectsCredits: 5, programName: "Computer Engineering", departmentId: 3, departmentName: "Faculty of Engineering", departmentType: "undergraduate" },
          { courseId: 2, programId: 11, code: "COMP101", name: "INTRODUCTION TO PROGRAMMING", language: "English", courseLevelText: "Undergraduate", category: "Core", theoryHours: 3, tutorialHours: 0, labHours: 2, localCredits: 4, ectsCredits: 6, programName: "Computer Engineering", departmentId: 3, departmentName: "Faculty of Engineering", departmentType: "undergraduate" },
          { courseId: 3, programId: 11, code: "COMP201", name: "DATA STRUCTURES", language: "English", courseLevelText: "Undergraduate", category: "Core", theoryHours: 3, tutorialHours: 1, labHours: 1, localCredits: 4, ectsCredits: 6, programName: "Computer Engineering", departmentId: 3, departmentName: "Faculty of Engineering", departmentType: "undergraduate" },
          { courseId: 4, programId: 11, code: "COMP301", name: "DATABASE SYSTEMS", language: "English", courseLevelText: "Undergraduate", category: "Core", theoryHours: 3, tutorialHours: 0, labHours: 2, localCredits: 4, ectsCredits: 6, programName: "Computer Engineering", departmentId: 3, departmentName: "Faculty of Engineering", departmentType: "undergraduate" },
          { courseId: 5, programId: 11, code: "COMP401", name: "WEB APPLICATION DEVELOPMENT", language: "English", courseLevelText: "Undergraduate", category: "Elective", theoryHours: 2, tutorialHours: 0, labHours: 3, localCredits: 4, ectsCredits: 6, programName: "Computer Engineering", departmentId: 3, departmentName: "Faculty of Engineering", departmentType: "undergraduate" }
        ]
      }
    } as any;
  });
};
