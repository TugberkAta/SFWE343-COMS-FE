import http from "@/utils/http";
import { users } from "@/constants/endpoints";
import type { UserWithRole } from "@/types/user-with-role";

export type UsersWithRoleResponse = {
  users: UserWithRole[];
};

const getUsersWithRole = () => {
  const endpoint = users.withRole();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  return http.get<UsersWithRoleResponse>(`${apiBaseUrl}${endpoint}`);
};

export default getUsersWithRole;
