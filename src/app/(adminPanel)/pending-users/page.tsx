"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Authentication from "@/services/auth/authentication"

const authentication = new Authentication()

type Role = "Teacher" | "Student" | "Manager" | "Admin"

type PendingUser = {
  id: number
  name: string
  surname: string
  email: string
  role: Role
}

const initialData: PendingUser[] = [
  {
    id: 1,
    name: "Ahmet",
    surname: "Yılmaz",
    email: "ahmet@example.com",
    role: "Teacher",
  },
  {
    id: 2,
    name: "Ayşe",
    surname: "Demir",
    email: "ayse@example.com",
    role: "Student",
  },
]

export default function PendingUsersPage() {
  const [data, setData] = React.useState<PendingUser[]>(initialData)
  const [search, setSearch] = React.useState("")
  const [approveDialogOpen, setApproveDialogOpen] = React.useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = React.useState(false)
  const [activeUser, setActiveUser] = React.useState<PendingUser | null>(null)
  const [selectedRole, setSelectedRole] = React.useState<Role>("Teacher")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const filteredData = data.filter(
    (item) =>
      item.email.toLowerCase().includes(search.toLowerCase()) ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.surname.toLowerCase().includes(search.toLowerCase())
  )

  const openApproveDialog = (user: PendingUser) => {
    setActiveUser(user)
    setSelectedRole(user.role)
    setApproveDialogOpen(true)
  }

  const openRejectDialog = (user: PendingUser) => {
    setActiveUser(user)
    setRejectDialogOpen(true)
  }

  const closeApproveDialog = () => {
    if (isSubmitting) return
    setApproveDialogOpen(false)
    setActiveUser(null)
  }

  const closeRejectDialog = () => {
    if (isSubmitting) return
    setRejectDialogOpen(false)
    setActiveUser(null)
  }

  const handleApprove = async () => {
    if (!activeUser) return

    try {
      setIsSubmitting(true)

      const token = authentication.getAccessToken() // ✅ cookie'den oku
      if (!token) {
        toast.error("Authentication token not found.")
        return
      }

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

      const response = await fetch(`${API_BASE_URL}/approve-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: activeUser.id,
          role: selectedRole,
        }),
      })

      let result = null
      try {
        result = await response.json()
      } catch {}

      if (!response.ok) {
        toast.error(result?.message || "Approve request failed.")
        return
      }

      toast.success("User approved successfully.")
      setData((prev) => prev.filter((user) => user.id !== activeUser.id))
      setApproveDialogOpen(false)
      setActiveUser(null)
    } catch (error) {
      console.error("Approve error:", error)
      toast.error("Something went wrong while approving the user.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!activeUser) return

    try {
      setIsSubmitting(true)
      setData((prev) => prev.filter((user) => user.id !== activeUser.id))
      setRejectDialogOpen(false)
      setActiveUser(null)
      toast.success("User rejected successfully.")
    } catch (error) {
      console.error("Reject error:", error)
      toast.error("Something went wrong while rejecting the user.")
    } finally {
      setIsSubmitting(false)
    }
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

      <Card className="border-border bg-background">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center py-2">
            <Input
              placeholder="Filter emails, names or surnames..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="rounded-md border">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b hover:bg-muted/50">
                  <th className="h-12 px-4 text-left font-medium">Name</th>
                  <th className="h-12 px-4 text-left font-medium">Surname</th>
                  <th className="h-12 px-4 text-left font-medium">Email</th>
                  <th className="h-12 px-4 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredData.length ? (
                  filteredData.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">{user.name}</td>
                      <td className="p-4">{user.surname}</td>
                      <td className="p-4 text-muted-foreground">{user.email}</td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" onClick={() => openApproveDialog(user)}>
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openRejectDialog(user)}
                          >
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-muted-foreground">
                      No results.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve user</DialogTitle>
            <DialogDescription>
              {activeUser
                ? `Select a role for ${activeUser.name} ${activeUser.surname} (${activeUser.email}) before approving.`
                : "Select a role before approving this user."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <label className="text-sm font-medium">Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as Role)}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="Teacher">Teacher</option>
              <option value="Student">Student</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeApproveDialog} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject user</DialogTitle>
            <DialogDescription>
              {activeUser
                ? `${activeUser.name} ${activeUser.surname} will be unable to access the system if rejected. Are you sure you want to continue?`
                : "This user will be unable to access the system if rejected. Are you sure you want to continue?"}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={closeRejectDialog} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}