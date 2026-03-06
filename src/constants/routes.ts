export const ROUTES = {
  HOME: "/",
  ADMIN: "/admin",
} as const;

export type StaticRoute = (typeof ROUTES)[keyof typeof ROUTES];

export const DYNAMIC_ROUTES = {
  // adminSchoolDetail: (id: string): string => `/admin/schools/${id}`,
} as const;

export const VALID_STATIC_ROUTES = new Set<string>(Object.values(ROUTES));

export const DYNAMIC_ROUTE_PATTERNS: RegExp[] = [
  /^\/admin\/[^/]+$/,
];

export function isValidRoute(path: string): boolean {
  if (VALID_STATIC_ROUTES.has(path)) {
    return true;
  }
  return DYNAMIC_ROUTE_PATTERNS.some((pattern) => pattern.test(path));
}
