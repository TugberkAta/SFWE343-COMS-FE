import http from "@/utils/http";
import { programs } from "@/constants/endpoints";

export type Program = {
  programId: number;
  departmentId: number;
  name: string;
  language: string;
  departmentType: string;
  departmentName: string;
};

export type ProgramsResponse = {
  programs: Program[];
};

export const getPrograms = () => {
  const endpoint = programs.getAll();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  return http.get<ProgramsResponse>(`${apiBaseUrl}${endpoint}`).catch(() => {
    // Fallback mock data when backend is unavailable
    return {
      data: {
        programs: [
          { programId: 1, departmentId: 1, name: "Law", language: "Turkish", departmentType: "undergraduate", departmentName: "Faculty of Law" },
          { programId: 2, departmentId: 1, name: "International Law", language: "English", departmentType: "undergraduate", departmentName: "Faculty of Law" },
          { programId: 3, departmentId: 2, name: "Pre-School Teaching", language: "Turkish", departmentType: "undergraduate", departmentName: "Faculty of Educational Sciences" },
          { programId: 4, departmentId: 2, name: "Guidance and Psychological Counselling", language: "Turkish", departmentType: "undergraduate", departmentName: "Faculty of Educational Sciences" },
          { programId: 5, departmentId: 2, name: "English Language Teaching", language: "English", departmentType: "undergraduate", departmentName: "Faculty of Educational Sciences" },
          { programId: 6, departmentId: 2, name: "Turkish Language Teaching", language: "Turkish", departmentType: "undergraduate", departmentName: "Faculty of Educational Sciences" },
          { programId: 7, departmentId: 2, name: "Elementary Mathematics Teaching", language: "Turkish", departmentType: "undergraduate", departmentName: "Faculty of Educational Sciences" },
          { programId: 8, departmentId: 2, name: "Special Education Teaching", language: "Turkish", departmentType: "undergraduate", departmentName: "Faculty of Educational Sciences" },
          { programId: 9, departmentId: 2, name: "Classroom Teaching", language: "Turkish", departmentType: "undergraduate", departmentName: "Faculty of Educational Sciences" },
          { programId: 10, departmentId: 3, name: "Electrical and Electronic Engineering", language: "English", departmentType: "undergraduate", departmentName: "Faculty of Engineering" },
          { programId: 11, departmentId: 3, name: "Computer Engineering", language: "English", departmentType: "undergraduate", departmentName: "Faculty of Engineering" },
          { programId: 12, departmentId: 3, name: "Civil Engineering", language: "English", departmentType: "undergraduate", departmentName: "Faculty of Engineering" },
          { programId: 13, departmentId: 3, name: "Software Engineering", language: "English", departmentType: "undergraduate", departmentName: "Faculty of Engineering" },
          { programId: 14, departmentId: 3, name: "Artificial Intelligence Engineering", language: "English", departmentType: "undergraduate", departmentName: "Faculty of Engineering" },
          { programId: 15, departmentId: 4, name: "Banking, Finance & Accounting", language: "English", departmentType: "undergraduate", departmentName: "Faculty of Economics and Administrative Sciences" },
          { programId: 16, departmentId: 4, name: "Business Administration", language: "English", departmentType: "undergraduate", departmentName: "Faculty of Economics and Administrative Sciences" },
          { programId: 17, departmentId: 4, name: "Business Administration (Enterprise) with Ulster University", language: "English", departmentType: "undergraduate", departmentName: "Faculty of Economics and Administrative Sciences" },
          { programId: 18, departmentId: 4, name: "Business Administration (Marketing) with Ulster University", language: "English", departmentType: "undergraduate", departmentName: "Faculty of Economics and Administrative Sciences" },
          { programId: 19, departmentId: 4, name: "Economics", language: "English", departmentType: "undergraduate", departmentName: "Faculty of Economics and Administrative Sciences" },
          { programId: 20, departmentId: 4, name: "International Finance and Banking", language: "English", departmentType: "undergraduate", departmentName: "Faculty of Economics and Administrative Sciences" },
          { programId: 21, departmentId: 4, name: "International Trade and Business", language: "English", departmentType: "undergraduate", departmentName: "Faculty of Economics and Administrative Sciences" },
          { programId: 22, departmentId: 4, name: "Management Information Systems (MIS)", language: "English", departmentType: "undergraduate", departmentName: "Faculty of Economics and Administrative Sciences" },
          { programId: 23, departmentId: 4, name: "Political Science and International Relations", language: "English", departmentType: "undergraduate", departmentName: "Faculty of Economics and Administrative Sciences" },
          { programId: 24, departmentId: 4, name: "Marketing (Digital Media)", language: "English", departmentType: "undergraduate", departmentName: "Faculty of Economics and Administrative Sciences" },
          { programId: 25, departmentId: 5, name: "Psychology", language: "Turkish", departmentType: "undergraduate", departmentName: "Faculty of Arts and Sciences" },
          { programId: 26, departmentId: 5, name: "Psychology", language: "English", departmentType: "undergraduate", departmentName: "Faculty of Arts and Sciences" },
          { programId: 27, departmentId: 6, name: "Architecture", language: "English", departmentType: "undergraduate", departmentName: "Faculty of Architecture and Fine Arts" },
          { programId: 28, departmentId: 6, name: "Interior Architecture", language: "English", departmentType: "undergraduate", departmentName: "Faculty of Architecture and Fine Arts" },
          { programId: 29, departmentId: 7, name: "Nursing", language: "Turkish", departmentType: "undergraduate", departmentName: "Faculty of Health Sciences" },
          { programId: 30, departmentId: 7, name: "Nutrition and Dietetics", language: "Turkish", departmentType: "undergraduate", departmentName: "Faculty of Health Sciences" },
          { programId: 31, departmentId: 7, name: "Physiotherapy and Rehabilitation", language: "Turkish", departmentType: "undergraduate", departmentName: "Faculty of Health Sciences" },
          { programId: 32, departmentId: 7, name: "Physiotherapy and Rehabilitation", language: "English", departmentType: "undergraduate", departmentName: "Faculty of Health Sciences" },
          { programId: 33, departmentId: 8, name: "Dentistry", language: "Turkish", departmentType: "undergraduate", departmentName: "Faculty of Dentistry" },
          { programId: 34, departmentId: 8, name: "Dentistry", language: "English", departmentType: "undergraduate", departmentName: "Faculty of Dentistry" },
          { programId: 35, departmentId: 9, name: "Pharmacy", language: "Turkish", departmentType: "undergraduate", departmentName: "Faculty of Pharmacy" },
          { programId: 36, departmentId: 9, name: "Pharmacy", language: "English", departmentType: "undergraduate", departmentName: "Faculty of Pharmacy" }
        ]
      }
    } as any;
  });
};