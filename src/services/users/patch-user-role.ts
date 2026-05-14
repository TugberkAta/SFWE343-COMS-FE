import http from "@/utils/http";
import { users } from "@/constants/endpoints";

export type PatchUserRoleBody = {
  userTypeId: number
}

export type PatchUserRoleResponse = {
  message: string;
};

const patchUserRole = (userId: number, data: PatchUserRoleBody) => {
  const endpoint = users.withRole();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  // TODO: Confirm exact endpoint with backend. May need to use a different path like /users/{userId}/role
  return http.patch<PatchUserRoleResponse>(`${apiBaseUrl}${endpoint}/${userId}`, {
    data,
  })
};

export default patchUserRole;
