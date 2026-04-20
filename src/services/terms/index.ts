import http from "@/utils/http";
import { terms } from "@/constants/endpoints";

export type Term = {
  termId: number;
  academicYear: string;
  semester: string;
  startDate: string;
  endDate: string;
};

export type TermsResponse = {
  terms: Term[];
};

export const getTerms = () => {
  const endpoint = terms.getAll();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  return http.get<TermsResponse>(`${apiBaseUrl}${endpoint}`);
};
