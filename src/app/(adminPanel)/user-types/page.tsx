"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Plus, Trash2, Loader2Icon, TriangleAlertIcon } from "lucide-react"
import useFetchData from "@/hooks/use-fetch-data"
import { getUserTypes, deleteUserType } from "@/services/user-types"
import { UserTypeDialog } from "./user-type-dialog"
import { usePermission } from "@/hooks/use-permission"
import { ENDPOINT_PERMISSIONS } from "@/constants/permissions"
import { PermissionGate } from "@/components/PermissionGate"
import { PermissionProtectedPage } from "@/components/PermissionProtectedPage"
import type { UserType } from "@/types/user-type"

type DeleteDialog = {
  open: boolean
  userType: UserType | null
}

export default function UserTypesPage() {
  const { hasPermission } = usePermission()
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [editDialog, setEditDialog] = React.useState<{ open: boolean; userType: UserType | null }>({
    open: false,
    userType: null,
  })
  const [deleteDialog, setDeleteDialog] = React.useState<DeleteDialog>({
    open: false,
    userType: null,
  })
  const [isDeleting, setIsDeleting] = React.useState(false)

  const [loading, errored, data, refetch] = useFetchData(getUserTypes)

  // 🔥 PAGE PROTECTION
  if (!hasPermission(ENDPOINT_PERMISSIONS.userTypes.READ)) {
    return <PermissionProtectedPage />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2Icon className="size-8 animate-spin text-[#6b7280]" />
      </div>
    )
  }

  if (errored) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <TriangleAlertIcon className="mx-auto size-12 text-red-600" />
          <p className="text-[#6b7280]">Error loading user types</p>
        </div>
      </div>
    )
  }

  const userTypes = data.userTypes || []

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.userType) return
    try {
      setIsDeleting(true)
      await deleteUserType(deleteDialog.userType.userTypeId)
      await refetch()
      setDeleteDialog({ open: false, userType: null })
    } catch (error) {
      console.error("Error deleting user type:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="w-full p-6 space-y-6 bg-[#f8f8f8] min-h-screen">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-[#111827]">User Types</h1>
          <p className="text-sm text-[#6b7280]">
            Manage user types and assign permissions to roles.
          </p>
        </div>

        <PermissionGate permission={ENDPOINT_PERMISSIONS.userTypes.WRITE}>
          <Button 
            onClick={() => setCreateDialogOpen(true)}
            className="bg-[#ef233c] hover:bg-[#e60012] text-white rounded-lg font-medium dark:text-[var(--text-main)]"
          >
            <Plus className="mr-2 size-4" />
            Create User Type
          </Button>
        </PermissionGate>
      </div>

      <div className="bg-white rounded-lg border border-[#e5e7eb] shadow-sm">
        <div className="px-6 py-4 border-b border-[#e5e7eb]">
          <h3 className="text-lg font-semibold text-[#111827]">User Types</h3>
          <p className="text-sm text-[#6b7280] mt-1">
            {userTypes.length} user type{userTypes.length !== 1 ? "s" : ""} available
          </p>
        </div>

        <div className="border-t border-[#e5e7eb] rounded-b-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-[#f8f8f8]">
              <TableRow className="border-b border-[#e5e7eb]">
                <TableHead className="h-12 px-4 text-left font-semibold text-[#111827]">Name</TableHead>
                <TableHead className="h-12 px-4 text-left font-semibold text-[#111827]">Permissions</TableHead>
                <TableHead className="h-12 px-4 text-right font-semibold text-[#111827]">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {userTypes.length ? (
                userTypes.map((userType) => (
                  <TableRow key={userType.userTypeId} className="border-b border-[#e5e7eb] hover:bg-[#f8f8f8]">
                    <TableCell className="p-4 font-medium text-[#111827]">{userType.userType}</TableCell>
                    <TableCell className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {userType.permissions.slice(0, 3).map((perm) => (
                          <span
                            key={perm}
                            className="inline-flex items-center rounded-full bg-[#fff1f2] px-2 py-1 text-xs font-medium text-[#ef233c] border border-[#fce4ec] dark:bg-[var(--layer-1)] dark:border-[var(--layer-2-border)] dark:text-[var(--text-main)]"
                          >
                            {perm}
                          </span>
                        ))}
                        {userType.permissions.length > 3 && (
                          <span className="inline-flex items-center rounded-full bg-[#f3f4f6] px-2 py-1 text-xs font-medium text-[#6b7280]">
                            +{userType.permissions.length - 3}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="p-4">
                      <div className="flex justify-end gap-2">
                        <PermissionGate permission={ENDPOINT_PERMISSIONS.userTypes.EDIT}>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setEditDialog({ open: true, userType })}
                            className="text-[#ef233c] hover:bg-[#fff1f2] dark:text-[var(--text-main)] dark:hover:bg-[var(--layer-2)]"
                          >
                            <Pencil className="size-4" />
                          </Button>
                        </PermissionGate>

                        <PermissionGate permission={ENDPOINT_PERMISSIONS.userTypes.DELETE}>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeleteDialog({ open: true, userType })}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </PermissionGate>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="p-6 text-center text-[#6b7280]">
                    No user types found. Create one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <UserTypeDialog
        open={createDialogOpen || editDialog.open}
        onOpenChange={(open) => {
          setCreateDialogOpen(open && !editDialog.userType)
          if (editDialog.userType) {
            setEditDialog({ open, userType: editDialog.userType })
          }
        }}
        userType={editDialog.userType}
        onSuccess={async () => {
          await refetch()
          setCreateDialogOpen(false)
          setEditDialog({ open: false, userType: null })
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setDeleteDialog({ open: false, userType: null })
          }
        }}
      >
        <DialogContent className="sm:max-w-md bg-white border border-[#e5e7eb] rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-[#111827]">Delete User Type?</DialogTitle>
            <DialogDescription className="text-[#6b7280]">
              This action cannot be undone. The user type "{deleteDialog.userType?.userType}" will be permanently removed.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, userType: null })}
              disabled={isDeleting}
              className="border border-[#e5e7eb] text-[#111827] hover:bg-[#f8f8f8]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
