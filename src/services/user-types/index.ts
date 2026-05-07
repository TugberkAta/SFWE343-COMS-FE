import http from "@/utils/http";
import type { UserTypesResponse, UserTypeResponse, CreateUserTypeBody, UpdateUserTypeBody, UserType } from "@/types/user-type";

// TODO: Add user-types endpoints to endpoints.ts when backend is ready
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const getUserTypes = () => {
  // TODO: Implement when backend endpoint is ready
  return http.get<UserTypesResponse>(`${apiBaseUrl}/user-types`);
};

export const getUserTypeById = (userTypeId: number) => {
  // TODO: Implement when backend endpoint is ready
  return http.get<UserTypeResponse>(`${apiBaseUrl}/user-types/${userTypeId}`);
};

export const createUserType = (data: CreateUserTypeBody) => {
  // TODO: Implement when backend endpoint is ready
  return http.post<UserTypeResponse>(`${apiBaseUrl}/user-types`, data);
};

export const updateUserType = (userTypeId: number, data: UpdateUserTypeBody) => {
  // TODO: Implement when backend endpoint is ready
  return http.patch<UserTypeResponse>(`${apiBaseUrl}/user-types/${userTypeId}`, data);
};

export const deleteUserType = (userTypeId: number) => {
  // TODO: Implement when backend endpoint is ready
  return http.delete(`${apiBaseUrl}/user-types/${userTypeId}`);
};
