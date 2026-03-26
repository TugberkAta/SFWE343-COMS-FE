import http from "@/utils/http";
import { user } from "@/constants/endpoints";

type EmailSignupProps = {
  email: string;
};

const emailAuth = ({
  email,
}: EmailSignupProps) => {
  const endpoint = user.emailSignup();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  return http.post(`${apiBaseUrl}${endpoint}`, {
    data: { email },
  });
};

export default emailAuth;
