import { outlines } from "@/constants/endpoints";
import http from "@/utils/http";

const getOutlinePdfById = (outlineId: number) => {
  const endpoint = outlines.getPdfById(outlineId);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  return http.get<Blob>(`${apiBaseUrl}${endpoint}`, {
    responseType: "blob",
  });
};

export default getOutlinePdfById;
