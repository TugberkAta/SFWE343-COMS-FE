export const usePermission = () => {

  
  const user = {
    permissions: [
      "users.read",
      "users.approve",
      "outlines.read",
      "outlines.write",
      "outlines.edit",
      "outlines.delete",
      "outlines.download",
      "departments.read",
      "programs.read",
      "courses.read",
    ],
  };

  const hasPermission = (permission: string) => {
    return user.permissions.includes(permission);
  };

  return { hasPermission };
};
