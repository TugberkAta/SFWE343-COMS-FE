"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import patchUserRole from "@/services/users/patch-user-role"
import type { UserRoleRecord } from "@/types/user-role"
import type { UserWithRole } from "@/types/user-with-role"
import { PermissionGate } from "@/components/PermissionGate"
import { ENDPOINT_PERMISSIONS } from "@/constants/permissions"

const assignRoleFormSchema = z.object({
  userRoleId: z.number().int().positive(),
})

type AssignRoleFormValues = z.infer<typeof assignRoleFormSchema>

function displayName(user: UserWithRole) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || "—"
}

type AssignRoleDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserWithRole | null
  roles: UserRoleRecord[]
  rolesLoading: boolean
  rolesErrored: boolean
  onAssigned: () => Promise<void>
}

export function AssignRoleDialog({
  open,
  onOpenChange,
  user,
  roles,
  rolesLoading,
  rolesErrored,
  onAssigned,
}: AssignRoleDialogProps) {
  const form = useForm<AssignRoleFormValues>({
    resolver: zodResolver(assignRoleFormSchema),
    defaultValues: {
      userRoleId: undefined,
    },
  })

  React.useEffect(() => {
    if (open && user) {
      // Find the role ID from the role name if available
      const currentRoleId = roles.find((r) => r.userRole === user.userRole)?.userRoleId
      form.reset({
        userRoleId: currentRoleId,
      })
    } else {
      form.reset()
    }
  }, [open, user, roles, form])

  const onSubmit = async (data: AssignRoleFormValues) => {
    if (!user) return
    try {
      await patchUserRole(user.userId, {
        userRoleId: data.userRoleId,
      })
      await onAssigned()
      onOpenChange(false)
    } catch (error) {
      console.error("Assign role error:", error)
    }
  }

  const handleDismiss = () => {
    form.reset()
    onOpenChange(false)
  }

  const canSubmit =
    !rolesLoading && !rolesErrored && roles.length > 0 && user !== null

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleDismiss()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Role</DialogTitle>
          <DialogDescription>
            {user
              ? `Select a role for ${displayName(user)} (${user.email}).`
              : "Select a role for this user."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form} key={user?.userId ?? "closed"}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userRoleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>

                  {rolesLoading ? (
                    <p className="text-sm text-muted-foreground">
                      Loading roles…
                    </p>
                  ) : rolesErrored ? (
                    <p className="text-sm text-destructive">
                      Could not load roles. Refresh the page and try again.
                    </p>
                  ) : roles.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No roles available.
                    </p>
                  ) : (
                    <Select
                      value={String(field.value ?? "")}
                      onValueChange={(v) => field.onChange(Number(v))}
                      disabled={form.formState.isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem
                            key={role.userRoleId}
                            value={String(role.userRoleId)}
                          >
                            {role.userRole}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleDismiss}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>

              <PermissionGate permission={ENDPOINT_PERMISSIONS.users.EDIT}>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting || !canSubmit}
                >
                  {form.formState.isSubmitting ? "Assigning..." : "Assign"}
                </Button>
              </PermissionGate>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
