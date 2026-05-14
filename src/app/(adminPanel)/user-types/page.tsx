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
        <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (errored) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <TriangleAlertIcon className="mx-auto size-12 text-destructive" />
          <p className="text-muted-foreground">Error loading user types</p>
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
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">User Types</h1>
          <p className="text-sm text-muted-foreground">
            Manage user types and assign permissions to roles.
          </p>
        </div>

        <PermissionGate permission={ENDPOINT_PERMISSIONS.userTypes.WRITE}>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 size-4" />
            Create User Type
          </Button>
        </PermissionGate>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>User Types</CardTitle>
          <CardDescription>
            {userTypes.length} user type{userTypes.length !== 1 ? "s" : ""} available
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader className="bg-background/30">
                <TableRow className="border-b hover:bg-muted/50">
                  <TableHead className="h-12 px-4 text-left font-medium">Name</TableHead>
                  <TableHead className="h-12 px-4 text-left font-medium">Permissions</TableHead>
                  <TableHead className="h-12 px-4 text-right font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {userTypes.length ? (
                  userTypes.map((userType) => (
                    <TableRow key={userType.userTypeId} className="border-b hover:bg-muted/50">
                      <TableCell className="p-4 font-medium">{userType.userType}</TableCell>
                      <TableCell className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {userType.permissions.slice(0, 3).map((perm) => (
                            <span
                              key={perm}
                              className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary border border-primary/20"
                            >
                              {perm}
                            </span>
                          ))}
                          {userType.permissions.length > 3 && (
                            <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
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
                            >
                              <Pencil className="size-4" />
                            </Button>
                          </PermissionGate>

                          <PermissionGate permission={ENDPOINT_PERMISSIONS.userTypes.DELETE}>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setDeleteDialog({ open: true, userType })}
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
                    <TableCell colSpan={3} className="p-6 text-center text-muted-foreground">
                      No user types found. Create one to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete User Type?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The user type "{deleteDialog.userType?.userType}" will be permanently removed.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, userType: null })}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
