export type PostApproveUserBody = {
  userId: number
  userTypeId: number
  approvedStatus: boolean
}

export type PostApproveUserResponse = {
  message: string
}
