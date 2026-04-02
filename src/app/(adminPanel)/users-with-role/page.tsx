"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import useFetchData from "@/hooks/use-fetch-data"
import getUsersWithRole from "@/services/users/users-with-role"
import type { UserWithRole } from "@/types/user-with-role"
import { Loader2Icon, TriangleAlertIcon } from "lucide-react"

function fullName(user: UserWithRole) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || "—"
}

export default function UsersWithRolePage() {
  const [search, setSearch] = React.useState("")

  const [loading, errored, usersData] = useFetchData(
    () => getUsersWithRole(),
    []
  )

  if (loading) {
    return <Loader2Icon className="size-4 animate-spin" />
  }

  if (errored) {
    return <TriangleAlertIcon className="size-4 text-destructive" />
  }

  const users = usersData.users ?? []

  const filteredData = users.filter((item: UserWithRole) => {
    const q = search.toLowerCase()
    return (
      item.email.toLowerCase().includes(q) ||
      fullName(item).toLowerCase().includes(q) ||
      (item.userRole ?? "").toLowerCase().includes(q)
    )
  })

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">
            All registered users that already have a role assigned.
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
              placeholder="Filter by name, email, or role…"
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
                  <th className="h-12 px-4 text-left font-medium">Role</th>
                  <th className="h-12 px-4 text-left font-medium">Joined</th>
                </tr>
              </thead>

              <tbody>
                {!loading && !errored && filteredData.length ? (
                  filteredData.map((user: UserWithRole) => (
                    <tr
                      key={user.userId}
                      className="border-b hover:bg-muted/50 bg-background/30"
                    >
                      <td className="p-4 font-medium">{fullName(user)}</td>
                      <td className="p-4 text-muted-foreground">{user.email}</td>
                      <td className="p-4 text-muted-foreground">
                        {user.userRole || "—"}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleString()
                          : "—"}
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
    </div>
  )
}
