import axios from "axios";
import { user } from "@/constants/endpoints";
import parseJWTPayload, { type JwtPayload } from "@/utils/parse-jwt-payload";

function normalizePermissionsFromPayload(payload: JwtPayload): string[] {
  const raw = payload.permissions ?? payload.permissionsJson;
  if (Array.isArray(raw)) {
    return raw.filter((p): p is string => typeof p === "string");
  }
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter((p): p is string => typeof p === "string");
      }
    } catch {
      return [];
    }
  }
  return [];
}

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

type UserToken = {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  typeName: string;
  permissions: string[];
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

  getCurrentUser(): UserToken | null {
    if (!this.isAuthenticated()) {
      return null;
    }
    const payload = this.getAccessTokenPayload();
    if (!payload) {
      return null;
    }
    return {
      userId: payload.userId as number,
      firstName: payload.firstName as string,
      lastName: payload.lastName as string,
      email: payload.email as string,
      typeName: payload.typeName as string,
      permissions: normalizePermissionsFromPayload(payload),
    };
  }
}

export default Authentication;
