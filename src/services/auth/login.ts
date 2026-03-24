import http from "@/utils/http";
import { user } from "@/constants/endpoints";

type LoginProps = {
  email: string;
  password: string;
};

const login = ({
  email,
  password,
}: LoginProps) => {
  const endpoint = user.login();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  return http.post(`${apiBaseUrl}${endpoint}`, {
    email,
    password,
  });
};

export default login;
