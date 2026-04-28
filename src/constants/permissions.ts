const ENDPOINT_PERMISSIONS = {
  users: {
    READ: "users.read",
    WRITE: "users.write",
    EDIT: "users.edit",
    APPROVE: "users.approve",
  },
  outlines: {
    READ: "outlines.read",
    WRITE: "outlines.write",
    EDIT: "outlines.edit",
    DELETE: "outlines.delete",
    DOWNLOAD: "outlines.download",
  },
  programs: {
    READ: "programs.read",
  },
  departments: {
    READ: "departments.read",
  },
  courses: {
    READ: "courses.read",
  },
  terms: {
    READ: "terms.read",
  },
};

const ALL_ENDPOINT_PERMISSIONS = Object.values(ENDPOINT_PERMISSIONS).flatMap(
  (permissionGroup) => Object.values(permissionGroup),
);

export { ENDPOINT_PERMISSIONS, ALL_ENDPOINT_PERMISSIONS };
