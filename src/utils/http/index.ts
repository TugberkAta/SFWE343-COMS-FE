import baseRequest from "./baseRequest";

function encodeUrl(url: string) {
  const [baseUrl, queryString] = url.split("?");

  if (!queryString) {
    return url;
  }

  const encodedQueryString = queryString
    .split("&")
    .map((param) => {
      const addTrailingEqualSign = param.endsWith("=");
      const [key, value] = param.split("=");
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}${
        addTrailingEqualSign ? "=" : ""
      }`;
    })
    .join("&");

  return `${baseUrl}?${encodedQueryString}`;
}

function get<T = unknown>(url: string, options = {}) {
  const encodedUrl = encodeUrl(url);

  return baseRequest<T>(encodedUrl, {
    ...options,
    method: "get",
  });
}

function post<T = unknown>(url: string, options = {}) {
  return baseRequest<T>(url, {
    ...options,
    method: "post",
  });
}

function del(url: string, options = {}) {
  return baseRequest(url, {
    ...options,
    method: "delete",
  });
}

function put(url: string, options = {}) {
  return baseRequest(url, {
    ...options,
    method: "put",
  });
}

function patch(url: string, options = {}) {
  return baseRequest(url, {
    ...options,
    method: "patch",
  });
}

const http = {
  get,
  put,
  post,
  delete: del,
  patch,
};

export default http;
