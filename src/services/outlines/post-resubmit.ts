import http from "@/utils/http";
import { outlines } from "@/constants/endpoints";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const postResubmitOutline = (outlineId: number) => {
  return http.post(`${apiBaseUrl}${outlines.resubmit(outlineId)}`);
};

export default postResubmitOutline;
