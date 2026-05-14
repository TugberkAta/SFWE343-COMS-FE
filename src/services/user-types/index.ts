import http from "@/utils/http";
import { userTypes as userTypesEndpoints } from "@/constants/endpoints";
import {
  normalizeUserTypeFromApi,
  type UserTypesApiResponse,
  type UserTypeResponse,
  type UserTypeApiRow,
  type UserTypeUpsertApiBody,
  type CreateUserTypeResponse,
  type UpdateUserTypeResponse,
  type UserTypeFormSubmitValues,
} from "@/types/user-type";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

function mapUserTypeResponse(response: { data: { userType: UserTypeApiRow } }) {
  return {
    ...response,
    data: {
      userType: normalizeUserTypeFromApi(response.data.userType),
    } satisfies UserTypeResponse,
  };
}

function toUpsertBody(values: UserTypeFormSubmitValues): UserTypeUpsertApiBody {
  return {
    typeName: values.userType,
    permissionsJson: values.permissions,
  };
}

export const getUserTypes = () =>
  http.get<UserTypesApiResponse>(`${apiBaseUrl}${userTypesEndpoints.getAll()}`).then((response) => ({
    ...response,
    data: {
      userTypes: (response.data?.userTypes ?? []).map((row) => normalizeUserTypeFromApi(row)),
    },
  }));

export const getUserTypeById = (userTypeId: number) =>
  http
    .get<{ userType: UserTypeApiRow }>(`${apiBaseUrl}${userTypesEndpoints.getById(userTypeId)}`)
    .then(mapUserTypeResponse);

export const createUserType = (values: UserTypeFormSubmitValues) =>
  http.post<CreateUserTypeResponse>(`${apiBaseUrl}${userTypesEndpoints.create()}`, {
    data: toUpsertBody(values),
  });

export const updateUserType = (userTypeId: number, values: UserTypeFormSubmitValues) =>
  http.put<UpdateUserTypeResponse>(`${apiBaseUrl}${userTypesEndpoints.putById(userTypeId)}`, {
    data: toUpsertBody(values),
  });

export const deleteUserType = (userTypeId: number) =>
  http.delete(`${apiBaseUrl}${userTypesEndpoints.deleteById(userTypeId)}`);
