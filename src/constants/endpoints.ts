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
};

export { user, users, departments, programs, courses, terms, outlines };
