export const ENDPOINT_PERMISSIONS = {
  users: {
    READ: "users.read",
    WRITE: "users.write",
    EDIT: "users.edit",
    APPROVE: "users.approve",
  },
  userTypes: {
    READ: "userTypes.read",
    WRITE: "userTypes.write",
    EDIT: "userTypes.edit",
    DELETE: "userTypes.delete",
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
  approval: {
    STAGE1: "approval.stage1",
    STAGE1_APPROVE: "approval.stage1.approve",
    STAGE2: "approval.stage2",
    STAGE2_APPROVE: "approval.stage2.approve",
  },
} as const;