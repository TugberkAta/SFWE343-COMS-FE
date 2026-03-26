import axios from "axios";
import { user } from "@/constants/endpoints";
import parseJWTPayload from "@/utils/parse-jwt-payload";

type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  shortcode: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

class Authentication {
  register({
    firstName,
    lastName,
    email,
    password,
    shortcode,
  }: RegisterPayload) {
    const registerEndpoint = user.register();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    return axios(`${API_BASE_URL}${registerEndpoint}`, {
      method: "POST",
      data: { firstName, lastName, email, password, shortcode },
    }).then((response) => {
      const accessToken = response.data.accessToken;
      document.cookie = `token=${accessToken}; path=/; secure; samesite=strict`;
    });
  }

  login({ email, password }: LoginPayload) {
    const loginEndpoint = user.login();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    return axios(`${API_BASE_URL}${loginEndpoint}`, {
      method: "POST",
      data: { email, password },
    }).then((response) => {
      const accessToken = response.data.accessToken;
      document.cookie = `token=${accessToken}; path=/; secure; samesite=strict`;
    });
  }

  logout() {
    document.cookie =
      "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
  }

  getAccessToken() {
    const cookies = document.cookie.split(";");
    const tokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("token="),
    );
    return tokenCookie ? tokenCookie.split("=")[1] : null;
  }

  isAuthenticated() {
    const token = this.getAccessToken();
    if (token) {
      const parsedToken = parseJWTPayload(token);
      const { exp } = parsedToken;
      if (!exp) return false;
      return exp > Math.floor(Date.now() / 1000);
    }
    return false;
  }

  getAccessTokenPayload() {
    const token = this.getAccessToken();
    return token ? parseJWTPayload(token) : null;
  }
}

export default Authentication;
