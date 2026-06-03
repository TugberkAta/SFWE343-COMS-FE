"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import useFetchData from "@/hooks/use-fetch-data"
import getUsersWithNoRole from "@/services/users/users-with-no-role"
import getUserRoles from "@/services/users/get-user-roles"
import type { UserWithNoRole } from "@/types/user-with-no-role"
import { Loader2Icon, TriangleAlertIcon } from "lucide-react"
import { ApproveUserDialog } from "./approve-user-dialog"
import { RejectUserDialog } from "./reject-user-dialog"
import { usePermission } from "@/hooks/use-permission"
import { ENDPOINT_PERMISSIONS } from "@/constants/permissions"
import { PermissionGate } from "@/components/PermissionGate"
import { PermissionProtectedPage } from "@/components/PermissionProtectedPage"

function fullName(user: UserWithNoRole) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || "—"
}

type PendingDialog =
  | { type: "closed" }
  | { type: "approve"; user: UserWithNoRole }
  | { type: "reject"; user: UserWithNoRole }

export default function PendingUsersPage() {
  const [search, setSearch] = React.useState("")
  const [dialog, setDialog] = React.useState<PendingDialog>({ type: "closed" })

  const { hasPermission } = usePermission()

  const [loading, errored, usersData, refetch] = useFetchData(
    () => getUsersWithNoRole(),
    []
  )

  const [rolesLoading, rolesErrored, rolesData] = useFetchData(
    () => getUserRoles(),
    []
  )

  // 🔥 PAGE PROTECTION
  if (!hasPermission(ENDPOINT_PERMISSIONS.users.APPROVE)) {
    return <PermissionProtectedPage />
  }

  if (loading || rolesLoading) {
    return <Loader2Icon className="size-4 animate-spin" />
  }

  if (errored || rolesErrored) {
    return <TriangleAlertIcon className="size-4 text-destructive" />
  }

  const users = usersData.users ?? []
  const roles = rolesData.userRoles ?? []

  const filteredData = users.filter(
    (item: UserWithNoRole) =>
      item.email.toLowerCase().includes(search.toLowerCase()) ||
      fullName(item).toLowerCase().includes(search.toLowerCase())
  )

  const dismissDialog = () => {
    setDialog({ type: "closed" })
  }

  const openApprove = (user: UserWithNoRole) => {
    setDialog({ type: "approve", user })
  }

  const openReject = (user: UserWithNoRole) => {
    setDialog({ type: "reject", user })
  }

  const approveUser = dialog.type === "approve" ? dialog.user : null
  const rejectUser = dialog.type === "reject" ? dialog.user : null

  const handleAfterApprove = async () => {
    await refetch()
    dismissDialog()
  }

  const handleAfterReject = async () => {
    await refetch()
    dismissDialog()
  }

  return (
    <div className="w-full p-6 space-y-6 bg-[#f8f8f8] dark:bg-[var(--layer-0)]">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-[#111827] dark:text-[var(--text-main)]">User Requests</h1>
          <p className="text-sm text-[#6b7280] dark:text-[var(--text-secondary)]">
            Approve or reject incoming user requests.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-[#e5e7eb] px-3 py-1 bg-white dark:bg-[var(--layer-1)] dark:border-[var(--layer-2-border)]">
          <span className="text-xs text-[#6b7280] dark:text-[var(--text-secondary)]">Pending</span>
          <span className="text-sm font-semibold text-[#111827] dark:text-[var(--text-main)]">{filteredData.length}</span>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#e5e7eb] shadow-sm dark:bg-[var(--layer-1)] dark:border-[var(--layer-2-border)]">
        <div className="space-y-4 p-6">
          <div className="flex items-center py-2">
            <Input
              placeholder="Filter emails or names..."
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
                  <th className="h-12 px-4 text-left font-semibold text-[#111827]">Name</th>
                  <th className="h-12 px-4 text-left font-semibold text-[#111827]">Email</th>
                  <th className="h-12 px-4 text-left font-semibold text-[#111827]">Joined</th>
                  <th className="h-12 px-4 text-right font-semibold text-[#111827]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length ? (
                  filteredData.map((user) => (
                    <tr
                      key={user.userId}
                      className="border-b border-[#e5e7eb] hover:bg-[#f8f8f8] bg-white transition-colors dark:bg-[var(--layer-1)] dark:border-[var(--layer-2-border)] dark:hover:bg-transparent"
                    >
                      <td className="p-4 font-medium text-[#111827] dark:text-[var(--text-main)]">{fullName(user)}</td>
                      <td className="p-4 text-[#6b7280] dark:text-[var(--text-main)]">{user.email}</td>
                      <td className="p-4 text-[#6b7280] dark:text-[var(--text-main)]">
                        {user.createdAt ? new Date(user.createdAt).toLocaleString() : "—"}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <PermissionGate permission={ENDPOINT_PERMISSIONS.users.APPROVE}>
                            <Button
                              size="sm"
                              onClick={() => openApprove(user)}
                              className="bg-[#ef233c] hover:bg-[#e60012] text-white rounded-lg font-medium disabled:opacity-50 dark:text-[var(--text-main)]"
                            >
                              Approve
                            </Button>
                          </PermissionGate>

                          <PermissionGate permission={ENDPOINT_PERMISSIONS.users.APPROVE}>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openReject(user)}
                              className="bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                            >
                              Reject
                            </Button>
                          </PermissionGate>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-[#6b7280]">
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

      <ApproveUserDialog
        open={dialog.type === "approve"}
        onOpenChange={(open) => {
          if (!open) dismissDialog()
        }}
        user={approveUser}
        roles={roles}
        rolesLoading={rolesLoading}
        rolesErrored={rolesErrored}
        onApproved={handleAfterApprove}
      />

      <RejectUserDialog
        open={dialog.type === "reject"}
        onOpenChange={(open) => {
          if (!open) dismissDialog()
        }}
        user={rejectUser}
        onRejected={handleAfterReject}
      />
    </div>
  )
}