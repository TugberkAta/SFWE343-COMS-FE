/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import type { AxiosPromise } from "axios";
import qs from "qs";
import Authentication from "@/services/auth/authentication";

let auth: Authentication | undefined;

const buildHeaders = () => {
  if (!auth) {
    auth = new Authentication();
  }

  const base = {
    "Content-Type": "application/json;charset=UTF-8",
  };

  if (auth.isAuthenticated()) {
    const token = auth.getAccessToken();
    return {
      ...base,
      Authorization: `Bearer ${token}`,
    };
  }

  return base;
};

const baseRequest = <T = any>(url: string, options = {}) => {
  const { headers = {}, method = "get", ...opts }: any = options;
  return axios(url, {
    method: method,
    headers: { ...buildHeaders(), ...headers },
    ...opts,
    paramsSerializer: function (params) {
      return qs.stringify(params, { encode: false, arrayFormat: "indices" });
    },
  }) as AxiosPromise<T>;
};

type AxiosFormMethod = "get" | "post" | "put" | "patch" | "delete";

export const baseRequestWithFormData = (
  url: string,
  formData: any,
  options: any = {},
) => {
  const { headers = {}, ...opts }: any = options;
  const method = (options.method || "get") as AxiosFormMethod;

  return axios[method](url, formData, {
    headers: { ...buildHeaders(), ...headers },
    ...opts,
  });
};

export default baseRequest;
