import http from "@/utils/http";
import { users } from "@/constants/endpoints";
import type {
  PostApproveUserBody,
  PostApproveUserResponse,
} from "@/types/approve-user";

const postApproveUser = (body: PostApproveUserBody) => {
  const endpoint = users.approveUser();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  return http.post<PostApproveUserResponse>(`${apiBaseUrl}${endpoint}`, {
    data: body,
  });
};

export default postApproveUser;
