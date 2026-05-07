export type UserType = {
  userTypeId: number
  userType: string
  permissions: string[]
}

export type CreateUserTypeBody = {
  userType: string
  permissions: string[]
}

export type UpdateUserTypeBody = {
  userType: string
  permissions: string[]
}

export type UserTypesResponse = {
  userTypes: UserType[]
}

export type UserTypeResponse = {
  userType: UserType
}
