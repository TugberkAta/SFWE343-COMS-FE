import http from "@/utils/http";
import { users } from "@/constants/endpoints";
import type {
  PostRejectUserBody,
  PostRejectUserResponse,
} from "@/types/reject-user";

const postRejectUser = (body: PostRejectUserBody) => {
  const endpoint = users.rejectUser();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  return http.post<PostRejectUserResponse>(`${apiBaseUrl}${endpoint}`, {
    data: body,
  });
};

export default postRejectUser;
