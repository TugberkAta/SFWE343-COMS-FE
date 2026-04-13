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

export { user, users };
