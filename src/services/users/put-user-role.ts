import http from "@/utils/http";
import { users } from "@/constants/endpoints";

type Payload = {
  userRole: string;
  permissions_json: string[];
};

const updateUserRole = (id: number, payload: Payload) => {
  const endpoint = `${users.userRoles()}/${id}`;
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  return http.put(`${apiBaseUrl}${endpoint}`, { data: payload });
};

export default updateUserRole;
