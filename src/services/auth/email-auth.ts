import http from "@/utils/http";
import { user } from "@/constants/endpoints";

type EmailSignupProps = {
  email: string;
};

const emailSignup = ({
  email,
}: EmailSignupProps) => {
  const endpoint = user.emailSignup();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  console.log(email)

  return http.post(`${apiBaseUrl}${endpoint}`, {
    email,
  });
};

export default emailSignup;
