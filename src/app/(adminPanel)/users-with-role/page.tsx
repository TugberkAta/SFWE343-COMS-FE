"use client"

import * as React from "react"
import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import useFetchData from "@/hooks/use-fetch-data"
import { useBreadcrumb } from "@/contexts/breadcrumb-context"
import getUsersWithRole from "@/services/users/users-with-role"
import getUserRoles from "@/services/users/get-user-roles"
import type { UserWithRole } from "@/types/user-with-role"
import { Loader2Icon, TriangleAlertIcon, Pencil } from "lucide-react"
import { ENDPOINT_PERMISSIONS } from "@/constants/permissions"
import { usePermission } from "@/hooks/use-permission"
import { PermissionGate } from "@/components/PermissionGate"
import { PermissionProtectedPage } from "@/components/PermissionProtectedPage"
import { AssignRoleDialog } from "./assign-role-dialog"

function fullName(user: UserWithRole) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || "—"
}

export default function UsersWithRolePage() {
  const { setBreadcrumbItem } = useBreadcrumb()

  useEffect(() => {
    setBreadcrumbItem("/admin/users-with-role", "Faculties > Users With Role")
  }, [setBreadcrumbItem])
  const [search, setSearch] = React.useState("")
  const [assignRoleDialog, setAssignRoleDialog] = React.useState<{
    open: boolean
    user: UserWithRole | null
  }>({ open: false, user: null })
  const { hasPermission } = usePermission()

  const [loading, errored, usersData, refetch] = useFetchData(
    () => getUsersWithRole(),
    []
  )

  const [rolesLoading, rolesErrored, rolesData] = useFetchData(
    () => getUserRoles(),
    []
  )

  if (!hasPermission(ENDPOINT_PERMISSIONS.users.READ)) {
    return <PermissionProtectedPage />
  }

  if (loading || rolesLoading) {
    return <Loader2Icon className="size-4 animate-spin" />
  }

  if (errored || rolesErrored) {
    return <TriangleAlertIcon className="size-4 text-destructive" />
  }

  const users = usersData?.users ?? []
  const roles = rolesData.userRoles ?? []

  const filteredData = users.filter((item: UserWithRole) => {
    const q = search.toLowerCase()
    return (
      item.email.toLowerCase().includes(q) ||
      fullName(item).toLowerCase().includes(q) ||
      (item.userRole ?? "").toLowerCase().includes(q)
    )
  })

  const handleAssignRoleSuccess = async () => {
    await refetch()
  }

  return (
    <div className="w-full p-6 space-y-6 bg-[#f8f8f8] dark:bg-[var(--layer-0)]">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-[#111827] dark:text-[var(--text-main)]">Users</h1>
          <p className="text-sm text-[#6b7280] dark:text-[var(--text-secondary)]">
            All registered users that already have a role assigned.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-[#e5e7eb] px-3 py-1 bg-white dark:bg-[var(--layer-1)] dark:border-[var(--layer-2-border)]">
          <span className="text-xs text-[#6b7280] dark:text-[var(--text-secondary)]">Listed</span>
          <span className="text-sm font-semibold text-[#111827] dark:text-[var(--text-main)]">{filteredData.length}</span>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#e5e7eb] shadow-sm dark:bg-[var(--layer-1)] dark:border-[var(--layer-2-border)]">
        <div className="space-y-4 p-6">
          <div className="flex items-center py-2">
            <Input
              placeholder="Filter by name, email, or role…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm bg-white border border-[#e5e7eb] rounded-lg text-[#111827] placeholder-[#6b7280] focus:border-[#ef233c] focus:ring-2 focus:ring-[#fff1f2] dark:bg-[var(--layer-2)] dark:border-[var(--layer-2-border)] dark:text-[var(--text-main)] dark:placeholder-[var(--text-secondary)] dark:focus:border-[var(--text-main)] dark:focus:ring-[var(--text-main)]"
              disabled={loading || errored}
            />
          </div>

          <div className="border border-[#e5e7eb] rounded-lg overflow-hidden dark:border-[var(--layer-2-border)]">
            <table className="w-full caption-bottom text-sm">
              <thead className="bg-[#f8f8f8] border-b border-[#e5e7eb] dark:bg-[var(--layer-1)] dark:border-[var(--layer-2-border)]">
                <tr>
                  <th className="h-12 px-4 text-left font-semibold text-[#111827] dark:text-[var(--text-main)]">Name</th>
                  <th className="h-12 px-4 text-left font-semibold text-[#111827] dark:text-[var(--text-main)]">Email</th>
                  <th className="h-12 px-4 text-left font-semibold text-[#111827] dark:text-[var(--text-main)]">Role</th>
                  <th className="h-12 px-4 text-left font-semibold text-[#111827] dark:text-[var(--text-main)]">Joined</th>
                  <th className="h-12 px-4 text-right font-semibold text-[#111827] dark:text-[var(--text-main)]">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredData.length ? (
                  filteredData.map((user: UserWithRole) => (
                    <tr
                      key={user.userId}
                      className="border-b border-[#e5e7eb] hover:bg-[#f8f8f8] bg-white transition-colors dark:bg-[var(--layer-1)] dark:border-[var(--layer-2-border)] dark:hover:bg-transparent"
                    >
                      <td className="p-4 font-medium text-[#111827] dark:text-[var(--text-main)]">{fullName(user)}</td>
                      <td className="p-4 text-[#6b7280] dark:text-[var(--text-main)]">{user.email}</td>
                      <td className="p-4">
                        {user.userRole ? (
                          <span className="inline-flex items-center rounded-full bg-[#fff1f2] px-3 py-1 text-xs font-medium text-[#ef233c] border border-[#fce4ec] dark:bg-[var(--layer-1)] dark:border-[var(--layer-2-border)] dark:text-[var(--text-main)]">
                            {user.userRole}
                          </span>
                        ) : (
                          <span className="text-[#6b7280] dark:text-[var(--text-main)]">—</span>
                        )}
                      </td>
                      <td className="p-4 text-[#6b7280] dark:text-[var(--text-main)]">
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
                                setAssignRoleDialog({ open: true, user })
                              }
                              className="text-[#ef233c] hover:bg-[#fff1f2] rounded-lg h-9 w-9 dark:text-[var(--text-main)] dark:hover:bg-[var(--layer-2)]"
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
                      className="p-6 text-center text-[#6b7280] dark:text-[#888]"
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
              <Button 
                variant="outline" 
                size="sm"
                className="border border-[#e5e7eb] text-[#111827] hover:bg-[#f8f8f8] rounded-lg"
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="border border-[#e5e7eb] text-[#111827] hover:bg-[#f8f8f8] rounded-lg"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Role Dialog */}
      <AssignRoleDialog
        open={assignRoleDialog.open}
        onOpenChange={(open) =>
          setAssignRoleDialog({ open, user: assignRoleDialog.user })
        }
        user={assignRoleDialog.user}
        roles={roles}
        rolesLoading={rolesLoading}
        rolesErrored={rolesErrored}
        onAssigned={handleAssignRoleSuccess}
      />
    </div>
  )
}