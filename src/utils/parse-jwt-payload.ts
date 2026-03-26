export type JwtPayload = {
  exp?: number;
  [key: string]: unknown;
};

export default function parseJWTPayload(token: string): JwtPayload {
  try {
    const segment = token.split(".")[1];
    if (!segment) {
      return {};
    }
    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return {};
  }
}
