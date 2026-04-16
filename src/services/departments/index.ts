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

  return http.get<DepartmentsResponse>(`${apiBaseUrl}${endpoint}`);
};