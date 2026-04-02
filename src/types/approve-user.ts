export type PostApproveUserBody = {
  userId: number
  userRoleId: number
  approvedStatus: boolean
}

export type PostApproveUserResponse = {
  message: string
}
