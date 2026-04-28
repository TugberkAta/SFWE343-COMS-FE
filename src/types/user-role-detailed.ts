/** Detailed user role including permissions */
export type UserRoleDetailed = {
  userRoleId: number;
  userRole: string;
  permissions_json?: string[];
};
