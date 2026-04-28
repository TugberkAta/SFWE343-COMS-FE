import http from "@/utils/http";
import { users } from "@/constants/endpoints";

const deleteUserRole = (id: number) => {
  const endpoint = `${users.userRoles()}/${id}`;
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  return http.delete(`${apiBaseUrl}${endpoint}`);
};

export default deleteUserRole;
