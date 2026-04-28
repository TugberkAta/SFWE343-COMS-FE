import http from "@/utils/http";
import { departments } from "@/constants/endpoints";

export type Department = {
  departmentId: number;
  type: string;
  name: string;
};

export type DepartmentsResponse = {
  departments: Department[];
};

export const getDepartments = () => {
  const endpoint = departments.getAll();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  return http.get<DepartmentsResponse>(`${apiBaseUrl}${endpoint}`).catch(() => {
    // Fallback mock data when backend is unavailable
    return {
      data: {
        departments: [
          { departmentId: 1, type: "undergraduate", name: "Faculty of Law" },
          { departmentId: 2, type: "undergraduate", name: "Faculty of Educational Sciences" },
          { departmentId: 3, type: "undergraduate", name: "Faculty of Engineering" },
          { departmentId: 4, type: "undergraduate", name: "Faculty of Economics and Administrative Sciences" },
          { departmentId: 5, type: "undergraduate", name: "Faculty of Arts and Sciences" },
          { departmentId: 6, type: "undergraduate", name: "Faculty of Architecture and Fine Arts" },
          { departmentId: 7, type: "undergraduate", name: "Faculty of Health Sciences" },
          { departmentId: 8, type: "undergraduate", name: "Faculty of Dentistry" },
          { departmentId: 9, type: "undergraduate", name: "Faculty of Pharmacy" },
          { departmentId: 10, type: "masters", name: "Institute of Graduate Studies" },
          { departmentId: 11, type: "phd", name: "Institute of Graduate Studies" }
        ]
      }
    } as any;
  });
};