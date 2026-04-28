import http from "@/utils/http";
import { user } from "@/constants/endpoints";

const getMe = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const endpoint = user.me();

  return http.get(`${apiBaseUrl}${endpoint}`);
};

export default getMe;
