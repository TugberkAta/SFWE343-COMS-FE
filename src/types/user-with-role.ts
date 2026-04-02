/** Matches GET /users/with-role rows after `camelKeys` (wrapped as `{ users }` on the API). */
export type UserWithRole = {
  userId: number
  firstName: string
  lastName: string
  email: string
  createdAt: string
  userRole: string | null
}
