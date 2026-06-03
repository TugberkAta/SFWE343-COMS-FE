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
      <DialogContent className="bg-white border border-[#e5e7eb] shadow-lg rounded-lg dark:bg-[var(--layer-1)] dark:border-[var(--layer-2-border)]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#111827] dark:text-[var(--text-main)]">Assign Role</DialogTitle>
          <DialogDescription className="text-[#6b7280] dark:text-[var(--text-secondary)]">
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
                  <FormLabel className="text-[#111827] font-medium">Role</FormLabel>

                  {rolesLoading ? (
                    <p className="text-sm text-[#6b7280]">
                      Loading roles…
                    </p>
                  ) : rolesErrored ? (
                    <p className="text-sm text-red-600">
                      Could not load roles. Refresh the page and try again.
                    </p>
                  ) : roles.length === 0 ? (
                    <p className="text-sm text-[#6b7280]">
                      No roles available.
                    </p>
                  ) : (
                    <Select
                      value={String(field.value ?? "")}
                      onValueChange={(v) => field.onChange(Number(v))}
                      disabled={form.formState.isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full bg-white border border-[#e5e7eb] rounded-lg text-[#111827] focus:border-[#ef233c] focus:ring-2 focus:ring-[#fff1f2] dark:bg-[var(--layer-2)] dark:border-[var(--layer-2-border)] dark:text-[var(--text-main)] dark:focus:border-[var(--text-main)] dark:focus:ring-[var(--text-main)]">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent className="bg-white border border-[#e5e7eb] rounded-lg dark:bg-[var(--layer-1)] dark:border-[var(--layer-2-border)]">
                        {roles.map((role) => (
                          <SelectItem
                            key={role.userRoleId}
                            value={String(role.userRoleId)}
                            className="text-[#111827] hover:bg-[#fff1f2] focus:bg-[#fff1f2]"
                          >
                            {role.userRole}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleDismiss}
                disabled={form.formState.isSubmitting}
                className="border border-[#e5e7eb] text-[#111827] hover:bg-[#f8f8f8] rounded-lg dark:border-[var(--layer-2-border)] dark:text-[var(--text-main)] dark:hover:bg-[var(--layer-2)]"
              >
                Cancel
              </Button>

              <PermissionGate permission={ENDPOINT_PERMISSIONS.users.EDIT}>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting || !canSubmit}
                  className="bg-[#ef233c] hover:bg-[#e60012] text-white rounded-lg font-medium disabled:opacity-50 dark:text-[var(--text-main)]"
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
