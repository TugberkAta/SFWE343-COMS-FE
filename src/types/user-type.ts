/** Shape returned by GET /user-types from the API */
export type UserTypeApiRow = {
  userTypeId: number
  typeName: string
  permissionsJson: string[]
}

export type UserType = {
  userTypeId: number
  /** Display name; normalized from API `typeName` when needed */
  userType: string
  permissions: string[]
}

export function normalizeUserTypeFromApi(row: {
  userTypeId: number
  typeName?: string
  userType?: string
  permissions?: string[]
  permissionsJson?: string[]
}): UserType {
  const rawPerms = row.permissions ?? row.permissionsJson
  const permissions = Array.isArray(rawPerms)
    ? rawPerms.filter((p): p is string => typeof p === "string")
    : []
  const name =
    (typeof row.userType === "string" && row.userType) ||
    (typeof row.typeName === "string" && row.typeName) ||
    ""
  return {
    userTypeId: Number(row.userTypeId),
    userType: name,
    permissions,
  }
}

/** Request body for POST /user-types and PUT /user-types/:userTypeId */
export type UserTypeUpsertApiBody = {
  typeName: string
  permissionsJson: string[]
}

export type CreateUserTypeResponse = {
  userTypeId: number
}

export type UpdateUserTypeResponse = {
  message: string
}

/** Form / client shape before mapping to {@link UserTypeUpsertApiBody} */
export type UserTypeFormSubmitValues = {
  userType: string
  permissions: string[]
}

export type UserTypesApiResponse = {
  userTypes: UserTypeApiRow[]
}

export type UserTypesResponse = {
  userTypes: UserType[]
}

export type UserTypeResponse = {
  userType: UserType
}
