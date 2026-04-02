/** Matches `selectUsersWithNoRole` rows after `camelKeys` (GET /users/no-role). */
export type UserWithNoRole = {
  userId: number
  firstName: string
  lastName: string
  email: string
  createdAt: string
  userRole: string | null
}
