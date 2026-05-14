"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import useFetchData from "@/hooks/use-fetch-data"
import getUsersWithRole from "@/services/users/users-with-role"
import { getUserTypes } from "@/services/user-types"
import type { UserWithRole } from "@/types/user-with-role"
import { Loader2Icon, TriangleAlertIcon, Pencil } from "lucide-react"
import { ENDPOINT_PERMISSIONS } from "@/constants/permissions"
import { usePermission } from "@/hooks/use-permission"
import { PermissionGate } from "@/components/PermissionGate"
import { PermissionProtectedPage } from "@/components/PermissionProtectedPage"
import { AssignUserTypeDialog } from "./assign-user-type-dialog"

function fullName(user: UserWithRole) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || "—"
}

export default function UsersWithRolePage() {
  const [search, setSearch] = React.useState("")
  const [assignTypeDialog, setAssignTypeDialog] = React.useState<{
    open: boolean
    user: UserWithRole | null
  }>({ open: false, user: null })
  const { hasPermission } = usePermission()

  const [loading, errored, usersData, refetch] = useFetchData(
    () => getUsersWithRole(),
    []
  )

  const [typesLoading, typesErrored, typesData] = useFetchData(
    () => getUserTypes(),
    []
  )

  if (!hasPermission(ENDPOINT_PERMISSIONS.users.READ)) {
    return <PermissionProtectedPage />
  }

  if (loading || typesLoading) {
    return <Loader2Icon className="size-4 animate-spin" />
  }

  if (errored || typesErrored) {
    return <TriangleAlertIcon className="size-4 text-destructive" />
  }

  const users = usersData?.users ?? []
  const userTypes = typesData?.userTypes ?? []

  const filteredData = users.filter((item: UserWithRole) => {
    const q = search.toLowerCase()
    const typeLabel = (item.typeName ?? "").toLowerCase()
    return (
      item.email.toLowerCase().includes(q) ||
      fullName(item).toLowerCase().includes(q) ||
      typeLabel.includes(q)
    )
  })

  const handleAssignSuccess = async () => {
    await refetch()
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">
            Registered users and their assigned user type.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border px-3 py-1">
          <span className="text-xs text-muted-foreground">Listed</span>
          <span className="text-sm font-semibold">{filteredData.length}</span>
        </div>
      </div>

      <Card className="border-border">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center py-2">
            <Input
              placeholder="Filter by name, email, or type…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
              disabled={loading || errored}
            />
          </div>

          <div className="border rounded-md overflow-hidden">
            <table className="w-full caption-bottom text-sm rounded-md">
              <thead className="[&_tr]:border-b bg-background/30">
                <tr className="border-b hover:bg-muted/50">
                  <th className="h-12 px-4 text-left font-medium">Name</th>
                  <th className="h-12 px-4 text-left font-medium">Email</th>
                  <th className="h-12 px-4 text-left font-medium">Type</th>
                  <th className="h-12 px-4 text-left font-medium">Joined</th>
                  <th className="h-12 px-4 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredData.length ? (
                  filteredData.map((user: UserWithRole) => (
                    <tr
                      key={user.userId}
                      className="border-b hover:bg-muted/50 bg-background/30"
                    >
                      <td className="p-4 font-medium">{fullName(user)}</td>
                      <td className="p-4 text-muted-foreground">{user.email}</td>
                      <td className="p-4">
                        {user.typeName ? (
                          <span className="inline-flex items-center rounded-full bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300 border border-violet-500/20">
                            {user.typeName}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleString()
                          : "—"}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <PermissionGate permission={ENDPOINT_PERMISSIONS.users.EDIT}>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() =>
                                setAssignTypeDialog({ open: true, user })
                              }
                            >
                              <Pencil className="size-4" />
                            </Button>
                          </PermissionGate>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-6 text-center text-muted-foreground"
                    >
                      No results.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-end">
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AssignUserTypeDialog
        open={assignTypeDialog.open}
        onOpenChange={(open) =>
          setAssignTypeDialog({ open, user: assignTypeDialog.user })
        }
        user={assignTypeDialog.user}
        userTypes={userTypes}
        userTypesLoading={typesLoading}
        userTypesErrored={typesErrored}
        onAssigned={handleAssignSuccess}
      />
    </div>
  )
}
