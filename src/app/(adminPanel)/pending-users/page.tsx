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

  const [loading, errored, usersData, refetch] = useFetchData(
    () => getUsersWithNoRole(),
    []
  )

  const [rolesLoading, rolesErrored, rolesData] = useFetchData(
    () => getUserRoles(),
    []
  )

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

  const approveUser =
    dialog.type === "approve" ? dialog.user : null
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
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">User Requests</h1>
          <p className="text-sm text-muted-foreground">
            Approve or reject incoming user requests.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border px-3 py-1">
          <span className="text-xs text-muted-foreground">Pending</span>
          <span className="text-sm font-semibold">{filteredData.length}</span>
        </div>
      </div>

      <Card className="border-border">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center py-2">
            <Input
              placeholder="Filter emails or names..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
              disabled={loading || errored}
            />
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading users…</p>
          ) : errored ? (
            <p className="text-sm text-destructive">
              Could not load users. Check that you are signed in as an admin and
              try again.
            </p>
          ) : null}

          <div className="border rounded-md overflow-hidden">
            <table className="w-full caption-bottom text-sm rounded-md">
              <thead className="[&_tr]:border-b bg-background/30">
                <tr className="border-b hover:bg-muted/50">
                  <th className="h-12 px-4 text-left font-medium">Name</th>
                  <th className="h-12 px-4 text-left font-medium">Email</th>
                  <th className="h-12 px-4 text-left font-medium">Joined</th>
                  <th className="h-12 px-4 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {!loading && !errored && filteredData.length ? (
                  filteredData.map((user: UserWithNoRole) => (
                    <tr key={user.userId} className="border-b hover:bg-muted/50 bg-background/30">
                      <td className="p-4 font-medium">{fullName(user)}</td>
                      <td className="p-4 text-muted-foreground">{user.email}</td>
                      <td className="p-4 text-muted-foreground">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleString()
                          : "—"}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => openApprove(user)}
                          >
                            Approve
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openReject(user)}
                          >
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-6 text-center text-muted-foreground"
                    >
                      {loading
                        ? "Loading…"
                        : errored
                          ? "Failed to load data."
                          : "No results."}
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
