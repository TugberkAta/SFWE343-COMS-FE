import http from "@/utils/http";
import { users } from "@/constants/endpoints";
import type { UserWithNoRole } from "@/types/user-with-no-role";

const getUsersWithNoRole = () => {
  const endpoint = users.withNoRole();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  return http.get<UserWithNoRole[]>(`${apiBaseUrl}${endpoint}`);
};

export default getUsersWithNoRole;
