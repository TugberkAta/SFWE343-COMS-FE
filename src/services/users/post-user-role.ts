import http from "@/utils/http";
import { users } from "@/constants/endpoints";

type Payload = {
  userRole: string;
  permissions_json: string[];
};

const createUserRole = (payload: Payload) => {
  const endpoint = users.userRoles();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  return http.post(`${apiBaseUrl}${endpoint}`, { data: payload });
};

export default createUserRole;
