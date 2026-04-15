const user = {
  emailSignup: () => `/email-auth`,
  login: () => `/login`,
  register: () => `/register`,
};

const users = {
  withNoRole: () => `/users/no-role`,
  withRole: () => `/users/with-role`,
  approveUser: () => `/approve-user`,
  userRoles: () => `/user-roles`,
};

const departments = {
  getAll: () => `/departments`,
};

const programs = {
  getAll: () => `/programs`,
};

const outlines = {
  getAll: () => `/outlines`,
};

export { user, users, departments, programs, outlines };
