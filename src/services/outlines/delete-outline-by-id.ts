import { outlines } from "@/constants/endpoints";
import http from "@/utils/http";

const deleteOutlineById = (outlineId: number) => {
  const endpoint = outlines.deleteById(outlineId);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  return http.delete(`${apiBaseUrl}${endpoint}`);
};

export default deleteOutlineById;
