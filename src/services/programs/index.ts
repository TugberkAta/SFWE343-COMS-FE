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

  return http.get<ProgramsResponse>(`${apiBaseUrl}${endpoint}`);
};