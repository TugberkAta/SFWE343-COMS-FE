import http from "@/utils/http";
import { outlines } from "@/constants/endpoints";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const postSubmitOutline = (outlineId: number) => {
  return http.post(`${apiBaseUrl}${outlines.submit(outlineId)}`);
};

export default postSubmitOutline;
