const user = {
  emailSignup: () => `/email-auth`,
  login: () => `/login`,
  register: () => `/register`,
};

const users = {
  withNoRole: () => `/users/no-role`,
  withRole: () => `/users/with-role`,
  approveUser: () => `/approve-user`,
  rejectUser: () => `/reject-user`,
  userRoles: () => `/user-roles`,
};

const userTypes = {
  getAll: () => `/user-types`,
  getById: (userTypeId: number) => `/user-types/${userTypeId}`,
  create: () => `/user-types`,
  putById: (userTypeId: number) => `/user-types/${userTypeId}`,
  deleteById: (userTypeId: number) => `/user-types/${userTypeId}`,
};

const departments = {
  getAll: () => `/departments`,
};

const programs = {
  getAll: () => `/programs`,
};

const courses = {
  getAll: () => `/courses`,
};

const terms = {
  getAll: () => `/terms`,
};

const outlines = {
  getAll: () => `/outlines`,
  create: () => `/course-outline`,
  patchById: (outlineId: number) => `/course-outline/${outlineId}`,
  getById: (outlineId: number) => `/outlines/${outlineId}`,
  getPdfById: (outlineId: number) => `/outlines/${outlineId}/pdf`,
  deleteById: (outlineId: number) => `/outlines/${outlineId}`,
  submit: (outlineId: number) => `/outlines/${outlineId}/submit`,
  resubmit: (outlineId: number) => `/outlines/${outlineId}/resubmit`,
};

const approval = {
  stage1: () => `/approval/stage-1`,
  stage1Approve: (outlineId: number) => `/approval/stage-1/${outlineId}/approve`,
  stage1RequestChanges: (outlineId: number) => `/approval/stage-1/${outlineId}/request-changes`,
  stage1Reject: (outlineId: number) => `/approval/stage-1/${outlineId}/reject`,
  getById: (outlineId: number) => `/approval/${outlineId}`,
  stage2: () => `/approval/stage-2`,
  stage2Approve: (outlineId: number) => `/approval/stage-2/${outlineId}/approve`,
  stage2RequestChanges: (outlineId: number) => `/approval/stage-2/${outlineId}/request-changes`,
  stage2Reject: (outlineId: number) => `/approval/stage-2/${outlineId}/reject`,
};

export { user, users, userTypes, departments, programs, courses, terms, outlines, approval };
