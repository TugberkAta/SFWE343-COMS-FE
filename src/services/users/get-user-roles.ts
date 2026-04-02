import http from "@/utils/http";
import { users } from "@/constants/endpoints";
import type { UserRoleRecord } from "@/types/user-role";

const getUserRoles = () => {
  const endpoint = users.userRoles();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  return http.get<UserRoleRecord[]>(`${apiBaseUrl}${endpoint}`);
};

export default getUserRoles;
